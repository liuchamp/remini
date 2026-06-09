import { registerMocks } from '../mock-interceptor'
import { communityMocks } from './community'
import { marketingMocks } from './marketing'
import { tradeMocks } from './trade'
import { notificationMocks } from './notification'

export function initAllMocks() {
  registerMocks(communityMocks)
  registerMocks(marketingMocks)
  registerMocks(tradeMocks)
  registerMocks(notificationMocks)
}
