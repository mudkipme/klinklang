import { type FastifyPluginAsync, type FastifyRequest } from 'fastify'
import { type TerminologyReplaceInput } from '../services/terminology.js'

const terminologyRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/terminology/replace', async (request: FastifyRequest<{ Body: TerminologyReplaceInput }>) => {
    const text = await fastify.diContainer.cradle.terminologyService.replace(request.body)
    return { text }
  })
}

export default terminologyRoutes
