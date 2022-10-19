import pino, { Logger } from 'pino'

export const getLogger = (): Logger => pino()
