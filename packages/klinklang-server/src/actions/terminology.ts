import cheerio from 'cheerio'
import type { GetHTMLActionOutput } from './wiki'
import { ActionWorker } from './base'
import { sequelize } from '../lib/database'
import Terminology from '../models/terminology'
import notification from '../lib/notification'

export type ParseTerminologyListActionInput = GetHTMLActionOutput & {
  entrySelector: string
  idSelector?: string
  langSelectorMap: {zh: string, [lang: string]: string}
}

export type ParseTerminologyListOutput = Array<{id: number, texts: {[lang: string]: string}}>

export interface ParseTerminologyListAction {
  actionType: 'PARSE_TERMINOLOGY_LIST'
  input: ParseTerminologyListActionInput
  output: ParseTerminologyListOutput
}

export class ParseTerminologyWorker extends ActionWorker<ParseTerminologyListAction> {
  public async process (): Promise<ParseTerminologyListOutput> {
    const dict = new Map<number, {[lang: string]: string}>()

    // load non-zh terminologies
    let $ = cheerio.load(this.input.text)
    const variants = this.input.variants
    const hasVariants = variants !== undefined && Object.keys(variants).length > 0

    $(this.input.entrySelector).each((index, line) => {
      const textId = this.input.idSelector !== undefined ? parseInt($(line).find(this.input.idSelector).text().trim(), 10) : index + 1
      if (isNaN(textId)) {
        return
      }

      const texts: {[lang: string]: string} = {}

      for (const lang of Object.keys(this.input.langSelectorMap)) {
        if (hasVariants && lang === 'zh') {
          continue
        }
        const text = $(line).find(this.input.langSelectorMap[lang]).text().trim()
        if (text !== '') {
          texts[lang] = text
        }
      }

      if (Object.keys(texts).length > 0) {
        dict.set(textId, texts)
      }
    })

    // load zh terminologies
    if (hasVariants) {
      for (const variant of ['zh-hant', 'zh-hans']) {
        $ = cheerio.load(variants?.[variant as 'zh-hant' | 'zh-hans'] ?? this.input.text)

        $(this.input.entrySelector).each((index, line) => {
          const textId = this.input.idSelector !== undefined ? parseInt($(line).find(this.input.idSelector).text().trim(), 10) : index + 1
          if (isNaN(textId)) {
            return
          }

          const text = $(line).find(this.input.langSelectorMap.zh).text().trim()
          const texts = dict.get(textId)
          if (texts !== undefined && text !== '') {
            texts[variant] = text
          }
        })
      }
    }

    return Array.from(dict.entries()).map(pair => ({ id: pair[0], texts: pair[1] }))
  }
}

export interface UpdateTerminologyActionInput {
  category: string
  list: ParseTerminologyListOutput
}

export interface UpdateTerminologyAction {
  actionType: 'UPDATE_TERMINOLOGY'
  input: UpdateTerminologyActionInput
  output: null
}

export class UpdateTerminologyWorker extends ActionWorker<UpdateTerminologyAction> {
  public async process (): Promise<null> {
    const transaction = await sequelize.transaction()

    try {
      await Terminology.destroy({ where: { category: this.input.category }, transaction })

      for (const { id, texts } of this.input.list) {
        for (const lang of Object.keys(texts)) {
          await Terminology.create({
            textId: id,
            lang,
            category: this.input.category,
            text: texts[lang]
          }, { transaction })
        }
      }
      await transaction.commit()
    } catch (e) {
      await transaction.rollback()
      throw e
    }
    await notification.sendMessage({ type: 'TERMINOLOGY_UPDATE' })
    return null
  }
}
