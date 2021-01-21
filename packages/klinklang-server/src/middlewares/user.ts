import { ValidateFunction } from '@hapi/cookie'
import User from '../models/user'
import logger from '../lib/logger'

const userMiddleware = (): ValidateFunction => async (_, session) => {
  const sessionData = session as { userId: string } | undefined
  if (sessionData?.userId !== undefined) {
    try {
      const user = await User.findByPk(sessionData?.userId)
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
