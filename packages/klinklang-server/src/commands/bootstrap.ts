import { stat, readFile } from 'fs/promises'
import { join } from 'path'
import yaml from 'js-yaml'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { type Prisma, type PrismaClient } from '@mudkipme/klinklang-prisma'
import { type WorkflowTrigger } from '../models/workflow-type'
import { type Config } from '../lib/config'
import { v4 as uuidv4 } from 'uuid'

export interface WorkflowConfig {
  name: string
  isPrivate: boolean
  enabled: boolean
  user?: string
  triggers: WorkflowTrigger[]
  actions: Array<Omit<Prisma.ActionCreateInput, 'isHead'>>
}

export async function setupWorkflow (prisma: PrismaClient, workflowConfig: WorkflowConfig): Promise<void> {
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

export default async function bootstrap ({ config, prisma }: { config: Config, prisma: PrismaClient }): Promise<void> {
  try {
    const workspaceRoot = await findWorkspaceDir(process.cwd())
    const filename = join(workspaceRoot ?? '.', config.get('app').bootstrap)
    const stats = await stat(filename)
    if (!stats.isFile()) {
      return
    }

    const content = await readFile(filename, { encoding: 'utf-8' })
    const workflows = yaml.loadAll(content) as WorkflowConfig[]
    for (const workflowConfig of workflows) {
      await setupWorkflow(prisma, workflowConfig)
    }
  } catch (e) {
    console.log(e)
  }
}
