import fetch, { BodyInit } from 'node-fetch'
import { ParseResponse } from './api'

export interface MediaWikiClientOptions {
  apiRoot: string
}

interface RequestOptions {
  params: URLSearchParams
  method: 'GET' | 'POST'
  body?: BodyInit
}

class MediaWikiClient {
  readonly #apiRoot: string
  public constructor (options: MediaWikiClientOptions) {
    this.#apiRoot = options.apiRoot
  }

  private async makeRequest<Response>({ params, method, body }: RequestOptions): Promise<Response> {
    const url = new URL(this.#apiRoot)
    url.searchParams.set('format', 'json')
    url.searchParams.set('formatversion', '2')

    for (const [name, value] of params) {
      url.searchParams.append(name, value)
    }

    const response = await fetch(url.toString(), {
      method,
      body
    })

    const json = await response.json()
    return json as Response
  }

  public async parse (page: string, variant?: string): Promise<ParseResponse> {
    const params = new URLSearchParams()
    params.set('action', 'parse')
    params.set('page', page)
    params.set('prop', 'text')
    variant !== undefined && params.set('variant', variant)
    return await this.makeRequest({ method: 'GET', params })
  }
}

export default MediaWikiClient
