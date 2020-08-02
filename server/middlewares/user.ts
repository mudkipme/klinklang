import { Middleware } from 'koa'
import { CustomState, CustomContext } from '../lib/context'
import User from '../models/user'
import logger from '../lib/logger'

const userMiddleware = (): Middleware<CustomState, CustomContext> => async (ctx, next): Promise<void> => {
  if (ctx.session.userId !== undefined) {
    try {
      const user = await User.findByPk(ctx.session.userId)
      ctx.state.user = user === null ? undefined : user
    } catch (e) {
      logger.warn(e)
    }
  }
  await next()
}

export default userMiddleware
