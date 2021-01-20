declare module 'json-predicate' {
  export interface Predicate {
    op: string
    path: string
    value: unknown
    ignore_case?: boolean
    apply?: Predicate[]
  }

  export function test (data: unknown, predicate: Predicate): boolean
}
