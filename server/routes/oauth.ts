import Router from '@koa/router'
import createErrors, { BadRequest } from 'http-errors'
import { getRedirectURL, verify, getIdentity } from '../lib/oauth'
import { CustomContext } from '../lib/context'
import User from '../models/user'

const oauthRouter = new Router<unknown, CustomContext>({ prefix: '/oauth' })

oauthRouter.get('/login', async (ctx) => {
  const { url, token } = await getRedirectURL()
  if (ctx.session !== undefined) {
    ctx.session.loginToken = token
  }
  ctx.redirect(url)
})

oauthRouter.get('/callback', async (ctx) => {
  const searchParams = new URLSearchParams(ctx.search)
  const verifier = searchParams.get('oauth_verifier')
  if (ctx.session === undefined || ctx.session.loginToken === undefined || verifier === null) {
    throw createErrors(BadRequest, 'invalid oauth callback')
  }

  const token = await verify(verifier, ctx.session.loginToken)
  delete ctx.session.loginToken

  const identity = await getIdentity(token)
  let user = await User.findOne({ where: { wikiId: identity.sub } })
  if (user === null) {
    user = await User.create({
      wikiId: identity.sub,
      token: token,
      groups: identity.groups,
      name: identity.username
    })
  } else {
    user.token = token
    user.groups = identity.groups
    user.name = identity.username
    await user.save()
  }
  ctx.session.userId = user.id
  ctx.redirect('/')
})

oauthRouter.post('/logout', async (ctx) => {
  if (ctx.session !== undefined) {
    delete ctx.session.userId
  }
  ctx.redirect('/')
})

export default oauthRouter
