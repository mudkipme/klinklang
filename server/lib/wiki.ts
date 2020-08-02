import { Token } from 'oauth-1.0a'
import MediaWikiClient from './mediawiki/client'
import config from './config'
import { oauth } from './oauth'

export const defaultClient = new MediaWikiClient({ apiRoot: config.get('mediawiki').scriptPath + 'api.php' })

export const authedClient = (token: Token): MediaWikiClient => {
  return new MediaWikiClient({
    apiRoot: config.get('mediawiki').scriptPath + 'api.php',
    oauth,
    token
  })
}
