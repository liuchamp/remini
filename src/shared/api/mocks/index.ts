import { registerMocks } from '../mock-interceptor'
import { communityMocks } from './community'

export function initAllMocks() {
  registerMocks(communityMocks)
}
