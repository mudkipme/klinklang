import { html, TemplateResult, nothing } from 'lit-html'
import { component, useContext, useEffect, GenericRenderer, useState, useCallback } from 'haunted'
import { useRoutes } from 'haunted-router'
import GlobalContext from './store'
import { User } from './interfaces'
import { fulfillUserInfo } from './actions'
import '@material/mwc-drawer'
import './components/header'
import './components/menu'
import './components/footer'
import './pages/term-replacer'
import './pages/workflows'

export interface KlinklangApp extends HTMLElement {}

function App (this: KlinklangApp): TemplateResult {
  const { dispatch } = useContext(GlobalContext)

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      const response = await fetch('/api/user/me')
      const { user } = await response.json() as { user: User | null }
      dispatch(fulfillUserInfo(user))
    }
    loadData().catch(console.log)
  }, [])

  const routeResults = useRoutes({
    '/': () => html`<term-replacer></term-replacer>`,
    '/replace': () => html`<term-replacer></term-replacer>`,
    '/workflows': () => html`<workflows-page></workflows-page>`
  }, nothing)

  const [open, setOpen] = useState(false)
  const handleOpenDrawer = useCallback(() => {
    setOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setOpen(false)
  }, [])

  return html`
    <mwc-drawer hasHeader type="modal" @MDCDrawer:closed=${handleCloseDrawer} .open=${open}>
      <span slot="title">Klinklang</span>
      <span slot="subtitle">Utilities for 52Poké Wiki</span>
      <klinklang-menu @close-drawer=${handleCloseDrawer}></klinklang-menu>
      <div slot="appContent">
        <klinklang-header @open-drawer=${handleOpenDrawer}></klinklang-header>
        ${routeResults}
        <klinklang-footer></klinklang-footer>
      </div>
    </mwc-drawer>
  `
}

customElements.define('klinklang-app', component(App as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-app': KlinklangApp
  }
}
