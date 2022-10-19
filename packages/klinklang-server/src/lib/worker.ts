import { Worker, Job } from 'bullmq'
import { Logger } from 'pino'
import { Config } from './config'
import { processAction } from '../actions/register'

const queueName = 'klinklang-queue'

export const getWorker = ({ config, logger }: { config: Config, logger: Logger }): Worker => {
  const worker = new Worker(queueName, async (job: Job) => {
    return await processAction(job)
  }, {
    connection: config.get('redis'),
    autorun: false
  })

  worker.on('failed', (job: Job, err: Error) => {
    logger.error(`job ${job.id ?? ''} failed: ${err.message}`)
  })
  return worker
}
