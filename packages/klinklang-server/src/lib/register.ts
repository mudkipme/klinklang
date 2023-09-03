import { diContainer } from '@fastify/awilix'
import { asClass, asFunction, asValue } from 'awilix'
import { TerminologyService } from '../services/terminology.js'
import { loadConfig } from './config.js'
import { getClient as getDatabaseClient } from './database.js'
import { getClient as getDiscordClient } from './discord.js'
import { getNotification } from './notification.js'
import { MediaWikiOAuth } from './oauth.js'
import { getQueue } from './queue.js'
import { getRedis } from './redis.js'
import { WikiService } from '../services/wiki.js'
import { getWorker } from './worker.js'
import { getLogger } from './logger.js'

export async function register (): Promise<void> {
  diContainer.register({
    config: asValue(await loadConfig()),
    prisma: asFunction(getDatabaseClient).singleton(),
    wikiService: asClass(WikiService).singleton(),
    mediaWikiOAuth: asClass(MediaWikiOAuth).singleton(),
    redis: asFunction(getRedis).singleton(),
    subscriberRedis: asFunction(getRedis).singleton(),
    notification: asFunction(getNotification).singleton(),
    terminologyService: asClass(TerminologyService).singleton().disposer(service => { service.dispose() }),
    discordClient: asFunction(getDiscordClient).singleton(),
    worker: asFunction(getWorker).singleton(),
    queue: asFunction(getQueue).singleton(),
    logger: asFunction(getLogger).singleton()
  })
}
