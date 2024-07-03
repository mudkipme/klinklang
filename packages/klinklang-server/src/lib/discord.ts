import { Client } from 'discord.js'

export function getClient (): Client {
  const client = new Client({
    intents: ['GuildMessages']
  })
  return client
}
