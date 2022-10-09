import Redis from 'ioredis'
import { Config } from './config'

export const getRedis = ({ config }: { config: Config }): Redis => new Redis({
  ...config.get('redis'),
  keyPrefix: config.get('app').prefix
})
