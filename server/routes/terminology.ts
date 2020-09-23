import Router from '@koa/router'
import { replace } from '../services/terminology'
import { CustomState, CustomContext } from '../lib/context'

const terminologyRouter = new Router<CustomState, CustomContext>({ prefix: '/api/terminology' })

terminologyRouter.post('/replace', async (ctx) => {
  const text = await replace(ctx.request.body)
  ctx.body = { text }
})

export default terminologyRouter
