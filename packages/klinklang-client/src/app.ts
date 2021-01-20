import { html, TemplateResult, customElement, LitElement, internalProperty } from 'lit-element'
import { User } from './interfaces'
import '@material/mwc-drawer'
import './components/header'
import './components/menu'
import './components/footer'

@customElement('klinklang-app')
export class KlinklangApp extends LitElement {
  @internalProperty()
  private user?: User | null

  @internalProperty()
  private open = false

  constructor () {
    super()
    this.loadData().catch(console.log)
  }

  private async loadData (): Promise<void> {
    const response = await fetch('/api/user/me')
    const { user } = await response.json() as { user: User | null }
    this.user = user
  }

  private closeDrawer (): void {
    this.open = false
  }

  private openDrawer (): void {
    this.open = true
  }

  private async logout (): Promise<void> {
    await fetch('/oauth/logout', { method: 'POST' })
    this.user = null
  }

  render (): TemplateResult {
    return html`
     <mwc-drawer hasHeader type="modal" @MDCDrawer:closed=${this.closeDrawer} .open=${this.open}>
       <span slot="title">Klinklang</span>
       <span slot="subtitle">Utilities for 52Poké Wiki</span>
       <klinklang-menu @close-drawer=${this.closeDrawer}></klinklang-menu>
       <div slot="appContent">
         <klinklang-header @open-drawer=${this.openDrawer} @logout=${this.logout} .currentUser=${this.user}></klinklang-header>
         <slot></slot>
         <klinklang-footer></klinklang-footer>
       </div>
     </mwc-drawer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-app': KlinklangApp
  }
}
