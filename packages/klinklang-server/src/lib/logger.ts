import { type Logger, pino } from 'pino'

export const getLogger = (): Logger => pino()
