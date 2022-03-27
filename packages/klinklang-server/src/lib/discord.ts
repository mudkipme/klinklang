import Discord, { Intents } from 'discord.js'
import config from './config'
import logger from './logger'

export const defaultClient = new Discord.Client({
  intents: [Intents.FLAGS.GUILD_MESSAGES]
})

export async function login (): Promise<void> {
  try {
    await defaultClient.login(config.get('discord').token)
  } catch (e) {
    logger.error(e)
  }
}
