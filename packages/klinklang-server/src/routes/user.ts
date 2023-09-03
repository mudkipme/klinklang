import { type FastifyPluginAsync } from 'fastify'
import userMiddleware from '../middlewares/user.js'
import { outputUser } from '../models/user.js'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/user/me', { preHandler: userMiddleware(false) }, async (request, reply) => {
    await reply.send({
      user: request.user != null ? outputUser(request.user) : null
    })
  })
}

export default userRoutes
