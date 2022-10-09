import { join } from 'path'
import { fastify } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import fastifyStatic from '@fastify/static'
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix'
import oauth from './routes/oauth'
import userRoutes from './routes/user'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import workflowRoutes from './routes/workflow'
import terminologyRoutes from './routes/terminology'
import bootstrap from './commands/bootstrap'
import { start } from './lib/eventbus'
import './lib/worker'
import { register } from './lib/register'

const launch = async (): Promise<void> => {
  await register()
  const { config, discordClient, prisma, notification, logger } = diContainer.cradle
  try {
    await discordClient.login(config.get('discord').token)
  } catch (e) {
    logger.error('discord login failed', e)
    throw e
  }

  await bootstrap({ config, prisma })
  await start({ config, prisma, notification, logger })

  const port = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : config.get('app').port
  const workspaceRoot = await findWorkspaceDir(process.cwd())
  const buildPath = join(workspaceRoot !== undefined ? `${workspaceRoot}/packages/klinklang-client` : '.', 'build')
  const server = fastify({ logger })

  await server.register(fastifyCookie)
  await server.register(fastifySession, {
    secret: config.get('app').secret,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })

  await server.register(fastifyAwilixPlugin)

  server.decorateRequest('user', null)
  await server.register(oauth)
  await server.register(userRoutes)
  await server.register(workflowRoutes)
  await server.register(terminologyRoutes)

  await server.register(fastifyStatic, {
    root: join(workspaceRoot !== undefined ? `${workspaceRoot}/packages/klinklang-client` : '.', 'build')
  })

  server.setNotFoundHandler(async (request, reply) => {
    request.log.info('hello world')

    await reply.sendFile(join(buildPath, 'index.html'))
  })

  await server.listen({ port })
  logger.info(`Klinklang server listening on ${port}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

launch().catch(e => {
  console.log(e)
})
