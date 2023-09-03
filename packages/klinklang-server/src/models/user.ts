import { omit } from 'lodash-es'
import { type User } from '@mudkipme/klinklang-prisma'

export function outputUser (user: User): Omit<User, 'token' | 'wikiId'> & { wikiId: string } {
  return {
    ...omit(user, 'token'),
    wikiId: user.wikiId.toString()
  }
}
