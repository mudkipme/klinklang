import { stat, readFile } from 'fs/promises'
import { join } from 'path'
import yaml from 'js-yaml'
import Workflow from '../models/workflow'
import Action, { ActionAttributes } from '../models/action'
import { sequelize } from '../lib/database'
import { Actions } from '../actions/interfaces'
import { WorkflowTrigger } from '../models/workflow-type'
import config from '../lib/config'
import User from '../models/user'

export interface WorkflowConfig {
  name: string
  isPrivate: boolean
  enabled: boolean
  user?: string
  triggers: WorkflowTrigger[]
  actions: Array<Omit<ActionAttributes<Actions>, 'isHead' | 'id'>>
}

export async function setupWorkflow (workflowConfig: WorkflowConfig): Promise<void> {
  let workflow = await Workflow.findOne({ where: { name: workflowConfig.name } })

  if (workflow === null || workflow === undefined) {
    const transaction = await sequelize.transaction()

    workflow = await Workflow.create({
      name: workflowConfig.name,
      isPrivate: workflowConfig.isPrivate,
      enabled: workflowConfig.enabled,
      triggers: workflowConfig.triggers
    }, { transaction })

    const actions: Array<Action<Actions>> = []

    for (const [index, actionConfig] of workflowConfig.actions.entries()) {
      actions.push(await Action.create({
        ...actionConfig,
        isHead: index === 0
      }, { transaction }))
    }

    for (let index = 0; index < actions.length - 1; index++) {
      await actions[index].setNextAction(actions[index + 1], { transaction })
    }

    await workflow.addActions(actions, { transaction })

    try {
      await transaction.commit()
    } catch (e) {
      await transaction.rollback()
    }
  }

  if (workflowConfig.user !== undefined) {
    const user = await User.findOne({ where: { name: workflowConfig.user } })
    if (user !== null && user !== undefined) {
      await workflow.setUser(user)
    }
  }
}

export default async function bootstrap (): Promise<void> {
  try {
    const filename = join(process.env.WORKSPACE_ROOT_PATH ?? '.', config.get('app').bootstrap)
    const stats = await stat(filename)
    if (!stats.isFile()) {
      return
    }

    const content = await readFile(filename, { encoding: 'utf-8' })
    const workflows = yaml.loadAll(content) as WorkflowConfig[]
    for (const workflowConfig of workflows) {
      await setupWorkflow(workflowConfig)
    }
  } catch (e) {
    console.log(e)
  }
}
