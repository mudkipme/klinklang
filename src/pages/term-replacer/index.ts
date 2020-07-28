import { html, TemplateResult } from 'lit-html'
import { component, GenericRenderer, useReducer, useCallback, useMemo } from 'haunted'
import '@material/mwc-button'
import '@material/mwc-select'
import type { Select } from '@material/mwc-select'
import '@material/mwc-list/mwc-list-item'
import '@material/mwc-checkbox'
import type { Checkbox } from '@material/mwc-checkbox'
import '@material/mwc-formfield'
import '@material/mwc-textarea'
import reducer, { initialState } from './reducer'
import { changeSourceLng, changeResultLng, selectAll, selectCategory } from './actions'

export interface TermReplacer extends HTMLElement {}

function TermReplacer (this: TermReplacer): TemplateResult {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleSourceChange = useCallback((e: Event) => {
    dispatch(changeSourceLng((e.target as Select).value))
  }, [])

  const handleResultChange = useCallback((e: Event) => {
    dispatch(changeResultLng((e.target as Select).value))
  }, [])

  const allChecked = useMemo(() => state.categories.every(category => category.selected), [state.categories])

  const handleCheck = useCallback((category: string, e: Event) => {
    dispatch(selectCategory(category, (e.target as Checkbox).checked))
  }, [])

  const handleAllCheck = useCallback((e: Event) => {
    dispatch(selectAll((e.target as Checkbox).checked))
  }, [])

  return html`
    <link rel="stylesheet" href="https://unpkg.com/@material/layout-grid@latest/dist/mdc.layout-grid.min.css">
    <style>
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
    </style>
    <div class="mdc-layout-grid">
      <div class="mdc-layout-grid__inner">
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-5-desktop mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-2-phone">
          <mwc-select label="From" .value=${state.sourceLng} outlined class="language-select" @change=${handleSourceChange}>
            ${state.languages.map(lng => html`
              <mwc-list-item .value=${lng.value}>${lng.text}</mwc-list-item>
            `)}
          </mwc-select>
        </div>
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-5-desktop mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-2-phone">
          <mwc-select label="To" .value=${state.resultLng} outlined class="language-select" @change=${handleResultChange}>
            ${state.languages.map(lng => html`
              <mwc-list-item .value=${lng.value}>${lng.text}</mwc-list-item>
            `)}
          </mwc-select>
        </div>
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-2-tablet mdc-layout-grid__cell--span-4-phone">
          <mwc-button raised class="translate-button">Replace</mwc-button>
        </div>
      </div>
    </div>
    <div class="mdc-layout-grid">
      <div class="mdc-layout-grid__inner">
        ${state.categories.map(category => html`
          <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
            <mwc-formfield .label=${category.text} nowrap>
              <mwc-checkbox .checked=${category.selected} @change=${(e: Event) => handleCheck(category.value, e)}></mwc-checkbox>
            </mwc-formfield>
          </div>
        `)}
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
          <mwc-formfield label="Select All" nowrap>
            <mwc-checkbox .checked=${allChecked} @change=${handleAllCheck}></mwc-checkbox>
          </mwc-formfield>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="mdc-layout-grid">
      <div class="mdc-layout-grid__inner">
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone">
          <mwc-textarea label="Source" required rows="10" class="textarea"></mwc-textarea>
        </div>
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone">
          <mwc-textarea label="Result" required rows="10" class="textarea" disabled></mwc-textarea>
        </div>
      </div>
    </div>
  `
}

customElements.define('term-replacer', component(TermReplacer as GenericRenderer))

declare global {
  interface HTMLElementTagNameMap {
    'term-replacer': TermReplacer
  }
}
