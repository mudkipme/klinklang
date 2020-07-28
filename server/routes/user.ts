import Router from '@koa/router'
import { CustomState, CustomContext } from '../lib/context'

const userRouter = new Router<CustomState, CustomContext>({ prefix: '/api/user' })

userRouter.get('/me', async (ctx) => {
  ctx.body = {
    user: ctx.state.user === undefined ? null : ctx.state.user
  }
})

export default userRouter
