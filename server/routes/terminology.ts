import Router from '@koa/router'
import { CustomState, CustomContext } from '../lib/context'

const terminologyRouter = new Router<CustomState, CustomContext>({ prefix: '/api/terminology' })

terminologyRouter.post('/replace', async (ctx) => {
})

export default terminologyRouter
