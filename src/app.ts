import { html, TemplateResult } from 'lit-html'
import { component } from 'haunted'
import '@material/mwc-top-app-bar'
import '@material/mwc-icon-button'

const App = (): TemplateResult => {
  return html`
    <div>
      <mwc-top-app-bar>
        <mwc-icon-button icon="menu" slot="navigationIcon"></mwc-icon-button>
        <div slot="title">52Poké Wiki Utilities</div>
        <mwc-icon-button icon="favorite" slot="actionItems"></mwc-icon-button>
      </mwc-top-app-bar>
    </div>
  `
}

customElements.define('klinklang-app', component(App))

export default App
