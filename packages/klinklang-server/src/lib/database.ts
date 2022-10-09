import { PrismaClient } from '.prisma/client'
import { Config } from './config'

export type { PrismaClient }

export const getClient = ({ config }: { config: Config }): PrismaClient => new PrismaClient({
  datasources: {
    db: config.get('db')
  }
})
