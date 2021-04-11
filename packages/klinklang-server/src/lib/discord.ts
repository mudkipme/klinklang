import Discord from 'discord.js'
import config from './config'

export const defaultClient = new Discord.Client()

export async function login (): Promise<void> {
  await defaultClient.login(config.get('discord').token)
}
