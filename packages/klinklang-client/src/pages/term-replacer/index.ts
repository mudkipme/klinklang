import { LitElement, css, CSSResultArray, html, TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@material/mwc-button'
import '@material/mwc-select'
import type { Select } from '@material/mwc-select'
import '@material/mwc-list/mwc-list-item'
import '@material/mwc-checkbox'
import type { Checkbox } from '@material/mwc-checkbox'
import '@material/mwc-formfield'
import '@material/mwc-textarea'
import type { TextArea } from '@material/mwc-textarea'
import { layoutGrid } from '@mudkipme/material-css'

@customElement('term-replacer')
class TermReplacer extends LitElement {
  @state()
  private sourceLng = 'en'

  @state()
  private resultLng = 'zh-hans'

  @state()
  private readonly languages: ReadonlyArray<{ value: string, text: string }> = [
    { value: 'en', text: 'English' },
    { value: 'ja', text: '日本語' },
    { value: 'zh-hans', text: '简体中文' },
    { value: 'zh-hant', text: '繁体中文' }
  ]

  @state()
  private categories: ReadonlyArray<{ value: string, text: string, selected: boolean }> = [
    { value: 'pokemon', text: 'Pokémon', selected: false },
    { value: 'ability', text: 'Ability', selected: false },
    { value: 'move', text: 'Move', selected: false },
    { value: 'item', text: 'Item', selected: false },
    { value: 'location', text: 'Location', selected: false },
    { value: 'nature', text: 'Nature', selected: false },
    { value: 'trainer-type', text: 'Trainer Type', selected: false },
    { value: 'warrior', text: 'Warrior', selected: false },
    { value: 'character', text: 'Character', selected: false }
  ]

  @state()
  private resultText = ''

  static get styles (): CSSResultArray {
    return [
      layoutGrid,
      css`
        :host {
          max-width: 62.5rem;
          display: block;
          margin: 0 auto;
        }
        .translate-button, .language-select, .textarea {
          width: 100%;
        }
        .divider {
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }
      `
    ]
  }

  private sourceChange (e: Event): void {
    this.sourceLng = (e.target as Select).value
  }

  private resultChange (e: Event): void {
    this.resultLng = (e.target as Select).value
  }

  private get allChecked (): boolean {
    return this.categories.every(category => category.selected)
  }

  private toggleCheck (category: string, selected: boolean): void {
    this.categories = this.categories.map(item => item.value === category ? { ...item, selected } : item)
  }

  private toggleAllCheck (e: Event): void {
    this.categories = this.categories.map(item => ({ ...item, selected: (e.target as Checkbox).checked }))
  }

  private async replace (): Promise<void> {
    const response = await fetch('/api/terminology/replace', {
      method: 'POST',
      body: JSON.stringify({
        sourceLng: this.sourceLng,
        resultLng: this.resultLng,
        categories: this.categories.filter(category => category.selected).map(category => category.value),
        text: this.shadowRoot !== null ? (this.shadowRoot.querySelector('.source-text') as TextArea).value : ''
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const { text } = await response.json() as { text: string }
    this.resultText = text
  }

  render (): TemplateResult {
    return html`
      <div class="mdc-layout-grid">
        <div class="mdc-layout-grid__inner">
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-5-desktop mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-2-phone">
            <mwc-select label="From" .value=${this.sourceLng} outlined class="language-select" @change=${this.sourceChange}>
              ${this.languages.map(lng => html`
                <mwc-list-item .value=${lng.value}>${lng.text}</mwc-list-item>
              `)}
            </mwc-select>
          </div>
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-5-desktop mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-2-phone">
            <mwc-select label="To" .value=${this.resultLng} outlined class="language-select" @change=${this.resultChange}>
              ${this.languages.map(lng => html`
                <mwc-list-item .value=${lng.value}>${lng.text}</mwc-list-item>
              `)}
            </mwc-select>
          </div>
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-2-tablet mdc-layout-grid__cell--span-4-phone">
            <mwc-button raised class="translate-button" @click=${this.replace}>Replace</mwc-button>
          </div>
        </div>
      </div>
      <div class="mdc-layout-grid">
        <div class="mdc-layout-grid__inner">
          ${this.categories.map(category => html`
            <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
              <mwc-formfield .label=${category.text} nowrap>
                <mwc-checkbox .checked=${category.selected} @change=${(e: Event) => this.toggleCheck(category.value, (e.target as Checkbox).checked)}></mwc-checkbox>
              </mwc-formfield>
            </div>
          `)}
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
            <mwc-formfield label="Select All" nowrap>
              <mwc-checkbox .checked=${this.allChecked} @change=${this.toggleAllCheck}></mwc-checkbox>
            </mwc-formfield>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="mdc-layout-grid">
        <div class="mdc-layout-grid__inner">
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone">
            <mwc-textarea class="source-text textarea" label="Source" required rows="10"></mwc-textarea>
          </div>
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone">
            <mwc-textarea label="Result" required rows="10" class="textarea" disabled value=${this.resultText}></mwc-textarea>
          </div>
        </div>
      </div>
    `
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'term-replacer': TermReplacer
  }
}
