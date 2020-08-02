export type WorkflowTrigger =
| {
  type: 'TRIGGER_EVENTBUS'
  topic: string
}
| {
  type: 'TRIGGER_CRON'
  pattern: string
}
