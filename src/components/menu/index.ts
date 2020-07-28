import { html, TemplateResult } from 'lit-html'
import { component, GenericRenderer, useCallback, useMemo } from 'haunted'
import '@material/mwc-list'
import '@material/mwc-list/mwc-list-item'
import { SingleSelectedEvent } from '@material/mwc-list/mwc-list-foundation'
import { navigateTo } from 'haunted-router'

/**
 * @fires close-drawer
 */
export interface KlinklangMenu extends HTMLElement {}

function Menu (this: KlinklangMenu): TemplateResult {
  const menus = useMemo(() => [
    {
      title: 'Term Replacer',
      link: '/replace'
    },
    {
      title: 'Workflows',
      link: '/workflows'
    }
  ], [])

  const handleSelected = useCallback((e: SingleSelectedEvent) => {
    navigateTo(menus[e.detail.index].link)
    this.dispatchEvent(new CustomEvent('close-drawer'))
  }, [menus])

  return html`
    <mwc-list activatable @selected=${handleSelected}>
      ${menus.map(item => html`
        <mwc-list-item>${item.title}</mwc-list-item>
      `)}
    </mwc-list>
  `
}

customElements.define('klinklang-menu', component(Menu as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-menu': KlinklangMenu
  }
}
