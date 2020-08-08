import { Model, DataTypes, Optional, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize'
import { render } from 'micromustache'
import { mapValues } from 'lodash'
import { query } from 'jsonpath'
import { sequelize } from '../lib/database'
import type Workflow from './workflow'
import { Actions, ActionJobData } from '../actions/interfaces'

type InputBuildType<T> =
| {
  mode: 'rawValue'
  value: T
}
| {
  mode: 'jsonPath'
  jsonPath: string
}
| (T extends string ? {
  mode: 'template'
  template: string
} : never)
| (T extends any[] ? {
  mode: 'jsonPathArray'
  jsonPath: string
} : never)

type InputBuilder<T> = T extends object ? {[P in keyof T]: InputBuilder<T[P]> | InputBuildType<T[P]>} : InputBuildType<T>

interface ActionAttributes<T extends Actions> {
  id: string
  actionType: T['actionType']
  inputBuilder: InputBuilder<T['input']>
  isHead: boolean
}

type ActionCreationAttributes<T extends Actions> = Optional<ActionAttributes<T>, 'id'>

function buildInput<T> (builder: InputBuilder<T>, context: Record<string, unknown>): T {
  const directBuilder = builder as InputBuildType<T>
  if (directBuilder.mode === 'rawValue') {
    return directBuilder.value
  } else if (directBuilder.mode === 'jsonPath') {
    return query(context, directBuilder.jsonPath, 1)[0]
  } else if (directBuilder.mode === 'jsonPathArray') {
    return query(context, directBuilder.jsonPath) as unknown as T
  } else if (directBuilder.mode === 'template') {
    return render(directBuilder.template, context) as unknown as T
  }

  const nestedBuilder = builder as {[P in keyof T]: InputBuilder<T[P]> | InputBuildType<T[P]>}
  return mapValues(nestedBuilder, (value: InputBuilder<any>) => buildInput(value, context))
}

class Action<T extends Actions> extends Model<ActionAttributes<T>, ActionCreationAttributes<T>> implements ActionAttributes<T> {
  public id!: string
  public readonly actionType!: T['actionType']
  public inputBuilder!: InputBuilder<T['input']>
  public isHead!: boolean

  public getWorkflow!: BelongsToGetAssociationMixin<Workflow>
  public getNextAction!: BelongsToGetAssociationMixin<Action<any> | null>
  public setNextAction!: BelongsToSetAssociationMixin<Action<any> | null, string>

  public workflowId!: string
  public nextActionId!: string

  public buildJobData (instanceId: string, context: Record<string, unknown>): ActionJobData<T> {
    return {
      actionId: this.id,
      actionType: this.actionType,
      workflowId: this.workflowId,
      instanceId: instanceId,
      input: buildInput(this.inputBuilder, context)
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
