import { Model, DataTypes, Optional, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin, HasManyAddAssociationsMixin, HasManyAddAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize'
import { keyBy } from 'lodash'
import { sequelize } from '../lib/database'
import Action from './action'
import { WorkflowTrigger } from './workflow-type'
import WorkflowInstance from './workflow-instance'
import User from './user'
import { Actions } from '../actions/interfaces'

interface WorkflowAttributes {
  id: string
  name: string
  isPrivate: boolean
  enabled: boolean
  triggers: WorkflowTrigger[]
}

type WorkflowCreationAttributes = Optional<WorkflowAttributes, 'id'>

class Workflow extends Model<WorkflowAttributes, WorkflowCreationAttributes> implements WorkflowAttributes {
  public id!: string
  public name!: string
  public isPrivate!: boolean
  public enabled!: boolean
  public triggers!: WorkflowTrigger[]

  public getActions!: HasManyGetAssociationsMixin<Action<any>>
  public addAction!: HasManyAddAssociationMixin<Action<any>, string>
  public addActions!: HasManyAddAssociationsMixin<Action<any>, string>
  public getUser!: BelongsToGetAssociationMixin<User>
  public setUser!: BelongsToSetAssociationMixin<User, string>

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public async getInstances (start = 0, stop = 100): Promise<WorkflowInstance[]> {
    return await WorkflowInstance.getInstancesOfWorkflow(this.id, start, stop)
  }

  public async getHeadAction<T extends Actions> (): Promise<Action<T> | undefined> {
    const actions = await this.getActions({ where: { isHead: true } })
    return actions[0]
  }

  public async createInstance (trigger?: WorkflowTrigger, payload?: unknown): Promise<WorkflowInstance> {
    const headAction = await this.getHeadAction()
    if (headAction === undefined || headAction === null) {
      throw new Error('ERR_ACTION_NOT_FOUND')
    }
    return await WorkflowInstance.create(headAction, trigger, payload)
  }

  public async getLinkedActions (): Promise<Array<Action<any>>> {
    const actions = await this.getActions()
    let current = actions.find(action => action.isHead)
    if (current === undefined || current === null) {
      return []
    }

    const actionMap = keyBy(actions, 'id')
    const linkedActions = []
    const visited: {[id: string]: boolean} = {}
    while (current !== undefined) {
      if (visited[current.id]) {
        throw new Error('CIRCULAR_ACTION_FOUND')
      }
      linkedActions.push(current)
      visited[current.id] = true
      current = current.nextActionId !== null ? actionMap[current.nextActionId] : undefined
    }

    return linkedActions
  }
}

Workflow.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  triggers: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  sequelize
})

Workflow.hasMany(Action, {
  foreignKey: 'workflowId'
})
Action.belongsTo(Workflow, { as: 'workflow' })
Workflow.belongsTo(User)

export default Workflow
