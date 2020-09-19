import Terminology from '../models/terminology'

export interface TerminologyReplaceInput {
  sourceLng: string
  resultLng: string
  categories: string[]
  text: string
}

let terminologyDataCache: Terminology[] | undefined
