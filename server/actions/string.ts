import safe from 'safe-regex'
import { ActionWorker } from './base'

export interface RegExpActionInput {
  text: string
  pattern: string
  flags?: string
}

export interface RegExpActionOutput {
  matches: string[] | string[][]
}

export interface RegExpAction {
  actionType: 'REGEXP_MATCH'
  input: RegExpActionInput
  output: RegExpActionOutput
}

export class RegexWorker extends ActionWorker<RegExpAction> {
  public async process (): Promise<RegExpActionOutput> {
    const regex = new RegExp(this.input.pattern, this.input.flags)
    if (!safe(regex)) {
      throw new Error('UNSAFE_REGEX')
    }
    if (regex.global) {
      const allMatch = Array.from(this.input.text.matchAll(regex))
      return {
        matches: allMatch.map(result => Array.from(result))
      }
    }
    return {
      matches: Array.from(this.input.text.match(regex) ?? [])
    }
  }
}
