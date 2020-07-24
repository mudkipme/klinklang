import Router from '@koa/router'
import { updateTerminology } from '../services/terminology'

const hello = new Router({ prefix: '/api/hello' })

hello.get('/world', async (ctx) => {
  await updateTerminology({
    category: 'ability',
    page: '特性列表',
    entrySelector: '.eplist tr',
    idSelector: 'td:first-of-type',
    langSelectorMap: {
      zh: 'td:nth-child(2)',
      ja: 'td[lang="ja"]',
      en: 'td[lang="en"]'
    }
  })
  ctx.body = 'hello world'
})

export default hello
