# api2 Migration Gap Analysis

Generated: 2026-06-23

This document compares the current handwritten API layer under `src/shared/api` with the generated proto HTTP clients under `src/shared/api2`. The goal is to identify what is still missing before `src/shared/api2` can replace `src/shared/api`.

## Summary

`src/shared/api2` cannot directly replace `src/shared/api` yet.

`api2` currently contains generated proto service clients, but the application still depends on the old `http` runtime from `src/shared/api/request.ts` and the WebSocket manager from `src/shared/api/websocket.ts`. The generated clients also return proto response objects directly, while existing domain stores expect the old `ApiResponse<T>` shape.

## Runtime Gaps

| Missing capability | Current location | Notes |
|---|---|---|
| `http.get/post/put/delete` | `src/shared/api/request.ts` | Existing domain APIs call these methods directly. |
| `ApiResponse<T>` | `src/shared/api/request.ts` | Existing callers expect `{ code, data, message }`. Generated api2 clients return proto response objects directly. |
| `RequestConfig` | `src/shared/api/request.ts` | Existing runtime supports `showLoading`, `retry`, `timeout`, `params`, and `data`. |
| Token injection | `src/shared/api/request.ts` | api2 has no Taro request handler adapter yet. |
| Platform signature fields | `src/shared/api/request.ts` | Old runtime injects `_platform` and `_clientType`. |
| 401 token refresh | `src/shared/api/request.ts` | api2 does not refresh tokens or redirect to login. |
| 403/412 risk handling | `src/shared/api/request.ts` | 2FA challenge and pending request replay are missing. |
| Mock interceptor | `src/shared/api/mock-interceptor.ts` | api2 is not wired to existing mock routes. |
| Loading and network toast behavior | `src/shared/api/request.ts` | Existing loading and timeout/network error UI are missing. |
| WebSocket manager | `src/shared/api/websocket.ts` | api2 has no replacement for `wsManager`. |

## Generated api2 Services

The generated api2 layer currently provides these services:

| Module | Service | RPCs |
|---|---|---|
| `admin/v1` | `AdminService` | `CreateAudit`, `ListAudits`, `ListAuditsByTarget`, `GetDashboardSummary`, `LockUser`, `UnlockUser`, `ChangeUserRole`, `ApproveProduct`, `RejectProduct`, `ResolveDispute`, `RiskOverride`, `RemoveRiskOverride` |
| `community/v1` | `CommunityService` | `CreatePost`, `GetPost`, `ListPosts`, `CreateCircle`, `GetCircle`, `ListCircles`, `ListCirclePosts`, `ToggleLike`, `ToggleFavorite`, `FollowUser`, `UnfollowUser`, `ListFollowers`, `ListFollowees`, `CreateComment`, `DeleteComment`, `ListComments`, `JoinCircle`, `LeaveCircle`, `ListCircleMembers`, `TransferCircleOwnership` |
| `eventbus/v1` | `EventBusService` | `Publish`, `Subscribe`, `ListEvents` |
| `finance/v1` | `FinanceService` | `GetBalance`, `CreateTransaction`, `ListTransactions`, `RecordCommission`, `SettleRevenue`, `GenerateReport`, `ListReports` |
| `identity/v1` | `IdentityService` | `Register`, `Login`, `GetUser`, `UpdateTrustScore` |
| `logistics/v1` | `LogisticsService` | `CreateShipment`, `GetShipment`, `ListShipments`, `UpdateTracking` |
| `marketing/v1` | `MarketingService` | `CreateCouponTemplate`, `IssueCoupon`, `UseCoupon`, `ListUserCoupons`, `GetPoints`, `AddPoints`, `SpendPoints`, `GenerateReferralCode`, `BindReferral`, `CreateCampaign`, `UpdateCampaign`, `GetCampaign`, `ListCampaigns`, `ActivateCampaign`, `DeactivateCampaign`, `AddCampaignRule`, `RemoveCampaignRule`, `GetCampaignRules`, `BatchIssueCoupon`, `GetCampaignStats`, `GetCouponStats` |
| `messaging/v1` | `MessagingService` | `SendMessage`, `GetConversation`, `ListConversations`, `ListMessages` |
| `notification/v1` | `NotificationService` | `SendNotification`, `ListNotifications`, `MarkRead`, `MarkAllRead`, `UpdatePreferences`, `GetPreferences` |
| `payment/v1` | `PaymentService` | `CreatePayment`, `GetPayment`, `ListPayments`, `HandleCallback`, `RequestWithdraw`, `ApproveWithdraw`, `ListWithdraws`, `BindPaymentMethod`, `ListPaymentMethods`, `SetDefaultPaymentMethod`, `DeletePaymentMethod` |
| `product/v1` | `ProductService` | `CreateProduct`, `GetProduct`, `ListProducts`, `UpdateStock`, `UpdateStatus`, `ListMyProducts`, `SearchProducts`, `DeleteProduct` |
| `recommendation/v1` | `RecommendationService` | `GetHomeRecommendations`, `GetProductRecommendations`, `TrackBehavior`, `GetUserProfile`, `GetRecommendationExplanation`, `RefreshRecommendations`, `GetTrendingProducts`, `BatchRecommendations` |
| `risk/v1` | `RiskService` | `EvaluateRisk`, `CheckRoute`, `GetRiskProfile`, `ReportEvent`, `GetEvents`, `ManageRules` |
| `search/v1` | `SearchService` | `SearchProducts`, `GetSuggestions`, `SyncIndex`, `ManageSynonyms`, `ListSynonyms`, `SearchDocuments`, `CreateSynonymGroup`, `ListSynonymGroups`, `GetTrending`, `ReindexAll` |
| `trading/v1` | `TradingService` | `CreateOrder`, `GetOrder`, `ListOrders`, `ListMyOrders`, `PayOrder`, `ShipOrder`, `CompleteOrder`, `CancelOrder`, `RaiseDispute` |

