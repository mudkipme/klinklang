import { omit } from 'lodash'
import { User } from '.prisma/client'

export function outputUser (user: User): Omit<User, 'token' | 'wikiId'> & { wikiId: string } {
  return {
    ...omit(user, 'token'),
    wikiId: user.wikiId.toString()
  }
}
