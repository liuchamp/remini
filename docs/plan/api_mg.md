# api2 Migration Remaining Plan

Generated: 2026-06-24

## Goal

Use `src/shared/api2` to replace the remaining handwritten `src/shared/api/request.ts` HTTP usage while keeping existing pages and stores stable during the migration.

The migration must stay incremental:

1. Domain API public contracts keep returning the legacy `ApiResponse<T>` shape first.
2. Each migrated domain gets compatibility tests before implementation changes.
3. Generated files under `src/shared/api2/generated/` are not edited by hand.
4. `src/shared/api/request.ts` is removed only after all direct `http` consumers are migrated or deliberately replaced.

## Current Status

Completed:

- `src/shared/api2/runtime.ts`
  - Adapts generated `{ path, method, body }` requests to `Taro.request`.
  - Normalizes generated paths such as `api/v1/products` to `/api/v1/products`.
  - Adds token, platform, client type, and JSON headers.
  - Unwraps `{ code, data, message }` responses for generated service clients.
  - Handles existing mock lookup, network errors, timeout toast, `403`, and `412`.
  - Refreshes token on `401` by calling `/api/v1/auth/refresh` and replaying the original request once.
- `src/shared/api2/clients.ts`
  - Exports typed clients such as `productService`, `marketingService`, `logisticsService`, and `notificationService`.
- `src/shared/api2/index.ts`
  - Re-exports runtime helpers, clients, and generated types.
- `vitest.config.ts`
  - Adds `@ -> src` alias for tests.
- Migrated domains:
  - `src/domains/address/api.ts` -> `logisticsService`
  - `src/domains/notification/api.ts` -> `notificationService`
  - `src/domains/marketing/api.ts` -> `marketingService`
- Tests added:
  - `src/shared/api2/runtime.test.ts`
  - `src/domains/address/api.test.ts`
  - `src/domains/notification/api.test.ts`
  - `src/domains/marketing/api.test.ts`

Latest verification:

- `rtk pnpm test` passes: 5 test files, 9 tests.
- `rtk tsc --noEmit` still fails with 79 existing project TypeScript errors outside the migrated API files.

## Remaining Direct `src/shared/api/request` Consumers

Domain files still importing `http`:

- `src/domains/product/api.ts`
- `src/domains/community/api.ts`
- `src/domains/chat/api.ts`
- `src/domains/trade/api.ts`
- `src/domains/trade/offer.ts`
- `src/domains/wallet/api.ts`
- `src/domains/shipping/api.ts`
- `src/domains/auth/api.ts`
- `src/domains/auth/utils.ts`
- `src/domains/auth/store.ts`
- `src/domains/kyc/api.ts`
- `src/domains/user/api.ts`
- `src/domains/seller/api.ts`
- `src/domains/admin/api.ts`

Non-domain direct callers:

- `src/pages/auth/challenge/index.tsx`
- `src/pages/profile/edit/index.tsx`
- `src/shared/components/share/PosterGenerator/index.tsx`

Migrated domains still importing only the legacy type:

- `src/domains/address/api.ts`
- `src/domains/notification/api.ts`
- `src/domains/marketing/api.ts`

These type-only imports can remain until the final contract cleanup phase.

## Recommended Migration Order

1. `product`
2. `community`
3. `chat`
4. `trade`
5. `wallet`
6. `shipping`
7. `user`
8. `seller`
9. `admin`
10. `auth`
11. `kyc`
12. scattered direct callers
13. final cleanup

The order keeps lower-risk read-heavy domains first, then moves into transaction/payment/auth/risk-sensitive flows.

## Task 1: Product Domain

Files:

- Modify: `src/domains/product/api.ts`
- Test: `src/domains/product/api.test.ts`
- Use clients:
  - `productService`
  - `searchService`
  - `recommendationService`

Current methods:

