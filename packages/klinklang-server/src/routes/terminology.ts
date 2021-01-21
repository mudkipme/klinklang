import { ServerRoute } from '@hapi/hapi'
import { replace, TerminologyReplaceInput } from '../services/terminology'

const terminologyRouter: ServerRoute[] = [
  {
    method: 'POST',
    path: '/api/terminology/replace',
    options: {
      auth: false
    },
    handler: async (request) => {
      const text = await replace(request.payload as TerminologyReplaceInput)
      return { text }
    }
  }
]

export default terminologyRouter
