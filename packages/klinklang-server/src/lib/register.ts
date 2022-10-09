import { diContainer } from '@fastify/awilix'
import { asClass, asFunction, asValue } from 'awilix'
import { TerminologyService } from '../services/terminology'
import { loadConfig } from './config'
import { getClient as getDatabaseClient } from './database'
import { getClient as getDiscordClient } from './discord'
import { getNotification } from './notification'
import { MediaWikiOAuth } from './oauth'
import { getQueue } from './queue'
import { getRedis } from './redis'
import { WikiService } from '../services/wiki'
import { getWorker } from './worker'
import { getLogger } from './logger'

export async function register (): Promise<void> {
  diContainer.register({
    config: asValue(await loadConfig()),
    prisma: asFunction(getDatabaseClient).singleton(),
    wikiService: asClass(WikiService).singleton(),
    mediaWikiOAuth: asClass(MediaWikiOAuth).singleton(),
    redis: asFunction(getRedis).singleton(),
    notification: asFunction(getNotification).singleton(),
    terminologyService: asClass(TerminologyService).singleton().disposer(service => service.dispose()),
    discordClient: asFunction(getDiscordClient).singleton(),
    worker: asFunction(getWorker).singleton(),
    queue: asFunction(getQueue).singleton(),
    logger: asFunction(getLogger).singleton()
  })
}