- `getRecommendations(params)`
- `getList(params)`
- `getDetail(id)`
- `search(params)`
- `searchSuggest(keyword)`
- `getHotSearches()`
- `getCategories()`
- `toggleFavorite(productId)`
- `getFavorites(page)`
- `create(data)`
- `update(id, data)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getRecommendations` | `recommendationService.GetHomeRecommendations` | Map `{ page, limit, tab }`; generated response fields must be adapted to `{ products, hasMore }`. |
| `getList` | `productService.ListProducts` | Map filters carefully; preserve `{ products, total, hasMore }`. |
| `getDetail` | `productService.GetProduct` | Convert string id to number. |
| `search` | `searchService.SearchProducts` or `productService.SearchProducts` | Prefer `searchService` if it has suggestions/trending as the same bounded search context. |
| `searchSuggest` | `searchService.GetSuggestions` | Preserve `{ suggestions }`. |
| `getHotSearches` | `searchService.GetTrending` | Preserve `{ keywords }`. |
| `getCategories` | `productService.ListCategories` | Confirm generated response shape. |
| `toggleFavorite` | `productService.ToggleProductFavorite` | Preserve `{ isFavorited }`. |
| `getFavorites` | `productService.ListFavoriteProducts` | Preserve `{ products, hasMore }`. |
| `create` | `productService.CreateProduct` | Map `title -> title/name` according to generated request fields. |
| `update` | `productService.UpdateProduct` | Map optional fields and string id. |

Compatibility tests:

- List maps generated response to `{ code: 0, data: { products, total, hasMore }, message: 'ok' }`.
- Detail maps `product.id` to string if existing page types expect string.
- Search suggestions and hot searches keep old response keys.
- Favorite toggle keeps old `isFavorited` key.
- Create/update keep old `Product` shape.

Risks:

- Existing `Product` model and generated `Product` model differ. Add mapper functions instead of leaking generated models into pages.
- `page`/`limit` vs `pageSize` names may differ.
- Category and favorite APIs may have field differences that need generated message inspection before implementation.

## Task 2: Community Domain

Files:

- Modify: `src/domains/community/api.ts`
- Test: `src/domains/community/api.test.ts`
- Use client: `communityService`

Current methods:

- `getFeed(params)`
- `getPostDetail(id)`
- `createPost(data)`
- `likePost(id)`
- `collectPost(id)`
- `getComments(postId, params)`
- `addComment(postId, content, parentId)`
- `likeComment(commentId)`
- `getCircles()`
- `getCircleDetail(id)`
- `joinCircle(circleId)`
- `leaveCircle(circleId)`
- `deleteComment(commentId)`
- `applyCreatorCertification(data)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getFeed` | `communityService.GetFeed` | Prefer this over `ListPosts`; preserve `{ posts, hasMore }`. |
| `getPostDetail` | `communityService.GetPost` | Convert id to number. |
| `createPost` | `communityService.CreatePost` | Map old `CreatePostData` fields. |
| `likePost` | `communityService.ToggleLike` | Preserve `{ isLiked, likeCount }`. |
| `collectPost` | `communityService.ToggleFavorite` | Preserve void response if UI does not need returned state. |
| `getComments` | `communityService.ListComments` | Preserve `{ comments, hasMore }`. |
| `addComment` | `communityService.CreateComment` | Map `parentId` if supported. |
| `likeComment` | `communityService.ToggleCommentLike` | Preserve `{ isLiked, likeCount }`. |
| `getCircles` | `communityService.ListCircles` | Preserve `Circle[]`. |
| `getCircleDetail` | `communityService.GetCircle` + `ListCirclePosts` | Old response is `{ circle, posts }`; combine two calls. |
| `joinCircle` | `communityService.JoinCircle` | Preserve void response. |
| `leaveCircle` | `communityService.LeaveCircle` | Preserve void response. |
| `deleteComment` | `communityService.DeleteComment` | Preserve void response. |
| `applyCreatorCertification` | `communityService.ApplyCreatorCertification` | Map old fields into generated request. |

Compatibility tests:

