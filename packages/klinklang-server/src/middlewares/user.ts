import { type FastifyRequest, type RouteGenericInterface, type FastifyReply } from 'fastify'
import { unauthorizedError } from '../lib/errors'

const userMiddleware = <T extends RouteGenericInterface>(requireLogin: boolean) => async function (request: FastifyRequest<T>, reply: FastifyReply) {
  if (request.session.userId !== undefined) {
    try {
      const user = await request.diScope.resolve('prisma').user.findUnique({ where: { id: request.session.userId } })
      if (user === null || user === undefined) {
        if (requireLogin) {
          throw unauthorizedError()
        }
      }
      request.user = user
    } catch (e) {
      request.log.error(e)
      throw e
    }
  } else if (requireLogin) {
    throw unauthorizedError()
  }
}

export default userMiddleware
