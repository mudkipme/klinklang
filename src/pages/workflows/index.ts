import { html, TemplateResult } from 'lit-html'
import { component, GenericRenderer } from 'haunted'

export interface WorkflowsPage extends HTMLElement {}

function Workflows (this: WorkflowsPage): TemplateResult {
  return html`
    <style>
      :host {
        min-height: 30rem;
        max-width: 62.5rem;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
    <div>
      Under construction.
    </div>
  `
}

customElements.define('workflows-page', component(Workflows as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'workflows-page': WorkflowsPage
  }
}