- Feed maps generated post list into existing `Post` shape.
- Circle detail combines `GetCircle` and `ListCirclePosts`.
- Like/comment like preserve old response keys.
- Creator certification returns legacy void `ApiResponse`.

Risks:

- Shared components may depend on richer `Post` fields than generated API returns. Mapper must default fields safely.
- Circle model currently has page-local type conflicts. Do not broaden this migration into page type cleanup unless required by tests.

## Task 3: Chat Domain

Files:

- Modify: `src/domains/chat/api.ts`
- Test: `src/domains/chat/api.test.ts`
- Keep: `src/domains/chat/store.ts` uses `wsManager`; do not migrate WebSocket yet.
- Use client: `messagingService`

Current methods:

- `getThreads()`
- `getMessages(threadId, page)`
- `markRead(threadId)`
- `blockUser(userId)`
- `unblockUser(userId)`
- `sendReadReceipt(threadId, messageIds)`
- `deleteThread(id)`
- `pinThread(id, pinned)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getThreads` | `messagingService.ListConversations` | Map conversations to `ChatThread[]`. |
| `getMessages` | `messagingService.ListMessages` | Convert thread/conversation id. |
| `markRead` | `messagingService.MarkConversationRead` | Preserve void response. |
| `blockUser` | `messagingService.BlockUser` | Preserve old response shape. |
| `unblockUser` | `messagingService.UnblockUser` | Preserve old response shape. |
| `sendReadReceipt` | `messagingService.SendReadReceipt` | Map `messageIds`. |
| `deleteThread` | `messagingService.DeleteConversation` | Preserve void response. |
| `pinThread` | `messagingService.PinConversation` | Map `pinned`. |

Compatibility tests:

- Thread list maps generated conversation fields to old `ChatThread`.
- Message list maps generated message fields to old `ChatMessage`.
- Mutations call correct generated methods with numeric ids.

Risks:

- WebSocket events still depend on `src/shared/api/websocket.ts`. Keep HTTP migration separate from realtime migration.

## Task 4: Trade And Offer Domains

Files:

- Modify: `src/domains/trade/api.ts`
- Modify: `src/domains/trade/offer.ts`
- Test: `src/domains/trade/api.test.ts`
- Test: `src/domains/trade/offer.test.ts`
- Use client: `tradingService`
- Possibly use: `identityService` for review methods if generated review RPCs are only there.

Current trade methods:

- `createOrder(data)`
- `getOrderList(status, page)`
- `getOrderDetail(id)`
- `getPaymentParams(orderId)`
- `confirmOrder(orderId)`
- `cancelOrder(orderId, reason)`
- `requestRefund(orderId, reason)`
- `submitReview(orderId, data)`
- `appendReview(orderId, data)`

Current offer methods:

