import { Router } from '@vaadin/router'
import './app'
import './pages/term-replacer'
import './pages/workflows'

async function setup (): Promise<void> {
  const router = new Router(document.querySelector('klinklang-app'))

  await router.setRoutes([
    { path: '/', component: 'term-replacer' },
    { path: '/replace', component: 'term-replacer' },
    { path: '/workflows', component: 'workflows-page' }
  ])
}

setup().catch(console.log)
