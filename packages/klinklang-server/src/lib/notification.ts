import { EventEmitter } from 'events'
import type Redis from 'ioredis'

export type MessageType =
  | {
    type: 'TERMINOLOGY_UPDATE'
  }
  | {
    type: 'WORKFLOW_EVENTBUS_UPDATE'
  }

export class Notification extends EventEmitter {
  #subscriber: Redis
  #publisher: Redis
  public constructor (subscriber: Redis, publisher: Redis) {
    super()
    this.#subscriber = subscriber
    this.#publisher = publisher
    this.#subscriber.on('message', this.#handleMessage)
    this.#subscriber.subscribe('notification').catch(error => {
      this.emit('error', { error })
    })
  }

  #handleMessage = (channel: string, message: string): void => {
    if (channel === 'notification') {
      this.emit('notification', JSON.parse(message))
    }
  }

  public async sendMessage (message: MessageType): Promise<number> {
    return await this.#publisher.publish('notification', JSON.stringify(message))
  }
}

export const getNotification = ({ redis }: { redis: Redis }): Notification => new Notification(redis, redis)
