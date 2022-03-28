import { promisify } from 'util'
import { isEqual } from 'lodash'
import { KafkaConsumer, Message } from 'node-rdkafka'
import { test as jsonTest } from 'json-predicate'
import config from './config'
import logger from './logger'
import { Workflow } from '@mudkipme/klinklang-prisma'
import notification, { MessageType } from './notification'
import { prisma } from './database'
import { WorkflowTrigger } from '../models/workflow-type'
import { createInstanceWithWorkflow } from '../models/workflow'

const delay = async (ms: number): Promise<NodeJS.Timeout> => await new Promise(resolve => setTimeout(resolve, ms))

export default class Subscriber {
  #consumer: KafkaConsumer | undefined
  #topics = new Map<string, Workflow[]>()
  #stopped = true

  public async updateAndSubscribe (workflows: Workflow[]): Promise<void> {
    const topics = new Map<string, Workflow[]>()

    for (const workflow of workflows) {
      for (const trigger of workflow.triggers as WorkflowTrigger[]) {
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
        logger.error(e)
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
      for (const trigger of workflow.triggers as WorkflowTrigger[]) {
        if (trigger.type === 'TRIGGER_EVENTBUS' && trigger.topic === msg.topic && (trigger.predicate === undefined || jsonTest(event, trigger.predicate))) {
          await createInstanceWithWorkflow(workflow, trigger, event)
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
        const workflows = await prisma.workflow.findMany({
          where: {
            triggers: {
              array_contains: [{ type: 'TRIGGER_EVENTBUS' }]
            }
          }
        })
        await subscriber.updateAndSubscribe(workflows)
      } catch (e) {
        logger.error(e)
      }
    })
    await updating
  }

  await update()

  prisma.$use(async (params, next) => {
    const result = await next(params)

    if (params.model === 'Workflow') {
      switch (params.action) {
        case 'create':
        case 'createMany':
        case 'delete':
        case 'deleteMany':
        case 'update':
        case 'updateMany':
          await notification.sendMessage({ type: 'WORKFLOW_EVENTBUS_UPDATE' })
      }
    }

    return result
  })

  notification.on('notification', (e: MessageType) => {
    if (e.type === 'WORKFLOW_EVENTBUS_UPDATE') {
      update().catch(err => {
        logger.error(err)
      })
    }
  })
}
