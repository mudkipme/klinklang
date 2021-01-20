import OAuth from 'oauth-1.0a'
import { Session } from 'koa-session'
import User from '../models/user'

export interface ExtendedSession extends Session {
  loginToken?: OAuth.Token
  userId?: string
}

export interface CustomContext {
  session: ExtendedSession
}

export interface CustomState {
  user: User | undefined
}
