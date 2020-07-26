import Router from '@koa/router'
import { updateTerminology } from '../services/terminology'
import { CustomState, CustomContext } from '../lib/context'

const hello = new Router<CustomState, CustomContext>({ prefix: '/api/hello' })

hello.get('/me', async (ctx) => {
  ctx.body = ctx.state.user
})

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

  await updateTerminology({
    category: 'pokemon',
    page: '宝可梦列表（按全国图鉴编号）/简单版',
    entrySelector: '.eplist tr:has(> td:nth-child(4))',
    langSelectorMap: {
      zh: 'td:nth-child(2)',
      ja: 'td:nth-child(3)',
      en: 'td:nth-child(4)'
    }
  })
  ctx.body = 'hello world'
})

export default hello
