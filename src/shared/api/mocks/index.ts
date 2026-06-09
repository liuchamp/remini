import { registerMocks } from '../mock-interceptor'
import { communityMocks } from './community'
import { marketingMocks } from './marketing'

export function initAllMocks() {
  registerMocks(communityMocks)
  registerMocks(marketingMocks)
}
