import MediaWikiClient from './mediawiki/client'
import config from './config'

export const defaultClient = new MediaWikiClient({ apiRoot: config.get('mediawiki').scriptPath + 'api.php' })
