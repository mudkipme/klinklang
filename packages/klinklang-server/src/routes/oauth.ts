import { ServerRoute } from '@hapi/hapi'
import { badRequest } from '@hapi/boom'
import { getRedirectURL, verify, getIdentity } from '../lib/oauth'
import User from '../models/user'

const oauthRouter: ServerRoute[] = [
  {
    method: 'GET',
    path: '/oauth/login',
    options: {
      auth: false
    },
    handler: async (request, h) => {
      const { url, token } = await getRedirectURL()
      request.yar.set('loginToken', token)
      return h.redirect(url)
    }
  },
  {
    method: 'GET',
    path: '/oauth/callback',
    options: {
      auth: {
        mode: 'try'
      }
    },
    handler: async (request, h) => {
      const verifier = request.query.oauth_verifier
      if (request.yar.get('loginToken') === undefined || verifier === null) {
        throw badRequest('invalid oauth callback')
      }

      const token = await verify(verifier, request.yar.get('loginToken'))
      request.yar.clear('loginToken')

      const identity = await getIdentity(token)
      let user = await User.findOne({ where: { wikiId: identity.sub } })
      if (user === null) {
        user = await User.create({
          wikiId: identity.sub,
          token,
          groups: identity.groups,
          name: identity.username
        })
      } else {
        user.token = token
        user.groups = identity.groups
        user.name = identity.username
        await user.save()
      }

      request.cookieAuth.set({ userId: user.id })
      return h.redirect('/')
    }
  },
  {
    method: 'POST',
    path: '/oauth/logout',
    handler: async (request, h) => {
      request.cookieAuth.clear()
      return h.redirect('/')
    }
  }
]

export default oauthRouter
