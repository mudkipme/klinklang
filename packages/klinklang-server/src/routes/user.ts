import { ServerRoute } from '@hapi/hapi'
import { User } from '@mudkipme/klinklang-prisma'
import { outputUser } from '../models/user'

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
        user: request.auth.credentials?.user != null ? outputUser(request.auth.credentials.user as User) : null
      }
    }
  }
]

export default userRouter
