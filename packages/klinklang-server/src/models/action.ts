import { render } from 'micromustache'
import { mapValues } from 'lodash'
import { query } from 'jsonpath'
import { Actions, ActionJobData } from '../actions/interfaces'
import { Action } from '.prisma/client'

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

type InputBuilder<T> = T extends object ? { [P in keyof T]: InputBuilder<T[P]> | InputBuildType<T[P]> } : InputBuildType<T>

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

  const nestedBuilder = builder as { [P in keyof T]: InputBuilder<T[P]> | InputBuildType<T[P]> }
  return mapValues(nestedBuilder, (value: InputBuilder<any>) => buildInput(value, context))
}

export function buildJobData<T extends Actions> (action: Action, instanceId: string, context: Record<string, unknown>): ActionJobData<T> {
  return {
    actionId: action.id,
    actionType: action.actionType as T['actionType'],
    workflowId: action.workflowId,
    instanceId,
    input: buildInput(action.inputBuilder as InputBuilder<T['input']>, context)
  }
}
