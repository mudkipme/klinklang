import type { GetHTMLAction, GetTextAction, EditWikiAction } from './wiki'
import type { ParseTerminologyListAction, UpdateTerminologyAction } from './terminology'
import { RegExpAction } from './string'
import { SCSSAction } from './scss'

export type Actions =
  | GetHTMLAction | ParseTerminologyListAction | UpdateTerminologyAction | GetTextAction
  | RegExpAction | SCSSAction | EditWikiAction

export interface ActionJobData<T extends Actions> extends Pick<T, 'actionType' | 'input'> {
  instanceId: string
  workflowId: string
  actionId: string
}

export interface ActionJobResult<T extends Actions> extends Pick<T, 'output'> {
  nextJobId?: string
}
