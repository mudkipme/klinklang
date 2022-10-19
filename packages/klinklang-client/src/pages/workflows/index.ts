import { html, LitElement, TemplateResult, css, CSSResultArray } from 'lit'
import { customElement } from 'lit/decorators.js'
import { typography } from '@mudkipme/material-css'

@customElement('workflows-page')
export class WorkflowsPage extends LitElement {
  static get styles (): CSSResultArray {
    return [
      typography,
      css`
        :host {
          min-height: 30rem;
          max-width: 62.5rem;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `
    ]
  }

  render (): TemplateResult {
    return html`
      <div class="mdc-typography">
        Under construction.
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflows-page': WorkflowsPage
  }
}
