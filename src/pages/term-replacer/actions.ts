export type TermReplacerAction =
  | {
    type: 'CHANGE_SOURCE_LNG'
    sourceLng: string
  }
  | {
    type: 'CHANGE_RESULT_LNG'
    resultLng: string
  }
  | {
    type: 'SELECT_CATEGORY'
    category: string
    selected: boolean
  }
  | {
    type: 'SELECT_ALL'
    selected: boolean
  }
  | {
    type: 'REPLACE_TEXT_FULFILLED'
    text: string
  }

export const changeSourceLng = (sourceLng: string): TermReplacerAction => ({
  type: 'CHANGE_SOURCE_LNG',
  sourceLng
})

export const changeResultLng = (resultLng: string): TermReplacerAction => ({
  type: 'CHANGE_RESULT_LNG',
  resultLng
})

export const selectCategory = (category: string, selected: boolean): TermReplacerAction => ({
  type: 'SELECT_CATEGORY',
  category,
  selected
})

export const selectAll = (selected: boolean): TermReplacerAction => ({
  type: 'SELECT_ALL',
  selected
})

export const replaceTextFulfilled = (text: string): TermReplacerAction => ({
  type: 'REPLACE_TEXT_FULFILLED',
  text
})
