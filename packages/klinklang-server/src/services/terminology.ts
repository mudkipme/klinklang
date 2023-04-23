import { type Terminology, type PrismaClient } from '@mudkipme/klinklang-prisma'
import { type Logger } from 'pino'
import { type MessageType, type Notification } from '../lib/notification'

export interface TerminologyReplaceInput {
  sourceLng: string
  resultLng: string
  categories: string[]
  text: string
}

export class TerminologyService {
  #terminologyDataCache: Terminology[] | undefined
  #prisma: PrismaClient
  #notification: Notification
  #logger: Logger

  constructor ({ prisma, notification, logger }: { prisma: PrismaClient, notification: Notification, logger: Logger }) {
    this.#prisma = prisma
    this.#notification = notification
    this.#logger = logger
    notification.on('notification', this.#handleMessage)
  }

  #handleMessage = (e: MessageType): void => {
    if (e.type === 'TERMINOLOGY_UPDATE' && this.#terminologyDataCache !== undefined) {
      this.updateTerminologyCache().catch(err => {
        this.#logger.error(err)
      })
    }
  }

  dispose (): void {
    this.#notification.off('notification', this.#handleMessage)
  }

  async updateTerminologyCache (): Promise<void> {
    this.#terminologyDataCache = await this.#prisma.terminology.findMany()
  }

  async replace (input: TerminologyReplaceInput): Promise<string> {
    if (this.#terminologyDataCache === undefined || this.#terminologyDataCache === null) {
      await this.updateTerminologyCache()
    }
    const terms = (this.#terminologyDataCache ?? []).filter(term => input.categories.includes(term.category) &&
      (term.lang === input.sourceLng || term.lang === input.resultLng))

    const texts = new Map<string, { source: string, result: string }>()
    for (const term of terms) {
      const key = `${term.category}:${term.textId}`
      const item = texts.get(key) ?? { source: '', result: '' }
      if (term.lang === input.sourceLng) {
        item.source = term.text
      } else {
        item.result = term.text
      }
      texts.set(key, item)
    }

    const sorted = Array.from(texts.values()).sort((lhs, rhs) => rhs.source.length - lhs.source.length)
    let result = input.text
    for (const item of sorted) {
      if (item.source === '' || item.result === '') {
        continue
      }
      result = result.split(item.source).join(item.result)
    }
    return result
  }
}
