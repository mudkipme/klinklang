import { promisify } from 'util'
import { isEqual } from 'lodash'
import { KafkaConsumer, Message } from 'node-rdkafka'
import { test as jsonTest } from 'json-predicate'
import { Op } from 'sequelize'
import config from './config'
import logger from './logger'
import Workflow from '../models/workflow'

const delay = async (ms: number): Promise<NodeJS.Timeout> => await new Promise(resolve => setTimeout(resolve, ms))

export default class Subscriber {
  #consumer: KafkaConsumer | undefined
  #topics = new Map<string, Workflow[]>()
  #stopped = true

  public async updateAndSubscribe (workflows: Workflow[]): Promise<void> {
    const topics = new Map<string, Workflow[]>()

    for (const workflow of workflows) {
      for (const trigger of workflow.triggers) {
        if (trigger.type === 'TRIGGER_EVENTBUS') {
          const entries = topics.get(trigger.topic) ?? []
          entries.push(workflow)
          topics.set(trigger.topic, entries)
        }
      }
    }

    await this.subscribe(Array.from(topics.keys()))
    this.#topics = topics
    logger.info('updated eventbus subscription.', Array.from(this.#topics.entries()))
  }

  private async subscribe (topics: string[]): Promise<void> {
    const topicSet = new Set(topics)
    if (isEqual(new Set(this.#topics.keys()), topicSet)) {
      return
    }
    if (this.#consumer !== undefined) {
      await this.disconnect()
      await delay(1000)
    }
    this.#consumer = new KafkaConsumer(config.get('kafka'), {})
    this.#stopped = false
    this.#consumer.on('ready', () => {
      if (this.#consumer === undefined) {
        return
      }
      logger.info('consumer ready to subscribe ' + topics.join(','))
      this.#consumer.subscribe(topics)
      this.loopMessage().catch(e => logger.error(e))
    })
    this.#consumer.on('event.error', (e) => {
      logger.error(e)
    })
    await promisify(this.#consumer.connect.bind(this.#consumer))(undefined)
  }

  private async loopMessage (): Promise<void> {
    do {
      if (this.#consumer === undefined) {
        return
      }
      try {
        const msgs = await promisify<Message[]>(this.#consumer.consume.bind(this.#consumer, 1))()
        if (msgs.length === 0) {
          continue
        }
        await this.handleMessage(msgs[0])
      } catch (e) {
        logger.error(e.message)
        await delay(1000)
      }
    } while (!this.#stopped)
  }

  private async handleMessage (msg: Message): Promise<void> {
    const data = msg.value?.toString()
    if (data === undefined) {
      return
    }
    const event = JSON.parse(data)
    const workflows = this.#topics.get(msg.topic)

    if (workflows === undefined) {
      return
    }

    const triggered: Record<string, boolean> = {}
    for (const workflow of workflows) {
      if (triggered[workflow.id]) {
        return
      }
      for (const trigger of workflow.triggers) {
        if (trigger.type === 'TRIGGER_EVENTBUS' && trigger.topic === msg.topic && jsonTest(event, trigger.predicate)) {
          await workflow.createInstance(trigger)
          triggered[workflow.id] = true
          break
        }
      }
    }
  }

  public async disconnect (): Promise<void> {
    if (this.#consumer === undefined) {
      return
    }
    this.#stopped = true
    await promisify(this.#consumer.disconnect.bind(this.#consumer))()
    this.#consumer = undefined
  }
}

export async function start (): Promise<void> {
  const subscriber = new Subscriber()

  let updating = Promise.resolve()
  const update = async (): Promise<void> => {
    updating = updating.then(async () => {
      try {
        const workflows = await Workflow.findAll({
          where: {
            triggers: {
              [Op.contains]: [{ type: 'TRIGGER_EVENTBUS' }]
            }
          }
        })
        await subscriber.updateAndSubscribe(workflows)
      } catch (e) {
        logger.error(e.message)
      }
    })
    await updating
  }

  await update()

  Workflow.afterCreate('eventbus', async (workflow) => {
    if (workflow.triggers.some(trigger => trigger.type === 'TRIGGER_EVENTBUS')) {
      await update()
    }
  })

  Workflow.afterBulkCreate('eventbus', async (workflows) => {
    if (workflows.some(workflow => workflow.triggers.some(trigger => trigger.type === 'TRIGGER_EVENTBUS'))) {
      await update()
    }
  })

  Workflow.afterDestroy('eventbus', async (workflow) => {
    if (workflow.triggers.some(trigger => trigger.type === 'TRIGGER_EVENTBUS')) {
      await update()
    }
  })

  Workflow.afterBulkDestroy('eventbus', async () => {
    await update()
  })

  Workflow.afterUpdate('eventbus', async (_, options) => {
    if (options.fields === undefined || options.fields === null || options.fields.includes('triggers')) {
      await update()
    }
  })

  Workflow.afterBulkUpdate('eventbus', async (options) => {
    if (options.fields === undefined || options.fields === null || options.fields.includes('triggers')) {
      await update()
    }
  })
}