- `create(data)`
- `getList(params)`
- `getDetail(id)`
- `accept(id)`
- `reject(id)`
- `counter(id, amount)`
- `withdraw(id)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `createOrder` | `tradingService.CreateOrder` | Map product/address/offer/coupon/points fields. |
| `getOrderList` | `tradingService.ListMyOrders` or `ListOrders` | Preserve `{ orders, total, hasMore }`. |
| `getOrderDetail` | `tradingService.GetOrder` | Convert id. |
| `getPaymentParams` | `tradingService.PayOrder` | Confirm mini-program payment fields. |
| `confirmOrder` | `tradingService.CompleteOrder` | Confirm semantics. |
| `cancelOrder` | `tradingService.CancelOrder` | Map reason if supported. |
| `requestRefund` | `tradingService.RequestRefund` | Use if present in generated service. |
| `submitReview` | `identityService.CreateReview` | Confirm request fields. |
| `appendReview` | `identityService.AppendReview` | Confirm request fields. |
| offer methods | `tradingService.*Offer` | Generated service includes create/list/get/accept/reject/counter/withdraw offer methods. |

Compatibility tests:

- Order list and detail preserve old result shapes.
- Payment params preserve existing `PaymentParams` fields: `timeStamp`, `nonceStr`, `package`, `signType`, `paySign`.
- Offer methods preserve `Offer` shape from `src/domains/trade/offer.ts`.
- Risk-related `412` behavior remains covered by runtime tests.

Risks:

- Payment flow is high risk. Do not migrate payment params without a targeted test for mini-program payment field names.
- Order pages currently contain existing TS errors. Keep API migration separate from page refactors.

## Task 5: Wallet Domain

Files:

- Modify: `src/domains/wallet/api.ts`
- Test: `src/domains/wallet/api.test.ts`
- Use clients:
  - `financeService`
  - `paymentService`

Current methods:

- `getBalance()`
- `getTransactions(page)`
- `createWithdraw(data)`
- `getPaymentAccounts()`
- `bindPaymentAccount(data)`
- `deletePaymentAccount(id)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getBalance` | `financeService.GetBalance` | Requires current user id. Preserve `EscrowBalance`. |
| `getTransactions` | `financeService.ListTransactions` | Preserve `{ transactions, total, hasMore }`. |
| `createWithdraw` | `paymentService.RequestWithdraw` | Map `paymentAccountId`, amount, note. |
| `getPaymentAccounts` | `paymentService.ListPaymentMethods` | Map method model to `PaymentAccount`. |
| `bindPaymentAccount` | `paymentService.BindPaymentMethod` | Map account fields. |
| `deletePaymentAccount` | `paymentService.DeletePaymentMethod` | Convert id. |

Compatibility tests:

- Balance maps generated balance to old `EscrowBalance`.
- Transaction list keeps `total` and `hasMore`.
- Payment method list maps `methodType/accountNo/accountName` to old payment account fields.

Risks:

- Wallet has existing TypeScript errors in store/pages. Keep the API compatibility layer stable and do not fix unrelated wallet UI issues in the same step.
- Escrow semantics may differ from generic finance balance.

## Task 6: Shipping Domain

Files:

- Modify: `src/domains/shipping/api.ts`
- Test: `src/domains/shipping/api.test.ts`
- Use client: `logisticsService`

Current methods:

- `getTracking(orderId)`
- `createShipment(data)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getTracking` | `logisticsService.GetShipmentByOrder` | Preserve old `TrackingInfo`. |
| `createShipment` | `logisticsService.CreateShipment` | Preserve `{ id }`. |

Compatibility tests:

- Tracking maps generated shipment/tracking fields to old shape.
- Create shipment returns string id.

Risks:

- Generated tracking model may not contain complete frontend tracking timeline fields. Mapper may need safe defaults.

## Task 7: User Domain

Files:

- Modify: `src/domains/user/api.ts`
- Test: `src/domains/user/api.test.ts`
- Use clients:
  - `identityService`
  - `communityService`
  - `productService`

Current methods:

- `getProfile(userId)`
- `getUserProducts(userId, params)`
- `getUserReviews(userId, params)`
- `follow(userId)`
- `unfollow(userId)`
- `getFollowers(params)`
- `getFollowing(params)`
- `getMyListings(params)`
- `deleteListing(id)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getProfile` | `identityService.GetUser` or `recommendationService.GetUserProfile` | Pick the richer user profile source after inspecting generated response. |
| `getUserProducts` | `productService.ListUserProducts` | Preserve `{ products, total, hasMore }`. |
| `getUserReviews` | `identityService.ListUserReviews` | Preserve `{ reviews, total, hasMore }`. |
| `follow` | `communityService.FollowUser` | Preserve `{ isFollowed }`. |
| `unfollow` | `communityService.UnfollowUser` | Preserve response. |
| `getFollowers` | `communityService.ListFollowers` | Preserve `{ users, hasMore }`. |
| `getFollowing` | `communityService.ListFollowees` | Preserve `{ users, hasMore }`. |
| `getMyListings` | `productService.ListMyProducts` | Preserve `{ products, hasMore }`. |
| `deleteListing` | `productService.DeleteProduct` | Preserve void response. |

Compatibility tests:

- Profile mapper defaults optional fields.
- Follow/unfollow ids convert safely.
- User products/reviews preserve pagination shape.

Risks:

- User profile pages may expect fields not present in generated `User`. Add defaults in mapper.

## Task 8: Seller Domain

Files:

- Modify: `src/domains/seller/api.ts`
- Test: `src/domains/seller/api.test.ts`
- Use client: `productService`

Current methods:

- `getStats()`
- `getProducts(params)`
- `updateProductStatus(id, status)`
- `deleteProduct(id)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getStats` | `productService.GetSellerStats` | Preserve `SellerStats`. |
| `getProducts` | `productService.ListMyProducts` | Preserve `{ list, total }`. |
| `updateProductStatus` | `productService.UpdateStatus` | Convert id. |
| `deleteProduct` | `productService.DeleteProduct` | Convert id. |

Compatibility tests:

- Stats maps generated stats to old field names.
- Product list keeps `list` key, not `products`, because existing seller API exposes `{ list, total }`.

Risks:

- Seller product model may differ from public product model.

## Task 9: Admin Domain

Files:

- Modify: `src/domains/admin/api.ts`
- Test: `src/domains/admin/api.test.ts`
- Use client: `adminService`
- Possibly use: `paymentService` for withdrawal approval if generated admin and payment services split responsibilities.

Current methods:

- `getDashboard()`
- `getUsers(params)`
- `banUser(id)`
- `unbanUser(id)`
- `getPendingProducts(page)`
- `approveProduct(id)`
- `rejectProduct(id, reason)`
- `getWithdrawals(page)`
- `approveWithdrawal(id)`
- `rejectWithdrawal(id)`
- `getDisputes(page)`
- `resolveDispute(id, decision)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getDashboard` | `adminService.GetDashboardSummary` | Preserve dashboard response shape. |
| `getUsers` | `adminService.ListUsers` | Preserve existing list shape. |
| `banUser` | `adminService.LockUser` | Semantic rename: ban -> lock. |
| `unbanUser` | `adminService.UnlockUser` | Semantic rename: unban -> unlock. |
| `getPendingProducts` | `adminService.ListPendingProducts` | Preserve pagination. |
| `approveProduct` | `adminService.ApproveProduct` | Map admin id if required. |
| `rejectProduct` | `adminService.RejectProduct` | Map reason. |
| `getWithdrawals` | `adminService.ListAdminWithdraws` | Preserve pagination. |
| `approveWithdrawal` | `paymentService.ApproveWithdraw` or generated admin method if present | Confirm generated service. |
| `rejectWithdrawal` | `adminService.RejectWithdraw` or `paymentService.RejectWithdraw` | Confirm generated service. |
| `getDisputes` | `adminService.ListDisputes` | Preserve pagination. |
| `resolveDispute` | `adminService.ResolveDispute` | Map decision to generated fields. |

Compatibility tests:

- Dashboard and list responses keep old shapes.
- Ban/unban call Lock/Unlock with numeric ids.
- Product approval/rejection preserves old method signatures.

Risks:

- Existing admin API uses `any`; migrating should reduce but not force a full admin type rewrite unless tests require it.

## Task 10: Auth Domain

Files:

- Modify: `src/domains/auth/api.ts`
- Modify: `src/domains/auth/utils.ts`
- Modify: `src/domains/auth/store.ts`
- Test: `src/domains/auth/api.test.ts`
- Test: `src/domains/auth/store.test.ts` if store migration changes behavior.
- Use client: `identityService`

Current methods:

- `code2session(platform, code)`
- `loginByPhone(phone, code, deviceFingerprint)`
- `sendCode(phone)`
- `register(data)`
- `logout()`
- `verify()`
- `refresh(refreshToken)`
- `getDevices()`
- `kickDevice(deviceId)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `code2session` | `identityService.Code2Session` | Confirm generated request fields. |
| `loginByPhone` | `identityService.LoginByPhone` | Preserve `LoginResponse`. |
| `sendCode` | `identityService.SendAuthCode` | Preserve `{ cooldown }`. |
| `register` | `identityService.Register` | Preserve `LoginResponse`. |
| `logout` | `identityService.Logout` | Preserve response. |
| `verify` | `identityService.VerifyToken` or `GetUser` | Runtime already verifies token implicitly; choose generated method matching old behavior. |
| `refresh` | `identityService.RefreshToken` | Also used by runtime; avoid duplicate divergent refresh logic. |
| `getDevices` | `identityService.ListDevices` | Preserve `DeviceSession[]`. |
| `kickDevice` | `identityService.KickDevice` | Convert id. |

