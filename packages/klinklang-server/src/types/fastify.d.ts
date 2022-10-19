import type { PrismaClient } from '../lib/database'
import type { Config } from '../lib/config'
import type { MediaWikiOAuth } from '../lib/oauth'
import type { WikiService } from '../services/wiki'
import type Redis from 'ioredis'
import type { Notification } from '../lib/notification'
import type { TerminologyService } from '../services/terminology'
import type { Queue, Worker } from 'bullmq'
import type { Logger } from 'pino'

declare module 'fastify' {
  interface Session {
    loginToken?: Token
    userId?: string
  }

  interface FastifyRequest {
    user: User | null
  }
}

declare module '@fastify/awilix' {
  interface Cradle {
    config: Config
    prisma: PrismaClient
    wikiService: WikiService
    mediaWikiOAuth: MediaWikiOAuth
    redis: Redis
    subscriberRedis: Redis
    notification: Notification
    terminologyService: TerminologyService
    discordClient: Discord.Client
    worker: Worker
    queue: Queue
    logger: Logger
  }
}

export {}
