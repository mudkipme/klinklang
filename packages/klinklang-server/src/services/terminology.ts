import Terminology from '../models/terminology'
import notification, { MessageType } from '../lib/notification'
import logger from '../lib/logger'

export interface TerminologyReplaceInput {
  sourceLng: string
  resultLng: string
  categories: string[]
  text: string
}

let terminologyDataCache: Terminology[] | undefined

export async function updateTerminologyCache (): Promise<void> {
  terminologyDataCache = await Terminology.findAll()
}

export async function replace (input: TerminologyReplaceInput): Promise<string> {
  if (terminologyDataCache === undefined || terminologyDataCache === null) {
    await updateTerminologyCache()
  }
  const terms = (terminologyDataCache ?? []).filter(term => input.categories.includes(term.category) &&
    (term.lang === input.sourceLng || term.lang === input.resultLng))

  const texts = new Map<string, {source: string, result: string}>()
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

notification.on('notification', (e: MessageType) => {
  if (e.type === 'TERMINOLOGY_UPDATE' && terminologyDataCache !== undefined) {
    updateTerminologyCache().catch(err => {
      logger.error(err)
    })
  }
})
