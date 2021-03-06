import { EventEmitter } from 'events'
import Redis from 'ioredis'
import config from './config'
import { redis } from './redis'

export type MessageType =
  | {
    type: 'TERMINOLOGY_UPDATE'
  }
  | {
    type: 'WORKFLOW_EVENTBUS_UPDATE'
  }

class Notification extends EventEmitter {
  #subscriber: Redis.Redis
  #publisher: Redis.Redis
  public constructor (subscriber: Redis.Redis, publisher: Redis.Redis) {
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

export default new Notification(new Redis({
  ...config.get('redis'),
  keyPrefix: config.get('app').prefix
}), redis)
