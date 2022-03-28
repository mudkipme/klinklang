import { omit } from 'lodash'
import { Token } from 'oauth-1.0a'
import MediaWikiClient from '../lib/mediawiki/client'
import { authedClient } from '../lib/wiki'
import { User } from '@mudkipme/klinklang-prisma'

export function outputUser (user: User): Omit<User, 'token' | 'wikiId'> & { wikiId: string } {
  return {
    ...omit(user, 'token'),
    wikiId: user.wikiId.toString()
  }
}

export function getWikiClientOfUser (user: User): MediaWikiClient {
  return authedClient(user.token as unknown as Token)
}
