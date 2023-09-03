import { isEqual } from 'lodash-es'
import { type ConsumerConfig, type Consumer, Kafka, type KafkaConfig, type EachMessagePayload } from 'kafkajs'
import { test as jsonTest } from 'json-predicate'
import { setTimeout } from 'timers/promises'
import { type Logger } from 'pino'
import { type Config } from './config.js'
import { type Workflow, type PrismaClient } from '@mudkipme/klinklang-prisma'
import { type MessageType, type Notification } from './notification.js'
import { type WorkflowTrigger } from '../models/workflow-type.js'
import { createInstanceWithWorkflow } from '../models/workflow.js'

export default class Subscriber {
  #kafka: Kafka
  #consumerConfig: ConsumerConfig
  #consumer: Consumer | undefined
  #topics = new Map<string, Workflow[]>()
  #logger: Logger

  constructor ({ kafkaConfig, consumerConfig, logger }: { kafkaConfig: KafkaConfig, consumerConfig: ConsumerConfig, logger: Logger }) {
    this.#kafka = new Kafka(kafkaConfig)
    this.#consumerConfig = consumerConfig
    this.#logger = logger
  }

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
    this.#logger.info('updated eventbus subscription.', Array.from(this.#topics.entries()))
  }

  private async subscribe (topics: string[]): Promise<void> {
    const topicSet = new Set(topics)
    if (isEqual(new Set(this.#topics.keys()), topicSet)) {
      return
    }
    if (this.#consumer !== undefined) {
      await this.disconnect()
      await setTimeout(1000)
    }
    this.#consumer = this.#kafka.consumer(this.#consumerConfig)
    await this.#consumer.connect()
    this.#logger.info('consumer ready to subscribe ' + topics.join(','))
    await this.#consumer.subscribe({ topics })
    await this.#consumer.run({
      eachMessage: this.handleMessage.bind(this)
    })
  }

  private async handleMessage ({ topic, message }: EachMessagePayload): Promise<void> {
    const data = message.value?.toString()
    if (data === undefined) {
      return
    }
    const event = JSON.parse(data)
    const workflows = this.#topics.get(topic)

    if (workflows === undefined) {
      return
    }

    const triggered: Record<string, boolean> = {}
    for (const workflow of workflows) {
      if (triggered[workflow.id]) {
        return
      }
      for (const trigger of workflow.triggers as WorkflowTrigger[]) {
        if (trigger.type === 'TRIGGER_EVENTBUS' && trigger.topic === topic && (trigger.predicate === undefined || jsonTest(event, trigger.predicate))) {
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
    await this.#consumer.disconnect()
    this.#consumer = undefined
  }
}

export async function start ({ config, prisma, notification, logger }: {
  config: Config
  prisma: PrismaClient
  notification: Notification
  logger: Logger
}): Promise<void> {
  const subscriber = new Subscriber({
    kafkaConfig: { brokers: config.get('kafka').brokers },
    consumerConfig: { groupId: config.get('kafka').groupId },
    logger
  })

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

  notification.on('notification', (e: MessageType) => {
    if (e.type === 'WORKFLOW_EVENTBUS_UPDATE') {
      update().catch(err => {
        logger.error(err)
      })
    }
  })
}
