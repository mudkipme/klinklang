import { Worker, Job } from 'bullmq'
import config from './config'
import { processAction } from '../actions/register'

const queueName = 'klinklang-queue'

export const worker = new Worker(queueName, async (job: Job) => {
  return await processAction(job)
}, {
  connection: config.get('redis')
})
