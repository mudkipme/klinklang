import { createInstanceWithWorkflow, getWorkflowInstances } from '../models/workflow'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { forbiddenError, workflowNotFoundError } from '../lib/errors'
import userMiddleware from '../middlewares/user'

const workflowRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = fastify.diContainer.cradle.prisma

  fastify.route({
    method: 'GET',
    url: '/api/workflow',
    preHandler: userMiddleware(true),
    handler: async (request: FastifyRequest<{ Querystring: { offset: string, limit: string } }>, reply) => {
      const offset = request.query.offset !== undefined ? parseInt(request.query.offset, 10) : 0
      const limit = request.query.limit !== undefined ? Math.max(parseInt(request.query.limit, 10), 200) : 20
      const workflows = await prisma.workflow.findMany({ skip: offset, take: limit })
      await reply.send({
        workflows
      })
    }
  })

  fastify.route({
    method: 'GET',
    url: '/api/workflow/:workflowId/actions',
    preHandler: userMiddleware(true),
    handler: async (request: FastifyRequest<{ Querystring: { start: string, stop: string }, Params: { workflowId: string } }>) => {
      const workflow = await prisma.workflow.findUnique({ where: { id: request.params.workflowId } })
      if (workflow === null || workflow === undefined) {
        throw workflowNotFoundError()
      }
      const start = request.query.start !== undefined ? parseInt(request.query.start, 10) : 0
      const stop = request.query.stop !== undefined ? Math.max(parseInt(request.query.stop, 10), 200) : 20
      const instances = await getWorkflowInstances(workflow, start, stop)
      return {
        instances
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/api/workflow/:workflowId/instances',
    preHandler: userMiddleware(true),
    handler: async (request: FastifyRequest<{ Querystring: { start: string, stop: string }, Params: { workflowId: string } }>) => {
      const workflow = await prisma.workflow.findUnique({ where: { id: request.params.workflowId } })
      if (workflow === null || workflow === undefined) {
        throw workflowNotFoundError()
      }
      const start = request.query.start !== undefined ? parseInt(request.query.start, 10) : 0
      const stop = request.query.stop !== undefined ? Math.max(parseInt(request.query.stop, 10), 200) : 20
      const instances = await getWorkflowInstances(workflow, start, stop)
      return {
        instances
      }
    }
  })

  fastify.route({
    method: 'POST',
    url: '/api/workflow/:workflowId/trigger',
    preHandler: userMiddleware(true),
    handler: async (request: FastifyRequest<{ Params: { workflowId: string } }>) => {
      const workflow = await prisma.workflow.findUnique({ where: { id: request.params.workflowId }, include: { user: true } })
      if (workflow === null || workflow === undefined) {
        throw workflowNotFoundError()
      }

      if (workflow.isPrivate) {
        const workflowOwner = workflow.user
        if (workflowOwner !== null && workflowOwner !== undefined && workflowOwner.id !== request.user?.id && workflow.isPrivate) {
          throw forbiddenError()
        }
      }

      const instance = await createInstanceWithWorkflow(workflow)
      return {
        workflow,
        instance
      }
    }
  })
}

export default workflowRoutes
