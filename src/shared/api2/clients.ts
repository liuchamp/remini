import {
  createAdminServiceClient,
  createCommunityServiceClient,
  createEventBusServiceClient,
  createFinanceServiceClient,
  createIdentityServiceClient,
  createLogisticsServiceClient,
  createMarketingServiceClient,
  createMessagingServiceClient,
  createNotificationServiceClient,
  createPaymentServiceClient,
  createProductServiceClient,
  createRecommendationServiceClient,
  createRiskServiceClient,
  createSearchServiceClient,
  createTradingServiceClient,
} from './generated'
import { createApi2RequestHandler } from './runtime'

const handler = createApi2RequestHandler()

export const adminService = createAdminServiceClient(handler)
export const communityService = createCommunityServiceClient(handler)
export const eventBusService = createEventBusServiceClient(handler)
export const financeService = createFinanceServiceClient(handler)
export const identityService = createIdentityServiceClient(handler)
export const logisticsService = createLogisticsServiceClient(handler)
export const marketingService = createMarketingServiceClient(handler)
export const messagingService = createMessagingServiceClient(handler)
export const notificationService = createNotificationServiceClient(handler)
export const paymentService = createPaymentServiceClient(handler)
export const productService = createProductServiceClient(handler)
export const recommendationService = createRecommendationServiceClient(handler)
export const riskService = createRiskServiceClient(handler)
export const searchService = createSearchServiceClient(handler)
export const tradingService = createTradingServiceClient(handler)
