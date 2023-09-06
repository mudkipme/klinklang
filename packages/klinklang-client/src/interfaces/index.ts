export interface User {
  id: string
  wikiId: number
  name: string
  groups: string[]
  fediAccounts: FediAccount[]
}

export interface FediAccount {
  id: string
  subject: string
}