## Missing Interfaces By Domain

### Auth

Current source: `src/domains/auth/api.ts`.

api2 only has `IdentityService.Register`, `IdentityService.Login`, `IdentityService.GetUser`, and `IdentityService.UpdateTrustScore`. The following current interfaces are missing or not directly compatible:

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `code2session(platform, code)` | `POST /auth/code2session` | Missing |
| `loginByPhone(phone, code, deviceFingerprint)` | `POST /auth/login-by-phone` | Missing; `IdentityService.Login` is not enough to confirm compatibility. |
| `sendCode(phone)` | `POST /auth/send-code` | Missing |
| `logout()` | `POST /auth/logout` | Missing |
| `verify()` | `GET /auth/verify` | Missing |
| `refresh(refreshToken)` | `POST /auth/refresh` | Missing |
| `getDevices()` | `GET /auth/devices` | Missing |
| `kickDevice(deviceId)` | `DELETE /auth/devices/{deviceId}` | Missing |

### Address

Current source: `src/domains/address/api.ts`.

api2 has no address service.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getList()` | `GET /addresses` | Missing |
| `getDetail(id)` | `GET /addresses/{id}` | Missing |
| `create(data)` | `POST /addresses` | Missing |
| `update(id, data)` | `PUT /addresses/{id}` | Missing |
| `delete(id)` | `DELETE /addresses/{id}` | Missing |
| `setDefault(id)` | `PUT /addresses/{id}` | Missing |

### KYC

Current source: `src/domains/kyc/api.ts`.

api2 has no KYC service.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getStatus()` | `GET /kyc/status` | Missing |
| `sendPhoneCode(phone)` | `POST /kyc/phone/send` | Missing |
| `verifyPhone(phone, code)` | `POST /kyc/phone/verify` | Missing |
| `ocrIdCard(imageUrl, side)` | `POST /kyc/identity/ocr` | Missing |
| `submitIdentity(data)` | `POST /kyc/identity/submit` | Missing |
| `startLiveness()` | `POST /kyc/liveness/start` | Missing |
| `submitLiveness(data)` | `POST /kyc/liveness/submit` | Missing |

### Product

