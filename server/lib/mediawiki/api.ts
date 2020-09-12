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

export type EditRequest = ({ title: string } | { pageid: number }) & {
  section?: number
  sectiontitle?: string
  text?: string
  summary?: string
  tags?: string
  minor?: boolean
  notminor?: boolean
  bot?: boolean
  baserevid?: number
  basetimestamp?: Date
  starttimestamp?: Date
  recreate?: boolean
  createonly?: boolean
  nocreate?: boolean
  watchlist?: 'nochange' | 'preferences' | 'unwatch' | 'watch'
  md5?: string
  prependtext?: string
  appendtext?: string
  undo?: number
  undoafter?: number
  redirect?: boolean
  contentformat?: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
  contentmodel?: 'GadgetDefinition' | 'Json.JsonConfig' | 'JsonSchema' | 'Map.JsonConfig' | 'MassMessageListContent' | 'NewsletterContent' | 'Scribunto' | 'SecurePoll' | 'Tabular.JsonConfig' | 'css' | 'flow-board' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
}

export interface EditResponse {
  edit: {
    result: string
    pageid: number
    title: string
    contentmodel: string
    oldrevid: number
    newrevid: number
    newtimestamp: string
  }
}
