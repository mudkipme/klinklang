import type { GetHTMLAction } from './wiki'
import type { ParseTerminologyListAction, UpdateTerminologyAction } from './terminology'

export type Actions = GetHTMLAction | ParseTerminologyListAction | UpdateTerminologyAction

export interface ActionJobData<T extends Actions> extends Pick<T, 'actionType' | 'input'> {
  instanceId: string
  workflowId: string
  actionId: string
}

export interface ActionJobResult<T extends Actions> extends Pick<T, 'output'> {
  nextJobId?: string
}
