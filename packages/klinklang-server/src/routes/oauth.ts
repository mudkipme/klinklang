import { ServerRoute } from '@hapi/hapi'
import { badRequest } from '@hapi/boom'
import { getRedirectURL, verify, getIdentity } from '../lib/oauth'
import { prisma } from '../lib/database'
import { Prisma } from '@mudkipme/klinklang-prisma'

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
      let user = await prisma.user.findUnique({ where: { wikiId: identity.sub } })
      if (user === null) {
        user = await prisma.user.create({
          data: {
            wikiId: identity.sub,
            token: token as unknown as Prisma.InputJsonValue,
            groups: identity.groups,
            name: identity.username
          }
        })
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            token: token as unknown as Prisma.InputJsonValue,
            groups: identity.groups,
            name: identity.username
          }
        })
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