Current source: `src/domains/product/api.ts`.

api2 has `ProductService`, `SearchService`, and `RecommendationService`, but the current product API is not fully covered.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getRecommendations(params)` | `GET /recommendations/home` | Similar: `RecommendationService.GetHomeRecommendations`; response shape must be checked. |
| `getList(params)` | `GET /products` | Similar: `ProductService.ListProducts`; request fields differ. |
| `getDetail(id)` | `GET /products/{id}` | Similar: `ProductService.GetProduct`; id type differs (`string` vs generated `number`). |
| `search(params)` | `GET /products/search` | Similar: `ProductService.SearchProducts` or `SearchService.SearchProducts`; request/response shape must be checked. |
| `searchSuggest(keyword)` | `GET /product/search/suggest` | Similar: `SearchService.GetSuggestions`; not confirmed compatible. |
| `getHotSearches()` | `GET /product/search/hot` | Similar: `SearchService.GetTrending`; not confirmed compatible. |
| `getCategories()` | `GET /categories` | Missing |
| `toggleFavorite(productId)` | `POST /products/{productId}/favorite` | Missing; `CommunityService.ToggleFavorite` may not be product favorite. |
| `getFavorites(page)` | `GET /user/favorites` | Missing |
| `create(data)` | `POST /products` | Similar: `ProductService.CreateProduct`; fields differ. |
| `update(id, data)` | `PUT /products/{id}` | Missing; api2 only has `UpdateStock` and `UpdateStatus`. |

Model mismatch:

| Current product fields | Generated product fields |
|---|---|
| `title`, `categoryId`, `images`, `condition`, `isNegotiable` | `name`, `category`, `stock`, `status` |

### Trade / Order

Current source: `src/domains/trade/api.ts`.

api2 has `TradingService`, but several order workflows are missing.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `createOrder(data)` | `POST /orders` | Similar: `TradingService.CreateOrder`; field compatibility must be checked. |
| `getOrderList(status, page)` | `GET /orders` | Similar: `TradingService.ListOrders` or `ListMyOrders`; response shape must be checked. |
| `getOrderDetail(id)` | `GET /orders/{id}` | Similar: `TradingService.GetOrder`. |
| `getPaymentParams(orderId)` | `POST /orders/{orderId}/pay` | Similar: `TradingService.PayOrder`; must confirm mini-program payment fields `timeStamp`, `nonceStr`, `package`, `signType`, `paySign`. |
| `confirmOrder(orderId)` | `POST /orders/{orderId}/confirm` | Similar: `TradingService.CompleteOrder`; semantic compatibility must be confirmed. |
| `cancelOrder(orderId, reason)` | `POST /orders/{orderId}/cancel` | Similar: `TradingService.CancelOrder`; field compatibility must be checked. |
| `requestRefund(orderId, reason)` | `POST /orders/{orderId}/refund` | Missing |
| `submitReview(orderId, data)` | `POST /orders/{orderId}/review` | Missing |
| `appendReview(orderId, data)` | `POST /orders/{orderId}/review/append` | Missing |

### Offer

Current source: `src/domains/trade/offer.ts`.

api2 has no offer service.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `create(data)` | `POST /offers` | Missing |
| `getList(params)` | `GET /offers` | Missing |
| `getDetail(id)` | `GET /offers/{id}` | Missing |
| `accept(id)` | `POST /offers/{id}/accept` | Missing |
| `reject(id)` | `POST /offers/{id}/reject` | Missing |
| `counter(id, amount)` | `POST /offers/{id}/counter` | Missing |
| `withdraw(id)` | `POST /offers/{id}/withdraw` | Missing |

### Community

Current source: `src/domains/community/api.ts`.

api2 has `CommunityService`, but feed and some interaction workflows are missing.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getFeed(params)` | `GET /community/feed` | Missing; `ListPosts` is not necessarily feed-equivalent. |
| `getPostDetail(id)` | `GET /community/posts/{id}` | Similar: `CommunityService.GetPost`. |
| `createPost(data)` | `POST /community/posts` | Similar: `CommunityService.CreatePost`; field compatibility must be checked. |
| `likePost(id)` | `POST /community/posts/{id}/like` | Similar: `CommunityService.ToggleLike`; response compatibility must be checked. |
| `collectPost(id)` | `POST /community/posts/{id}/collect` | Similar: `CommunityService.ToggleFavorite`; semantic compatibility must be confirmed. |
| `getComments(postId, params)` | `GET /community/posts/{postId}/comments` | Similar: `CommunityService.ListComments`. |
| `addComment(postId, content, parentId)` | `POST /community/posts/{postId}/comments` | Similar: `CommunityService.CreateComment`. |
| `likeComment(commentId)` | `POST /community/comments/{commentId}/like` | Missing |
| `getCircles()` | `GET /community/circles` | Similar: `CommunityService.ListCircles`. |
| `getCircleDetail(id)` | `GET /community/circles/{id}` | Requires combining `GetCircle` and `ListCirclePosts`; old response returns `{ circle, posts }`. |
| `joinCircle(circleId)` | `POST /community/circles/{circleId}/join` | Similar: `CommunityService.JoinCircle`. |
| `leaveCircle(circleId)` | `DELETE /community/circles/{circleId}/join` | Similar: `CommunityService.LeaveCircle`. |
| `deleteComment(commentId)` | `DELETE /community/comments/{commentId}` | Similar: `CommunityService.DeleteComment`. |
| `applyCreatorCertification(data)` | `POST /community/creator/certification` | Missing |

