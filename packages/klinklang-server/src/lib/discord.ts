import Discord from 'discord.js'

export function getClient (): Discord.Client {
  const client = new Discord.Client({
    intents: ['GuildMessages']
  })
  return client
}
