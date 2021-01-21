import { LitElement, html, TemplateResult, customElement } from 'lit-element'
import '@material/mwc-list'
import '@material/mwc-list/mwc-list-item'
import { SingleSelectedEvent } from '@material/mwc-list/mwc-list-foundation'
import { Router } from '@vaadin/router'

/**
 * @fires close-drawer
 */
@customElement('klinklang-menu')
export class KlinklangMenu extends LitElement {
  private static readonly menus = [
    {
      title: 'Term Replacer',
      link: '/pages/replace'
    },
    {
      title: 'Workflows',
      link: '/pages/workflows'
    }
  ]

  private onSelected (e: SingleSelectedEvent): void {
    Router.go(KlinklangMenu.menus[e.detail.index].link)
    this.dispatchEvent(new CustomEvent('close-drawer'))
  }

  render (): TemplateResult {
    return html`
      <mwc-list activatable @selected=${this.onSelected}>
        ${KlinklangMenu.menus.map(item => html`
          <mwc-list-item>${item.title}</mwc-list-item>
        `)}
      </mwc-list>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-menu': KlinklangMenu
  }
}
