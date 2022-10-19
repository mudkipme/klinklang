import { User } from '.prisma/client'
import OAuth, { Token } from 'oauth-1.0a'
import { Config } from '../lib/config'
import MediaWikiClient from '../lib/mediawiki/client'
import { MediaWikiOAuth } from '../lib/oauth'

export class WikiService {
  #apiRoot: string
  #oauth: OAuth
  readonly defaultClient: MediaWikiClient

  constructor ({ config, mediaWikiOAuth }: { config: Config, mediaWikiOAuth: MediaWikiOAuth }) {
    this.#apiRoot = config.get('mediawiki').scriptPath + 'api.php'
    this.#oauth = mediaWikiOAuth.oauth
    this.defaultClient = new MediaWikiClient({ apiRoot: config.get('mediawiki').scriptPath + 'api.php' })
  }

  authedClient (token: Token): MediaWikiClient {
    return new MediaWikiClient({
      apiRoot: this.#apiRoot,
      oauth: this.#oauth,
      token
    })
  }

  getWikiClientOfUser (user: User): MediaWikiClient {
    return this.authedClient(user.token as unknown as Token)
  }
}
