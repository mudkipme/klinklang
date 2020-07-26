import { Middleware } from 'koa'
import { Context } from '../lib/context'
import User from '../models/user'
import logger from '../lib/logger'

const userMiddleware = (): Middleware => async (ctx: Context, next): Promise<void> => {
  if (ctx.session === undefined) {
    await next()
    return
  }
  if (ctx.session.userId !== undefined) {
    try {
      const user = await User.findOne({ where: { id: ctx.session.userId } })
      ctx.state.user = user !== null ? user : undefined
    } catch (e) {
      logger.warn(e)
    }
  }
  await next()
}

export default userMiddleware
