import { User } from '../interfaces'
import { GlobalAction } from '../actions'

export interface GlobalState {
  currentUser: User | null
}

export const initialState: GlobalState = {
  currentUser: null
}

const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'FULFILL_USER_INFO':
      return {
        ...state,
        currentUser: action.user
      }
  }
  return state
}

export default globalReducer
