import type { PrismaClient } from '../lib/database.js'
import type { Config } from '../lib/config.js'
import type { MediaWikiOAuth } from '../lib/oauth.js'
import type { WikiService } from '../services/wiki.js'
import type { Redis } from 'ioredis'
import type { Notification } from '../lib/notification.js'
import type { TerminologyService } from '../services/terminology.js'
import type { Queue, Worker } from 'bullmq'
import type { Logger } from 'pino'
import type Discord from 'discord.js'
import { type FediverseService } from '../services/fediverse.ts'
import { type User } from '@mudkipme/klinklang-prisma'

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
    fediverseService: FediverseService
  }
}

export {}
