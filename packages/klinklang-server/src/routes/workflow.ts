import { ServerRoute } from '@hapi/hapi'
import { notFound, forbidden } from '@hapi/boom'
import Workflow from '../models/workflow'
import User from '../models/user'

const workflowRouter: ServerRoute[] = [
  {
    method: 'GET',
    path: '/api/workflow',
    handler: async (request) => {
      const offset = request.query.offset !== undefined ? parseInt(request.query.offset, 10) : 0
      const limit = request.query.limit !== undefined ? Math.max(parseInt(request.query.limit, 10), 200) : 20
      const workflows = await Workflow.findAll({ offset, limit })
      return {
        workflows
      }
    }
  },
  {
    method: 'GET',
    path: '/api/workflow/{workflowId}/actions',
    handler: async (request) => {
      const workflow = await Workflow.findByPk(request.params.workflowId)
      if (workflow === null || workflow === undefined) {
        throw notFound('WORKFLOW_NOT_FOUND')
      }
      const start = request.query.start !== undefined ? parseInt(request.query.start, 10) : 0
      const stop = request.query.stop !== undefined ? Math.max(parseInt(request.query.stop, 10), 200) : 20
      const instances = await workflow.getInstances(start, stop)
      return {
        instances
      }
    }
  },
  {
    method: 'GET',
    path: '/api/workflow/{workflowId}/instances',
    handler: async (request) => {
      const workflow = await Workflow.findByPk(request.params.workflowId)
      if (workflow === null || workflow === undefined) {
        throw notFound('WORKFLOW_NOT_FOUND')
      }
      const start = request.query.start !== undefined ? parseInt(request.query.start, 10) : 0
      const stop = request.query.stop !== undefined ? Math.max(parseInt(request.query.stop, 10), 200) : 20
      const instances = await workflow.getInstances(start, stop)
      return {
        instances
      }
    }
  },
  {
    method: 'POST',
    path: '/api/workflow/{workflowId}/trigger',
    handler: async (request) => {
      const workflow = await Workflow.findByPk(request.params.workflowId)
      if (workflow === null || workflow === undefined) {
        throw notFound('WORKFLOW_NOT_FOUND')
      }

      const currentUser = request.auth.credentials.user as User | undefined
      if (workflow.isPrivate) {
        const workflowOwner = await workflow.getUser()
        if (workflowOwner !== null && workflowOwner !== undefined && workflowOwner.id !== currentUser?.id && workflow.isPrivate) {
          throw forbidden('FORBIDDEN')
        }
      }

      const instance = await workflow.createInstance()
      return {
        workflow,
        instance
      }
    }
  }
]

export default workflowRouter
