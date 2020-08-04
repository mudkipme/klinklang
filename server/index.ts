import Koa from 'koa'
import compress from 'koa-compress'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import error from 'koa-json-error'
import session from 'koa-session'
import redisStore from 'koa-redis'
import config from './lib/config'
import logger from './lib/logger'
import oauth from './routes/oauth'
import userRouter from './routes/user'
import workflowRouter from './routes/workflow'
import { sequelize } from './lib/database'
import userMiddleware from './middlewares/user'
import bootstrap from './commands/bootstrap'
import './lib/worker'

const start = async (): Promise<void> => {
  await sequelize.sync()
  await bootstrap()

  const app = new Koa()

  app.keys = [config.get('app').secret]
  app.use(session({
    store: redisStore(config.get('redis')),
    prefix: config.get('app').prefix
  }, app))
  app.use(compress())
  app.use(bodyParser())
  app.use(serve('build'))
  app.use(error())
  app.use(userMiddleware())

  app.use(oauth.routes())
  app.use(userRouter.routes())
  app.use(workflowRouter.routes())

  const server = app.listen(process.env.PORT ?? 3001, () => {
    const address = server.address()
    const port = typeof address !== 'string' ? address?.port : address
    logger.info(`Klinklang server listening on ${port ?? ''}`)
  })
}

start().catch(e => {
  logger.error(e)
})
