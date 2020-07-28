import { createContext } from 'haunted'
import { initialState } from '../reducers'
import { GlobalAction } from '../actions'

export const GlobalContext = createContext({
  state: initialState,
  dispatch: null as unknown as (action: GlobalAction) => void
})

customElements.define('global-provider', GlobalContext.Provider as CustomElementConstructor)

export default GlobalContext