Compatibility tests:

- Login/register keep `{ user, token, refreshToken }`.
- Refresh writes no storage directly in domain API; runtime owns storage refresh.
- Store `checkAuth` keeps old behavior.

Risks:

- Auth is high-risk because runtime refresh already calls `/api/v1/auth/refresh`. Make sure domain refresh and runtime refresh share compatible response assumptions.
- `src/pages/auth/challenge/index.tsx` still uses old pending request helpers. Do not migrate it until api2 412 pending replay API is wired into the page.

## Task 11: KYC Domain

Files:

- Modify: `src/domains/kyc/api.ts`
- Test: `src/domains/kyc/api.test.ts`
- Use client: `identityService`

Current methods:

- `getStatus()`
- `sendPhoneCode(phone)`
- `verifyPhone(phone, code)`
- `ocrIdCard(imageUrl, side)`
- `submitIdentity(data)`
- `startLiveness()`
- `submitLiveness(data)`

api2 mapping:

| Current method | api2 candidate | Notes |
|---|---|---|
| `getStatus` | `identityService.GetKYCStatus` | Preserve `KycStatus`. |
| `sendPhoneCode` | `identityService.SendKYCPhoneCode` | Preserve old response. |
| `verifyPhone` | `identityService.VerifyKYCPhone` | Preserve `{ newTier: 'L1' }`. |
| `ocrIdCard` | `identityService.OCRIDCard` | Preserve `IdentityOcrResult`. |
| `submitIdentity` | `identityService.SubmitIdentity` | Preserve `{ verificationId }`. |
| `startLiveness` | `identityService.StartLiveness` | Preserve `{ challengeId, challenges }`. |
| `submitLiveness` | `identityService.SubmitLiveness` | Preserve `{ newTier: 'L3' }`. |

