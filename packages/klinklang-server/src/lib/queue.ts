import { Queue } from 'bullmq'
import config from './config'

const queueName = 'klinklang-queue'

export const queue = new Queue(queueName, {
  connection: config.get('redis')
})
