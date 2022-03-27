import { ValidateFunction } from '@hapi/cookie'
import logger from '../lib/logger'
import { prisma } from '../lib/database'

const userMiddleware = (): ValidateFunction => async (_, session) => {
  const sessionData = session as { userId: string } | undefined
  if (sessionData?.userId !== undefined) {
    try {
      const user = await prisma.user.findUnique({ where: { id: sessionData?.userId } })
      if (user === null || user === undefined) {
        return { valid: false }
      }
      return { valid: true, credentials: { user } }
    } catch (e) {
      logger.warn(e)
    }
  }
  return { valid: false }
}

export default userMiddleware
