import { promisify } from 'util'
import sass from 'node-sass'
import { ActionWorker } from './base'

export interface SCSSActionInput {
  scss: string
  variables: Record<string, string | number>
}

export interface SCSSActionOutput {
  css: string
}

export interface SCSSAction {
  actionType: 'SCSS_COMPILE'
  input: SCSSActionInput
  output: SCSSActionOutput
}

export class SCSSWorker extends ActionWorker<SCSSAction> {
  public async process (): Promise<SCSSActionOutput> {
    const variableText = Object.keys(this.input.variables).map(key => `$${key}: ${this.input.variables[key]};\n`).join('')
    const result = await promisify(sass.render.bind(sass))({
      data: variableText + this.input.scss,
      outputStyle: 'compact'
    })
    return {
      css: result.css.toString('utf-8')
    }
  }
}
