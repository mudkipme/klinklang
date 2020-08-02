import { Model, DataTypes, Optional, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize'
import { render } from 'micromustache'
import { sequelize } from '../lib/database'
import type Workflow from './workflow'
import { Actions, ActionJobData } from '../actions/interfaces'

interface ActionAttributes<T extends Actions> {
  id: string
  workflowId: string
  actionType: T['actionType']
  inputBuilder: string
  isHead: boolean
}

type ActionCreationAttributes<T extends Actions> = Optional<ActionAttributes<T>, 'id'>

class Action<T extends Actions = Actions> extends Model<ActionAttributes<T>, ActionCreationAttributes<T>> implements ActionAttributes<T> {
  public id!: string
  public workflowId!: string
  public readonly actionType!: T['actionType']
  public inputBuilder!: string
  public isHead!: boolean

  public getWorkflow!: BelongsToGetAssociationMixin<Workflow>
  public getNextAction!: BelongsToGetAssociationMixin<Action | null>
  public setNextAction!: BelongsToSetAssociationMixin<Action | null, string>

  public buildJobData (instanceId: string, context: Record<string, unknown>): ActionJobData<T> {
    return {
      actionId: this.id,
      actionType: this.actionType,
      workflowId: this.workflowId,
      instanceId: instanceId,
      input: JSON.parse(render(this.inputBuilder, context))
    }
  }
}

Action.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  workflowId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inputBuilder: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  isHead: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize
})

Action.belongsTo(Action, { as: 'nextAction' })

export default Action
