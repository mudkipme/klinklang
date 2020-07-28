import { TermReplacerAction } from './actions'

export interface TermReplacerState {
  languages: Array<{
    value: string
    text: string
  }>
  sourceLng: string
  resultLng: string
  categories: Array<{
    value: string
    text: string
    selected: boolean
  }>
}

export const initialState: TermReplacerState = {
  languages: [
    { value: 'en', text: 'English' },
    { value: 'ja', text: '日本語' },
    { value: 'zh-hans', text: '简体中文' },
    { value: 'zh-hant', text: '繁体中文' }

  ],
  sourceLng: 'en',
  resultLng: 'zh-hans',
  categories: [
    { value: 'pokemon', text: 'Pokémon', selected: false },
    { value: 'ability', text: 'Ability', selected: false },
    { value: 'move', text: 'Move', selected: false },
    { value: 'type', text: 'Type', selected: false },
    { value: 'item', text: 'Item', selected: false },
    { value: 'tcg', text: 'TCG', selected: false },
    { value: 'location', text: 'Location', selected: false },
    { value: 'nature', text: 'Nature', selected: false },
    { value: 'trainer-type', text: 'Trainer Type', selected: false },
    { value: 'location-type', text: 'Location Type', selected: false },
    { value: 'warrior', text: 'Warrior', selected: false },
    { value: 'role', text: 'Character', selected: false },
    { value: 'other', text: 'Other', selected: false }
  ]
}

const termReplacerReducer = (state: TermReplacerState, action: TermReplacerAction): TermReplacerState => {
  switch (action.type) {
    case 'CHANGE_SOURCE_LNG':
      return {
        ...state,
        sourceLng: action.sourceLng
      }
    case 'CHANGE_RESULT_LNG':
      return {
        ...state,
        resultLng: action.resultLng
      }
    case 'SELECT_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category => category.value === action.category ? { ...category, selected: action.selected } : category)
      }
    case 'SELECT_ALL': {
      return {
        ...state,
        categories: state.categories.map(category => ({ ...category, selected: action.selected }))
      }
    }
  }
  return state
}

export default termReplacerReducer
