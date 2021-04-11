import { Predicate } from 'json-predicate'

export type WorkflowTrigger =
| {
  type: 'TRIGGER_EVENTBUS'
  topic: string
  predicate?: Predicate
}
| {
  type: 'TRIGGER_CRON'
  pattern: string
}
