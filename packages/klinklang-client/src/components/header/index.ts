import { LitElement, html, TemplateResult, css, CSSResult } from 'lit'
import { customElement, state, property } from 'lit/decorators.js'
import '@material/mwc-top-app-bar'
import '@material/mwc-icon-button'
import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'
import '@material/mwc-icon'
import type { Menu } from '@material/mwc-menu'
import { User } from '../../interfaces'

/**
 * @fires open-drawer
 * @fires logout
 */
@customElement('klinklang-header')
export class KlinklangHeader extends LitElement {
  static get styles (): CSSResult {
    return css`
      .action-items {
        position: relative;
      }
    `
  }

  @property({ attribute: false })
  currentUser?: User | null

  @state()
  private open = false

  private openDrawer (): void {
    this.dispatchEvent(new CustomEvent('open-drawer'))
  }

  private accountClick (): void {
    this.open = true
  }

  private menuClose (): void {
    this.open = false
  }

  private async login (): Promise<void> {
    if (this.currentUser === undefined || this.currentUser === null) {
      location.href = '/oauth/login'
      return
    }
    await fetch('/oauth/logout', { method: 'POST' })
    this.dispatchEvent(new CustomEvent('logout'))
  }

  firstUpdated (): void {
    if (this.shadowRoot !== null) {
      const menu = this.shadowRoot.querySelector('.account-menu') as Menu
      menu.anchor = this.shadowRoot.querySelector('.account-button')
    }
  }

  render (): TemplateResult {
    return html`
      <mwc-top-app-bar>
        <mwc-icon-button icon="menu" slot="navigationIcon" @click=${this.openDrawer}></mwc-icon-button>
        <div slot="title">52Poké Wiki Utilities</div>
        <div class="action-items" slot="actionItems">
          <mwc-icon-button class="account-button" icon="account_circle" @click=${this.accountClick}></mwc-icon-button>
          <mwc-menu @closed=${this.menuClose} .open=${this.open} class="account-menu" corner="BOTTOM_START">
            ${this.currentUser !== null && this.currentUser !== undefined
            ? html`
              <mwc-list-item graphic="icon">
                <mwc-icon slot="graphic">face</mwc-icon>
                <span>${this.currentUser.name}</span>
              </mwc-list-item>
              <li divider role="separator"></li>
            `
            : undefined}
            <mwc-list-item graphic="icon" @request-selected=${this.login}>
              <mwc-icon slot="graphic">login</mwc-icon>
              <span>${this.currentUser !== null && this.currentUser !== undefined ? 'Logout' : 'Login'}</span>
            </mwc-list-item>
          </mwc-menu>
        </div>
      </mwc-top-app-bar>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-header': KlinklangHeader
  }
}