Compatibility tests:

- Each generated response maps to old KYC UI expected fields.
- Side values and identity image fields map without `any`.

Risks:

- KYC pages already have existing TS errors. Keep migration scoped to API behavior.

## Task 12: Scattered Direct Callers

Files:

- `src/pages/auth/challenge/index.tsx`
- `src/pages/profile/edit/index.tsx`
- `src/shared/components/share/PosterGenerator/index.tsx`

Plan:

1. `src/pages/auth/challenge/index.tsx`
   - Replace old pending request helpers with api2 pending request helpers from `src/shared/api2/runtime.ts`.
   - Add compatibility test if the page logic can be isolated; otherwise add a runtime test for `getPendingApi2Request`, `resolvePendingApi2Request`, and replay behavior.
   - Keep old `resolvePendingRequest` only until every `412` flow is api2.
2. `src/pages/profile/edit/index.tsx`
   - Move raw `http.post('/user/profile')` into `src/domains/user/api.ts`.
   - After user domain migration, call the domain API from the page.
3. `src/shared/components/share/PosterGenerator/index.tsx`
   - Decide whether poster generation belongs to a new domain API or a shared utility API.
   - Add `src/shared/api2` support only if generated proto has a poster route. If not, create a small domain/shared wrapper around the runtime instead of keeping direct `http` usage in a component.

Risks:

