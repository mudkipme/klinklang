import { join } from 'path'
import Hapi from '@hapi/hapi'
import Cookie, { Options } from '@hapi/cookie'
import Yar from '@hapi/yar'
import Inert from '@hapi/inert'
import CatboxRedis from '@hapi/catbox-redis'
import config from './lib/config'
import logger from './lib/logger'
import oauth from './routes/oauth'
import userRouter from './routes/user'
import workflowRouter from './routes/workflow'
import terminologyRouter from './routes/terminology'
import userMiddleware from './middlewares/user'
import bootstrap from './commands/bootstrap'
import { start } from './lib/eventbus'
import { login } from './lib/discord'
import './lib/worker'

const launch = async (): Promise<void> => {
  await bootstrap()
  await start()
  await login()

  const port = process.env.PORT ?? config.get('app').port
  const server = Hapi.server({
    port,
    cache: {
      provider: {
        constructor: CatboxRedis,
        options: {
          ...config.get('redis'),
          partition: config.get('app').prefix
        }
      }
    },
    routes: {
      files: {
        relativeTo: join(process.env.WORKSPACE_ROOT_PATH !== undefined ? `${process.env.WORKSPACE_ROOT_PATH}/packages/klinklang-client` : '.', 'build')
      }
    }
  })

  await server.register(Cookie)
  const strategyOptions: Options = {
    cookie: {
      name: 'sid',
      password: config.get('app').secret,
      path: '/',
      isSecure: process.env.NODE_ENV === 'production'
    },
    validateFunc: userMiddleware()
  }
  server.auth.strategy('session', 'cookie', strategyOptions)
  server.auth.default('session')

  await server.register({
    plugin: Yar,
    options: {
      storeBlank: false,
      cookieOptions: {
        isSecure: process.env.NODE_ENV === 'production',
        password: config.get('app').secret
      }
    }
  })

  await server.register(Inert)

  server.route(oauth)
  server.route(userRouter)
  server.route(workflowRouter)
  server.route(terminologyRouter)

  server.route({
    method: 'GET',
    path: '/{any*}',
    options: {
      auth: false
    },
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/pages/{any*}',
    options: {
      auth: false
    },
    handler: function (_, h) {
      return h.file('index.html')
    }
  })

  await server.start()
  logger.info(`Klinklang server listening on ${port}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

launch().catch(e => {
  console.log(e)
  logger.error(e)
})
