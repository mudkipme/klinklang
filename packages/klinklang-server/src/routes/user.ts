import { ServerRoute } from '@hapi/hapi'

const userRouter: ServerRoute[] = [
  {
    method: 'GET',
    path: '/api/user/me',
    options: {
      auth: {
        mode: 'try'
      }
    },
    handler: async (request) => {
      return {
        user: request.auth.credentials?.user ?? null
      }
    }
  }
]

export default userRouter
