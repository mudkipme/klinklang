import { html, TemplateResult } from 'lit-html'
import { component, useContext, useState, useCallback, useEffect, GenericRenderer } from 'haunted'
import '@material/mwc-top-app-bar'
import '@material/mwc-icon-button'
import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'
import '@material/mwc-icon'
import type { Menu } from '@material/mwc-menu'
import GlobalContext from '../../store'
import { fulfillUserInfo } from '../../actions'

/**
 * @fires open-drawer
 */
export interface KlinklangHeader extends HTMLElement {}

function Header (this: KlinklangHeader): TemplateResult {
  const { state, dispatch } = useContext(GlobalContext)
  const loggedIn = state.currentUser !== null
  const [open, setOpen] = useState(false)

  const handleOpenDrawer = useCallback(() => {
    this.dispatchEvent(new CustomEvent('open-drawer'))
  }, [])

  const handleAccountClick = useCallback(() => {
    setOpen(true)
  }, [])

  const handleMenuClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleLogin = useCallback(async () => {
    if (!loggedIn) {
      location.href = '/oauth/login'
      return
    }
    await fetch('/oauth/logout', { method: 'POST' })
    dispatch(fulfillUserInfo(null))
  }, [loggedIn])

  useEffect(() => {
    if (this.shadowRoot !== null) {
      const menu = this.shadowRoot.querySelector('.account-menu') as Menu
      menu.anchor = this.shadowRoot.querySelector('.account-button')
    }
  }, [])

  return html`
    <style>
      .action-items {
        position: relative;
      }
    </style>
    <mwc-top-app-bar>
      <mwc-icon-button icon="menu" slot="navigationIcon" @click=${handleOpenDrawer}></mwc-icon-button>
      <div slot="title">52Poké Wiki Utilities</div>
      <div class="action-items" slot="actionItems">
        <mwc-icon-button class="account-button" icon="account_circle" @click=${handleAccountClick}></mwc-icon-button>
        <mwc-menu @closed=${handleMenuClose} .open=${open} class="account-menu" corner="BOTTOM_START">
          ${state.currentUser !== null ? html`
            <mwc-list-item graphic="icon">
              <mwc-icon slot="graphic">face</mwc-icon>
              <span>${state.currentUser.name}</span>
            </mwc-list-item>
            <li divider role="separator"></li>
          ` : undefined}
          <mwc-list-item graphic="icon" @request-selected=${handleLogin}>
            <mwc-icon slot="graphic">login</mwc-icon>
            <span>${loggedIn ? 'Logout' : 'Login'}</span>
          </mwc-list-item>
        </mwc-menu>
      </div>
    </mwc-top-app-bar>
  `
}

customElements.define('klinklang-header', component(Header as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-header': KlinklangHeader
  }
}
