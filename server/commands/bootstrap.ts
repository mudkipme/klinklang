import Workflow from '../models/workflow'
import Action from '../models/action'

export async function setupUpdateActivityWorkflow (): Promise<void> {
  const name = 'Update Ability term list'
  if (await Workflow.count({ where: { name } }) > 0) {
    return
  }
  const workflow = await Workflow.create({
    name: 'Update Ability term list',
    isPrivate: false,
    enabled: true,
    triggers: []
  })

  const firstAction = await Action.create({
    workflowId: workflow.id,
    actionType: 'GET_HTML',
    isHead: true,
    inputBuilder: '{"title":"特性列表","variants":["zh-hans","zh-hant"]}'
  })
}