### User

Current source: `src/domains/user/api.ts`.

api2 has partial overlap through `IdentityService`, `CommunityService`, and `ProductService`, but user profile pages are not fully covered.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getProfile(userId)` | `GET /users/{userId}` | Similar: `IdentityService.GetUser`; response compatibility must be checked. |
| `getUserProducts(userId, params)` | `GET /users/{userId}/products` | Missing; `ProductService.ListMyProducts` is only for the current user. |
| `getUserReviews(userId, params)` | `GET /users/{userId}/reviews` | Missing |
| `follow(userId)` | `POST /users/{userId}/follow` | Similar: `CommunityService.FollowUser`; response compatibility must be checked. |
| `unfollow(userId)` | `DELETE /users/{userId}/follow` | Similar: `CommunityService.UnfollowUser`; response compatibility must be checked. |
| `getFollowers(params)` | `GET /users/followers` | Similar: `CommunityService.ListFollowers`; request/response compatibility must be checked. |
| `getFollowing(params)` | `GET /users/following` | Similar: `CommunityService.ListFollowees`; request/response compatibility must be checked. |
| `getMyListings(params)` | `GET /me/products` | Similar: `ProductService.ListMyProducts`; response compatibility must be checked. |
| `deleteListing(id)` | `DELETE /products/{id}` | Similar: `ProductService.DeleteProduct`. |

### Wallet / Finance / Payment

Current source: `src/domains/wallet/api.ts`.

api2 has `FinanceService` and `PaymentService`, but wallet semantics and response fields are not confirmed.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getBalance()` | `GET /escrow/balance` | Similar: `FinanceService.GetBalance`; escrow semantics must be checked. |
| `getTransactions(page)` | `GET /escrow/transactions` | Similar: `FinanceService.ListTransactions`; old response includes `total` and `hasMore`. |
| `createWithdraw(data)` | `POST /withdraw` | Similar: `PaymentService.RequestWithdraw`; fields `paymentAccountId` and `note` must be checked. |
| `getPaymentAccounts()` | `GET /payment-accounts` | Similar: `PaymentService.ListPaymentMethods`; payment account vs payment method semantics must be checked. |
| `bindPaymentAccount(data)` | `POST /payment-accounts` | Similar: `PaymentService.BindPaymentMethod`; field compatibility must be checked. |
| `deletePaymentAccount(id)` | `DELETE /payment-accounts/{id}` | Similar: `PaymentService.DeletePaymentMethod`; semantic compatibility must be checked. |

### Marketing

Current source: `src/domains/marketing/api.ts`.

