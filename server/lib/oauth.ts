import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import fetch, { BodyInit, Response } from 'node-fetch'
import jwt from 'jsonwebtoken'
import config from './config'

export interface OAuthIdentity {
  iss: string
  sub: number
  aud: string
  exp: number
  iat: number
  nonce: string
  username: string
  editcount: number
  confirmed_email: boolean
  blocked: boolean
  registered: string
  groups: string[]
  rights: string[]
  grants: string[]
}

const oauth = new OAuth({
  consumer: {
    key: config.get('mediawiki').oauthKey,
    secret: config.get('mediawiki').oauthSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
})

const requestTokenURL = config.get('mediawiki').scriptPath + 'index.php?title=Special:OAuth/initiate'
const accessTokenURL = config.get('mediawiki').scriptPath + 'index.php?title=Special:OAuth/token'
const userAuthorizationURL = config.get('mediawiki').scriptPath + 'index.php?title=Special:OAuth/authorize'
const callbackURL = config.get('mediawiki').oauthCallback
const identifyURL = config.get('mediawiki').scriptPath + 'index.php?title=Special:OAuth/identify'

const signedFetch = async (url: string, { body, method = 'GET', token }: {body?: BodyInit, method?: string, token?: OAuth.Token} = {}): Promise<Response> => {
  const headers = oauth.toHeader(oauth.authorize({
    url: url.toString(),
    data: body,
    method
  }, token))

  const response = await fetch(url.toString(), {
    headers: { ...headers }
  })

  if (response.status >= 300 || response.status < 200) {
    throw new Error(await response.text())
  }

  return response
}

const getToken = async (): Promise<OAuth.Token> => {
  const url = new URL(requestTokenURL)
  url.searchParams.append('oauth_callback', callbackURL)

  const response = await signedFetch(url.toString())
  const params = new URLSearchParams(await response.text())
  return {
    key: params.get('oauth_token') ?? '',
    secret: params.get('oauth_token_secret') ?? ''
  }
}

export const getRedirectURL = async (): Promise<{url: string, token: OAuth.Token}> => {
  const token = await getToken()
  const url = new URL(userAuthorizationURL)
  url.searchParams.append('oauth_consumer_key', oauth.consumer.key)
  url.searchParams.append('oauth_token', token.key)
  return {
    url: url.toString(),
    token
  }
}

export const verify = async (verifier: string, token: OAuth.Token): Promise<OAuth.Token> => {
  const url = new URL(accessTokenURL)
  url.searchParams.append('oauth_verifier', verifier)

  const response = await signedFetch(url.toString(), { token })
  const params = new URLSearchParams(await response.text())
  return {
    key: params.get('oauth_token') ?? '',
    secret: params.get('oauth_token_secret') ?? ''
  }
}

export const getIdentity = async (token: OAuth.Token): Promise<OAuthIdentity> => {
  const response = await signedFetch(identifyURL, { token })
  const text = await response.text()
  return jwt.verify(text, oauth.consumer.secret, { algorithms: ['HS256'], audience: oauth.consumer.key }) as OAuthIdentity
}
