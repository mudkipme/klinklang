import { Job } from 'bullmq'
import { WorkerType } from './base'
import { GetHTMLWorker, GetTextWorker } from './wiki'
import { Actions, ActionJobData, ActionJobResult } from './interfaces'
import { ParseTerminologyWorker, UpdateTerminologyWorker } from './terminology'

interface ActionRegisterMap {
  set: <T extends Actions>(key: T['actionType'], value: WorkerType<T>) => void
  get: <T extends Actions>(key: T['actionType']) => WorkerType<T> | null
}

const actionRegisterMap: ActionRegisterMap = new Map()

export async function processAction<T extends Actions> (job: Job<ActionJobData<T>, ActionJobResult<T>>): Promise<ActionJobResult<T>> {
  const ProcessorCreator = actionRegisterMap.get(job.data.actionType)
  if (ProcessorCreator === null) {
    throw new Error('UNKNOWN_ACTION_TYPE')
  }
  const processor = new ProcessorCreator(job)
  return await processor.handleJob()
}

export function register<T extends Actions> (actionType: T['actionType'], processor: WorkerType<T>): void {
  actionRegisterMap.set(actionType, processor)
}

register('GET_HTML', GetHTMLWorker)
register('PARSE_TERMINOLOGY_LIST', ParseTerminologyWorker)
register('UPDATE_TERMINOLOGY', UpdateTerminologyWorker)
register('GET_TEXT', GetTextWorker)
