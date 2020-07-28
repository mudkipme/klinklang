import { User } from '../interfaces'

export type GlobalAction =
 | {
   type: 'FULFILL_USER_INFO'
   user: User | null
 }

export const fulfillUserInfo = (user: User | null): GlobalAction => ({
  type: 'FULFILL_USER_INFO',
  user
})
