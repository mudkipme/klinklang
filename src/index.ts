import { html, TemplateResult } from 'lit-html'
import { component, useReducer, useMemo, GenericRenderer } from 'haunted'
import './store'
import globalReducer, { initialState } from './reducers'
import './app'

export interface KlinklangMain extends HTMLElement {}

function Main (this: KlinklangMain): TemplateResult {
  const [state, dispatch] = useReducer(globalReducer, initialState)
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch])

  return html`
    <global-provider .value=${contextValue}>
      <klinklang-app></klinklang-app>
    </global-provider>
  `
}

customElements.define('klinklang-main', component(Main as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-main': KlinklangMain
  }
}
