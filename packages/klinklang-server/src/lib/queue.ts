import { Queue } from 'bullmq'
import { Config } from './config'

const queueName = 'klinklang-queue'

export const getQueue = ({ config }: { config: Config }): Queue => new Queue(queueName, {
  connection: config.get('redis')
})
