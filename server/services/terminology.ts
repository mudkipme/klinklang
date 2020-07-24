import cheerio from 'cheerio'
import { defaultClient } from '../lib/wiki'
import MediaWikiClient from '../lib/mediawiki/client'
import Terminology from '../models/terminology'
import { sequelize } from '../lib/database'

interface FetchTerminologyOptions {
  client?: MediaWikiClient
  page: string
  entrySelector: string
  idSelector: string
  langSelectorMap: {zh: string, [lang: string]: string}
}

export interface UpdateTerminologyOptions extends FetchTerminologyOptions {
  category: string
}

const fetchTerminology = async (options: FetchTerminologyOptions): Promise<Map<number, {[lang: string]: string}>> => {
  const client = options.client ?? defaultClient
  const [pageDefault, pageHant, pageHans] = await Promise.all([
    client.parse(options.page, 'zh'),
    client.parse(options.page, 'zh-hant'),
    client.parse(options.page, 'zh-hans')
  ])

  const dict = new Map<number, {[lang: string]: string}>()

  // load non-zh terminologies
  let $ = cheerio.load(pageDefault.parse.text)

  $(options.entrySelector).each((_, line) => {
    const textId = parseInt($(line).find(options.idSelector).text().trim(), 10)
    if (isNaN(textId)) {
      return
    }

    const texts: {[lang: string]: string} = {}

    for (const lang of Object.keys(options.langSelectorMap)) {
      if (lang === 'zh') {
        continue
      }
      const text = $(line).find(options.langSelectorMap[lang]).text().trim()
      if (text !== '') {
        texts[lang] = text
      }
    }

    if (Object.keys(texts).length > 0) {
      dict.set(textId, texts)
    }
  })

  // load zh terminologies
  for (const variant of ['zh-hant', 'zh-hans']) {
    $ = cheerio.load(variant === 'zh-hant' ? pageHant.parse.text : pageHans.parse.text)

    $(options.entrySelector).each((_, line) => {
      const textId = parseInt($(line).find(options.idSelector).text().trim(), 10)
      if (isNaN(textId)) {
        return
      }

      const text = $(line).find(options.langSelectorMap.zh).text().trim()
      const texts = dict.get(textId)
      if (texts !== undefined && text !== '') {
        texts[variant] = text
      }
    })
  }

  return dict
}

export const updateTerminology = async (options: UpdateTerminologyOptions): Promise<void> => {
  const terminologies = await fetchTerminology(options)
  const transaction = await sequelize.transaction()

  try {
    await Terminology.destroy({ where: { category: options.category }, transaction })

    for (const [textId, texts] of terminologies) {
      for (const lang of Object.keys(texts)) {
        await Terminology.create({
          textId,
          lang,
          category: options.category,
          text: texts[lang]
        }, { transaction })
      }
    }
    await transaction.commit()
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}
