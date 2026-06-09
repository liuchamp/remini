import { registerMocks } from '../mock-interceptor'
import { communityMocks } from './community'
import { marketingMocks } from './marketing'
import { tradeMocks } from './trade'
import { notificationMocks } from './notification'
import { chatMocks } from './chat'
import { authMocks } from './auth'
import { adminMocks } from './admin'

export function initAllMocks() {
  registerMocks(communityMocks)
  registerMocks(marketingMocks)
  registerMocks(tradeMocks)
  registerMocks(notificationMocks)
  registerMocks(chatMocks)
  registerMocks(authMocks)
  registerMocks(adminMocks)
}
