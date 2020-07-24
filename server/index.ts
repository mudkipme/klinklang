import Koa from 'koa'
import compress from 'koa-compress'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import error from 'koa-json-error'
import logger from './lib/logger'
import hello from './routes/hello'
import { sequelize } from './lib/database'

const start = async (): Promise<void> => {
  await sequelize.sync()

  const app = new Koa()

  app.use(compress())
  app.use(bodyParser())
  app.use(serve('build'))
  app.use(error())

  app.use(hello.routes())

  const server = app.listen(process.env.PORT ?? 3001, () => {
    const address = server.address()
    const port = typeof address !== 'string' ? address?.port : address
    logger.info(`Klinklang server listening on ${port ?? ''}`)
  })
}

start().catch(e => {
  logger.error(e)
})
