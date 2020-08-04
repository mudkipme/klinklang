import { Worker, Job } from 'bullmq'
import config from './config'
import { processAction } from '../actions/register'
import logger from './logger'

const queueName = 'klinklang-queue'

export const worker = new Worker(queueName, async (job: Job) => {
  return await processAction(job)
}, {
  connection: config.get('redis')
})

worker.on('failed', (job: Job, err: Error) => {
  logger.error(`job ${job.id ?? ''} failed: ${err.message}`)
})
