import { Model, DataTypes, Optional, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin } from 'sequelize'
import { sequelize } from '../lib/database'
import Action from './action'
import { WorkflowTrigger } from './workflow-type'
import WorkflowInstance from './workflow-instance'
import User from './user'

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

  public getActions!: HasManyGetAssociationsMixin<Action>
  public getUser!: BelongsToGetAssociationMixin<User>

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public async getInstances (start = 0, stop = 100): Promise<WorkflowInstance[]> {
    return await WorkflowInstance.getInstancesOfWorkflow(this.id, start, stop)
  }

  public async getHeadAction (): Promise<Action | undefined> {
    const actions = await this.getActions({ where: { isHead: true } })
    return actions[0]
  }

  public async createInstance (trigger?: WorkflowTrigger): Promise<WorkflowInstance> {
    const headAction = await this.getHeadAction()
    if (headAction === undefined || headAction === null) {
      throw new Error('ERR_ACTION_NOT_FOUND')
    }
    return await WorkflowInstance.create(headAction, trigger)
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

Action.belongsTo(Workflow)
Workflow.hasMany(Action)
Workflow.belongsTo(User)

export default Workflow
