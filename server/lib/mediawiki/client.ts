import fetch, { BodyInit } from 'node-fetch'
import createError from 'http-errors'
import OAuth, { Token } from 'oauth-1.0a'
import { ParseResponse, QueryRevisionResponse, QueryTokenResponse } from './api'

export interface MediaWikiClientOptions {
  apiRoot: string
  token?: OAuth.Token
  oauth?: OAuth
}

interface RequestOptions {
  params: URLSearchParams
  method: 'GET' | 'POST'
  body?: BodyInit
}

class MediaWikiClient {
  readonly #apiRoot: string
  readonly #oauth: OAuth | undefined
  readonly #token: Token | undefined
  public constructor (options: MediaWikiClientOptions) {
    this.#apiRoot = options.apiRoot
    this.#oauth = options.oauth
    this.#token = options.token
  }

  private async makeRequest<Response>({ params, method, body }: RequestOptions): Promise<Response> {
    const url = new URL(this.#apiRoot)
    url.searchParams.set('format', 'json')
    url.searchParams.set('formatversion', '2')

    for (const [name, value] of params) {
      url.searchParams.append(name, value)
    }

    const headers = this.#oauth !== undefined ? this.#oauth.toHeader(this.#oauth.authorize({
      url: url.toString(),
      data: body,
      method
    }, this.#token)) as unknown as Record<string, string> : undefined

    const response = await fetch(url.toString(), {
      method,
      body,
      headers
    })

    if (response.status >= 300 || response.status < 200) {
      throw createError(response.status, await response.text())
    }

    const json = await response.json()
    return json as Response
  }

  private async queryToken (type = 'csrf'): Promise<QueryTokenResponse> {
    const params = new URLSearchParams()
    params.set('action', 'query')
    params.set('meta', 'tokens')
    params.set('type', type)
    return await this.makeRequest({ method: 'GET', params })
  }

  public async parse (page: string, variant?: string): Promise<ParseResponse> {
    const params = new URLSearchParams()
    params.set('action', 'parse')
    params.set('page', page)
    params.set('prop', 'text')
    variant !== undefined && params.set('variant', variant)
    return await this.makeRequest({ method: 'GET', params })
  }

  public async queryRevision (titles: string[]): Promise<QueryRevisionResponse> {
    const params = new URLSearchParams()
    params.set('action', 'query')
    params.set('prop', 'revisions')
    params.set('titles', titles.join('|'))
    params.set('rvslots', '*')
    params.set('rvprop', 'content')
    return await this.makeRequest({ method: 'GET', params })
  }
}

export default MediaWikiClient
