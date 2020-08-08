export interface ParseResponse {
  parse: {
    title: string
    pageid: number
    text: string
  }
}

export interface QueryRevisionResponse {
  query: {
    normalized: {
      fromencoded: boolean
      from: string
      to: string
    }
    pages: Array<{
      pageid: number
      ns: number
      title: string
      revisions: Array<{
        slots: {[slot: string]: {
          contentmodel: string
          contentformat: string
          content: string
        }}
      }>
    }>
  }
}

export interface QueryTokenResponse {
  batchcomplete: boolean
  query: {
    tokens: {
      csrftoken: string
    }
  }
}
