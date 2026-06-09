import { registerMocks } from '../mock-interceptor'
import { communityMocks } from './community'
import { marketingMocks } from './marketing'
import { tradeMocks } from './trade'

export function initAllMocks() {
  registerMocks(communityMocks)
  registerMocks(marketingMocks)
  registerMocks(tradeMocks)
}
