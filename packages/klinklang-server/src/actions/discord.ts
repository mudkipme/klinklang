import { diContainer } from '@fastify/awilix'
import { MessageCreateOptions, MessagePayload, TextChannel } from 'discord.js'
import { WikiWorker } from './wiki'

export interface DiscordMessageActionInput {
  channel: string
  message: string | MessagePayload | MessageCreateOptions
}

export interface DiscordMessageActionOutput {
  id: string
}

export interface DiscordMessageAction {
  actionType: 'DISCORD_MESSAGE'
  input: DiscordMessageActionInput
  output: DiscordMessageActionOutput
}

export class DiscordMessageWorker extends WikiWorker<DiscordMessageAction> {
  public async process (): Promise<DiscordMessageActionOutput> {
    const channel = await diContainer.cradle.discordClient.channels.fetch(this.input.channel)
    if (channel instanceof TextChannel) {
      const message = await channel.send(this.input.message)
      return {
        id: message.id
      }
    }
    throw new Error('NOT_A_TEXT_CHANNEL')
  }
}
