import createError from '@fastify/error'

export const workflowNotFoundError = createError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404)
export const forbiddenError = createError('FORBIDDEN', 'Forbidden', 403)
export const unauthorizedError = createError('UNAUTHORIZED', 'Unauthorized', 401)
