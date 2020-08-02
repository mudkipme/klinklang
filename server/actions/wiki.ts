import { ActionWorker } from './base'
import MediaWikiClient from '../lib/mediawiki/client'
import { Actions } from './interfaces'
import { defaultClient } from '../lib/wiki'

export interface GetHTMLActionInput {
  title: ''
  variants?: Array<'zh-hans' | 'zh-hant'>
}

export interface GetHTMLActionOutput {
  text: string
  variants?: {'zh-hans'?: string, 'zh-hant'?: string}
}

export interface GetHTMLAction {
  actionType: 'GET_HTML'
  input: GetHTMLActionInput
  output: GetHTMLActionOutput
}

export abstract class WikiWorker<T extends Actions> extends ActionWorker<T> {
  #wikiClient?: MediaWikiClient
  protected async getWikiClient (): Promise<MediaWikiClient> {
    if (this.#wikiClient !== undefined) {
      return this.#wikiClient
    }
    const workflow = await this.getWorkflow()
    const user = await workflow?.getUser()
    if (user === undefined || user === null) {
      return defaultClient
    }
    return user.getWikiClient()
  }
}

export class GetHTMLWorker extends WikiWorker<GetHTMLAction> {
  public async process (): Promise<GetHTMLActionOutput> {
    const client = await this.getWikiClient()
    const promise = client.parse(this.input.title)
    const hansPromise = this.input.variants?.includes('zh-hans') === true ? client.parse(this.input.title, 'zh-hans') : undefined
    const hantPromise = this.input.variants?.includes('zh-hant') === true ? client.parse(this.input.title, 'zh-hant') : undefined
    const [pageDefault, pageHant, pageHans] = await Promise.all([
      promise,
      hantPromise,
      hansPromise
    ])
    return {
      text: pageDefault.parse.text,
      variants: {
        'zh-hans': pageHans?.parse.text,
        'zh-hant': pageHant?.parse.text
      }
    }
  }
}