api2 has coupon, points, referral, and campaign RPCs, but several frontend marketing workflows are missing.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getCheckinData()` | `GET /marketing/checkin` | Missing |
| `checkin()` | `POST /marketing/checkin` | Missing |
| `getPointsData()` | `GET /marketing/points` | Similar: `MarketingService.GetPoints`; response compatibility must be checked. |
| `getPointsRecords(params)` | `GET /marketing/points/records` | Missing; api2 does not expose a user points transaction list RPC. |
| `getCoupons(params)` | `GET /marketing/coupons` | Similar: `MarketingService.ListUserCoupons`; response compatibility must be checked. |
| `useCoupon(id)` | `POST /marketing/coupons/{id}/use` | Similar: `MarketingService.UseCoupon`; field compatibility must be checked. |
| `exchangeCoupon(couponId)` | `POST /marketing/coupons/{couponId}/exchange` | Missing |
| `getReferralInfo()` | `GET /marketing/referral/info` | Missing; api2 has `GenerateReferralCode` and `BindReferral`, not referral summary. |
| `claimCoupon(couponTemplateId)` | `POST /marketing/coupons/claim` | Missing or incompatible; api2 `IssueCoupon` likely models issuing, not user claiming. |
| `getCouponTemplates()` | `GET /marketing/coupons/templates` | Missing user-facing template list; api2 has `CreateCouponTemplate`. |
| `getCommissionData()` | `GET /marketing/commission` | Missing |

### Notification

Current source: `src/domains/notification/api.ts`.

api2 has basic notification list/read/preference RPCs, but count and detail APIs are missing.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getNotifications(params)` | `GET /notifications` | Similar: `NotificationService.ListNotifications`; request/response compatibility must be checked. |
| `getUnreadCount()` | `GET /notifications/unread-count` | Missing |
| `markAsRead(id)` | `POST /notifications/{id}/read` | Similar: `NotificationService.MarkRead`. |
| `markAllAsRead()` | `POST /notifications/read-all` | Similar: `NotificationService.MarkAllRead`. |
| `getPreferences()` | `GET /notifications/preferences` | Similar: `NotificationService.GetPreferences`. |
| `updatePreferences(data)` | `PUT /notifications/preferences` | Similar: `NotificationService.UpdatePreferences`. |
| `getDetail(id)` | `GET /notifications/{id}` | Missing |

### Chat / Messaging

Current source: `src/domains/chat/api.ts`.

api2 has `MessagingService`, but current conversation controls and WebSocket support are missing.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getThreads()` | `GET /threads` | Similar: `MessagingService.ListConversations`; response compatibility must be checked. |
| `getMessages(threadId, page)` | `GET /threads/{threadId}/messages` | Similar: `MessagingService.ListMessages`; response compatibility must be checked. |
| `markRead(threadId)` | `POST /threads/{threadId}/read` | Missing |
| `blockUser(userId)` | `POST /blocks` | Missing |
| `unblockUser(userId)` | `DELETE /blocks` | Missing |
| `sendReadReceipt(threadId, messageIds)` | `POST /threads/{threadId}/read-receipt` | Missing |
| `deleteThread(id)` | `DELETE /threads/{id}` | Missing |
| `pinThread(id, pinned)` | `POST /threads/{id}/pin` | Missing |
| `wsManager.connect/send/on/off/disconnect/getState` | WebSocket runtime | Missing |

### Admin

Current source: `src/domains/admin/api.ts`.

api2 has `AdminService` and `PaymentService`, but the current admin API is not fully covered.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getDashboard()` | `GET /admin/dashboard` | Similar: `AdminService.GetDashboardSummary`; response compatibility must be checked. |
| `getUsers(params)` | `GET /admin/users` | Missing |
| `banUser(id)` | `POST /admin/users/{id}/ban` | Similar: `AdminService.LockUser`; semantic compatibility must be checked. |
| `unbanUser(id)` | `POST /admin/users/{id}/unban` | Similar: `AdminService.UnlockUser`; semantic compatibility must be checked. |
| `getPendingProducts(page)` | `GET /admin/products/pending` | Missing |
| `approveProduct(id)` | `POST /admin/products/{id}/approve` | Similar: `AdminService.ApproveProduct`. |
| `rejectProduct(id, reason)` | `POST /admin/products/{id}/reject` | Similar: `AdminService.RejectProduct`. |
| `getWithdrawals(page)` | `GET /admin/withdrawals` | Similar: `PaymentService.ListWithdraws`, but not in admin service and path/permissions may differ. |
| `approveWithdrawal(id)` | `POST /admin/withdrawals/{id}/approve` | Similar: `PaymentService.ApproveWithdraw`. |
| `rejectWithdrawal(id)` | `POST /admin/withdrawals/{id}/reject` | Missing |
| `getDisputes(page)` | `GET /admin/disputes` | Missing |
| `resolveDispute(id, decision)` | `POST /admin/disputes/{id}/resolve` | Similar: `AdminService.ResolveDispute`; field compatibility must be checked. |

