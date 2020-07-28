import { html, TemplateResult } from 'lit-html'
import { component, GenericRenderer } from 'haunted'

export interface KlinklangFooter extends HTMLElement {}

function Footer (this: KlinklangFooter): TemplateResult {
  return html`
    <link href="https://unpkg.com/@material/typography@latest/dist/mdc.typography.min.css" rel="stylesheet">
    <style>
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
    </style>
    <footer class="mdc-typography--body2">
      &copy; <a class="link" href="https://wiki.52poke.com/">52Poké Wiki</a>
    </footer>
  `
}

customElements.define('klinklang-footer', component(Footer as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'klinklang-footer': KlinklangFooter
  }
}
