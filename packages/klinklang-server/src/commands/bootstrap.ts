import { stat, readFile } from 'fs/promises'
import { join } from 'path'
import yaml from 'js-yaml'
import { Prisma } from '@mudkipme/klinklang-prisma'
import { WorkflowTrigger } from '../models/workflow-type'
import config from '../lib/config'
import { prisma } from '../lib/database'
import { v4 as uuidv4 } from 'uuid'

export interface WorkflowConfig {
  name: string
  isPrivate: boolean
  enabled: boolean
  user?: string
  triggers: WorkflowTrigger[]
  actions: Array<Omit<Prisma.ActionCreateInput, 'isHead'>>
}

export async function setupWorkflow (workflowConfig: WorkflowConfig): Promise<void> {
  let workflow = await prisma.workflow.findFirst({ where: { name: workflowConfig.name } })

  if (workflow === null || workflow === undefined) {
    const actions: Prisma.ActionCreateInput[] = []

    for (const [index, actionConfig] of workflowConfig.actions.entries()) {
      actions.push({
        ...actionConfig,
        isHead: index === 0,
        id: uuidv4()
      })
      if (index > 0) {
        actions[index - 1].nextAction = {
          connect: { id: actions[index].id }
        }
      }
    }

    workflow = await prisma.workflow.create({
      data: {
        name: workflowConfig.name,
        isPrivate: workflowConfig.isPrivate,
        enabled: workflowConfig.enabled,
        triggers: workflowConfig.triggers as Prisma.InputJsonValue,
        actions: {
          create: actions
        }
      },
      include: { actions: true }
    })
  }

  if (workflowConfig.user !== undefined) {
    const user = await prisma.user.findUnique({ where: { name: workflowConfig.user } })
    if (user !== null && user !== undefined) {
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          userId: user.id
        }
      })
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