### Seller

Current source: `src/domains/seller/api.ts`.

api2 has no seller service.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getStats()` | `GET /seller/stats` | Missing |
| `getProducts(params)` | `GET /seller/products` | Similar: `ProductService.ListMyProducts`; old response uses `{ list, total }` and seller-specific fields. |
| `updateProductStatus(id, status)` | `POST /seller/products/{id}/status` | Similar: `ProductService.UpdateStatus`; path and permissions must be checked. |
| `deleteProduct(id)` | `DELETE /seller/products/{id}` | Similar: `ProductService.DeleteProduct`; path and permissions must be checked. |

### Shipping / Logistics

Current source: `src/domains/shipping/api.ts`.

api2 has `LogisticsService`, but the current shipping API is order-based.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| `getTracking(orderId)` | `GET /shipping/{orderId}` | Similar: `LogisticsService.GetShipment`; must confirm whether lookup is by order ID or shipment ID. |
| `createShipping(data)` | `POST /shipping` | Similar: `LogisticsService.CreateShipment`; fields `orderId`, `trackingNumber`, `company`, and response `{ id }` must be checked. |

### Poster

Current source: `src/shared/components/share/PosterGenerator/index.tsx`.

api2 has no poster service.

| Current interface | Endpoint | Status in api2 |
|---|---|---|
| poster generation | `GET /poster/generate` | Missing |

## api2 Services Not Currently Used By Old Frontend APIs

These generated services or RPC groups do not correspond directly to existing frontend API calls:

| Generated area | Notes |
|---|---|
| `eventbus/v1` | No current direct frontend API wrapper. |
| `risk/v1` | Existing frontend only handles risk responses; it does not call risk APIs directly. |
| `recommendation/v1` behavior tracking/explanation/batch APIs | Existing product API only calls home recommendations. |
| `search/v1` indexing/synonym/document APIs | More backend/admin-oriented than current frontend search API. |
| `marketing/v1` campaign management APIs | Current frontend marketing API is user-facing. |
| `admin/v1` audit and risk override APIs | No current frontend wrappers found. |

## Priority Backlog

To make `src/shared/api2` a real replacement for `src/shared/api`, implement or add proto coverage in this order:

1. Build `src/shared/api2/request-handler.ts` to adapt generated `RequestHandler` calls to Taro and preserve token injection, refresh, risk handling, mock handling, loading, and error behavior.
2. Add an api2 compatibility facade that preserves the old domain API shape or migrate all callers away from `ApiResponse<T>`.
3. Add missing auth RPCs: code session, SMS code, phone login, verify, refresh, logout, device list, and kick device.
4. Add address CRUD RPCs.
5. Add KYC RPCs.
6. Add offer RPCs.
7. Add chat conversation control RPCs and keep or replace `wsManager`.
8. Add notification unread count and detail RPCs.
9. Align product fields and add categories, favorites, full update, hot search, and suggestions.
10. Add trade refund and review RPCs, and confirm mini-program payment response compatibility.
11. Add seller dashboard/list/status/delete APIs.
12. Add poster generation API.