- `PosterGenerator` endpoint may not exist in generated api2. Do not delete old runtime until this has an explicit replacement.
- Auth challenge replay is security-sensitive. Keep behavior covered by tests.

## Task 13: Runtime And Contract Cleanup

Do this only after all domain and scattered callers are migrated.

Files:

- `src/shared/api/request.ts`
- `src/shared/api/mock-interceptor.ts`
- `src/shared/api/mocks/*`
- `src/domains/*/api.ts`
- `src/shared/api2/runtime.ts`
- `src/shared/api2/README.md`
- `src/domains/AGENTS.md`
- `src/shared/AGENTS.md`

Steps:

1. Run:
   - `rtk grep -R "@/shared/api/request" src -n`
   - `rtk grep -R "http\\." src -n`
2. Remove all remaining runtime dependencies on `http`.
3. Decide final response contract:
   - Short term: keep `ApiResponse<T>` wrappers in domain APIs.
   - Final state: unwrap at domain level and return domain data directly only after updating stores/pages.
4. Move the `ApiResponse<T>` type to a neutral location if wrappers remain:
   - Recommended: `src/shared/api2/types.ts`
5. Migrate mocks:
   - Either update old mock routes to generated `/api/v1/...` paths.
   - Or create api2 service-level mocks for tests and development.
6. Remove `src/shared/api/request.ts` only after:
   - No runtime import remains.
   - No type-only import remains.
   - Auth challenge replay is fully api2.
7. Update project docs:
   - `src/domains/AGENTS.md`
   - `src/shared/AGENTS.md`
   - `docs/api2-migration-gap-analysis.md`
   - `src/shared/api2/README.md`

## Testing Requirements

For every domain migration:

1. Add a failing compatibility test first.
2. Mock only the generated service client.
3. Assert old public API response shape, not generated internals.
4. Assert generated client request arguments for id conversion, pagination, and important filters.
5. Run targeted tests:
   - `rtk pnpm test src/domains/<domain>/api.test.ts`
6. Run full tests:
   - `rtk pnpm test`
7. Run type check:
   - `rtk tsc --noEmit`

Current expected type-check status:

- `rtk tsc --noEmit` fails because of existing project errors.
- A migration is acceptable only if no new errors appear in touched files.

## Known Existing TypeScript Blockers

These are not caused by the api2 migration but block a clean full `tsc`:

- `config/index.ts` Taro config type mismatches.
- `config/prod.ts` Rollup output type mismatch.
- `src/domains/wallet/store.ts` missing `PaymentAccount`.
- Multiple pages pass unsupported `text` prop to `Empty`.
- Community circle/page model mismatches.
- `src/pages/message/index.tsx` missing `useNotificationStore`.
- Order create/pay/list page type errors.
- Wallet transaction page type errors.
- `src/shared/api/websocket.ts` Taro socket type errors.
- Platform utility type errors around Taro APIs.
- `src/shared/types/index.ts` imports `api.d.ts` as a module.

Do not mix broad TypeScript cleanup into API migration PRs unless a blocker is in a touched API file.

## Definition Of Done

The api2 replacement is complete when:

- `rtk grep -R "@/shared/api/request" src -n` returns no production imports.
- `rtk grep -R "http\\." src -n` returns no production API calls.
- All domain APIs use `@/shared/api2` clients or a documented api2 runtime wrapper.
- Auth challenge replay uses `getPendingApi2Request` / `resolvePendingApi2Request` or a final equivalent.
- `src/shared/components/share/PosterGenerator/index.tsx` no longer calls the old `http` runtime directly.
- Mocks work with generated `/api/v1/...` paths or are replaced by api2 service mocks.
- `src/shared/api/request.ts` is deleted or reduced to a temporary type-only shim with a removal date.
- `src/shared/api2/README.md`, `src/domains/AGENTS.md`, and `src/shared/AGENTS.md` describe the new API standard.
- Full test suite passes with `rtk pnpm test`.
- Full type check has no new errors from api2 migration files.
