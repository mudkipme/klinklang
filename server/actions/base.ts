import { Job } from 'bullmq'
import { ActionJobData, ActionJobResult, Actions } from './interfaces'
import WorkflowInstance from '../models/workflow-instance'
import Workflow from '../models/workflow'

export type WorkerType<T extends Actions> = new (job: Job<ActionJobData<T>, ActionJobResult<T>>) => ActionWorker<T>

export abstract class ActionWorker<T extends Actions> {
  protected readonly jobId?: string
  protected readonly input: T['input']
  protected readonly workflowId: string
  protected readonly instanceId: string
  protected readonly actionId: string
  #workflow?: Workflow | null

  public constructor (job: Job<ActionJobData<T>, ActionJobResult<T>>) {
    this.jobId = job.id
    this.input = job.data.input
    this.workflowId = job.data.workflowId
    this.instanceId = job.data.instanceId
    this.actionId = job.data.actionId
  }

  protected async getInstance (): Promise<WorkflowInstance | null> {
    return await WorkflowInstance.getInstance(this.workflowId, this.instanceId)
  }

  protected async getWorkflow (): Promise<Workflow | null> {
    if (this.#workflow !== undefined && this.#workflow !== null) {
      return this.#workflow
    }
    const workflow = await Workflow.findByPk(this.workflowId)
    this.#workflow = workflow
    return workflow
  }

  public async handleJob (): Promise<ActionJobResult<T>> {
    const instance = await this.getInstance()
    if (instance === null || instance === undefined) {
      throw new Error('WORKFLOW_INSTANCE_NOT_FOUND')
    }
    await instance.started(this.jobId)
    const output = await this.process()
    await instance.update(output)
    const nextJob = await instance.createNextJob(this.actionId)
    if (nextJob === null) {
      await instance.complete()
    }
    return {
      output,
      nextJobId: nextJob?.id
    }
  }

  public abstract process (): Promise<T['output']>
}
