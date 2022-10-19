import { LitElement, html, TemplateResult, css, CSSResultArray } from 'lit'
import { customElement } from 'lit/decorators.js'
import { typography } from '@mudkipme/material-css'
@customElement('klinklang-footer')
export class KlinklangFooter extends LitElement {
  static get styles (): CSSResultArray {
    return [
      typography,
      css`
        :host {
          display: block;
          max-width: 62.5rem;
          margin: 1rem auto;
        }
        .link {
          color: inherit;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      `
    ]
  }

  render (): TemplateResult {
    return html`
      <footer class="mdc-typography--body2">
        &copy; <a class="link" href="https://wiki.52poke.com/">52Poké Wiki</a>
      </footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-footer': KlinklangFooter
  }
}
