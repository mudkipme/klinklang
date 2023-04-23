import pino, { type Logger } from 'pino'

export const getLogger = (): Logger => pino()
