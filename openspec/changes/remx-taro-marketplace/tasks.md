## 1. Project Setup & Dependencies

- [ ] 1.1 Install core dependencies: zustand, axios, dayjs
- [ ] 1.2 Install NutUI Taro: @nutui/nutui-taro, @nutui/icons-react-taro
- [ ] 1.3 Install i18n: i18next, react-i18next, i18next-icu
- [ ] 1.4 Configure tsconfig.json (enable noImplicitAny, strict mode)
- [ ] 1.5 Update config/index.ts (CSS modules, designWidth for NutUI 375, optimizeMainPackage)
- [ ] 1.6 Update config/prod.ts (CDN path, production optimizations)
- [ ] 1.7 Create project directory structure (pages, domains, shared, styles, types)

## 2. Core Infrastructure

- [ ] 2.1 Create app.config.ts with all pages + 5-tab tabBar + subPackages + preloadRule
- [ ] 2.2 Create shared/api/request.ts (Taro.request wrapper with interceptor chain)
- [ ] 2.3 Implement token management: storage, refresh, auto-injection, 401 handling
- [ ] 2.4 Create shared/api/websocket.ts (WebSocket singleton, reconnection, heartbeat, polling fallback)
- [ ] 2.5 Create shared/hooks (useAuth, usePullToRefresh, useInfiniteScroll, useDebounce, useImageUpload, useGeoLocation)
- [ ] 2.6 Create shared/utils (format.ts, validate.ts, platform.ts, storage.ts)
- [ ] 2.7 Create global styles: variables.scss, mixins.scss, reset.scss, nutui-override.scss
- [ ] 2.8 Create shared/types (api envelope, global domain types)
- [ ] 2.9 Update app.tsx with global initialization (auth check, i18n init, WS connect)
- [ ] 2.10 Update app.scss with CSS variables and NutUI theme overrides

## 3. Auth & User Module (specs/user-auth, specs/kyc-verification)

- [ ] 3.1 Create domains/auth/ (api.ts, types.ts, store.ts, utils.ts)
- [ ] 3.2 Implement auth store (login, logout, refresh, token persistence via zustand persist)
- [ ] 3.3 Create PlatformAPI abstraction layer in shared/utils/platform.ts (login, payment, media, location)
- [ ] 3.4 Build pages/auth/login/index.tsx (WeChat one-click login + phone login)
- [ ] 3.5 Build pages/auth/register/index.tsx (phone + password + referral code)
- [ ] 3.6 Build pages/kyc/index.tsx (KYC tier overview L0-L3)
- [ ] 3.7 Build pages/kyc/phone/index.tsx (L1 phone verification)
- [ ] 3.8 Build pages/kyc/identity/index.tsx (L2 ID OCR upload + preview)
- [ ] 3.9 Create domains/kyc/ (api.ts, types.ts, store.ts for KYC lifecycle)
- [ ] 3.10 Implement auth guard middleware (route-level login requirement)

## 4. Product Browsing & Search (specs/product-browse)

- [ ] 4.1 Create domains/product/ (api.ts, types.ts, store.ts)
- [ ] 4.2 Implement product store (list, detail, search, favorites)
- [ ] 4.3 Build pages/index/index.tsx (homepage: banner carousel, category grid, recommendation feed)
- [ ] 4.4 Build pages/category/index.tsx (multi-level category browser)
- [ ] 4.5 Build pages/product/search/index.tsx (keyword search + filter panel + sort)
- [ ] 4.6 Build pages/product/detail/index.tsx (image swiper, info, seller, offer section)
- [ ] 4.7 Create shared/components/product/ (ProductCard, ProductGrid, PriceDisplay)
- [ ] 4.8 Implement favorite toggle (add/remove, list page)
- [ ] 4.9 Implement infinite scroll in product list + search results
- [ ] 4.10 Build "nearby products" feature with Taro.getLocation

## 5. Product Publishing (specs/product-publish)

- [ ] 5.1 Extend domains/product/ with publish API and store
- [ ] 5.2 Create shared/components/MediaUploader (wx.chooseMedia + compress + RustFS upload)
- [ ] 5.3 Build pages/publish/index.tsx (multi-image picker, title, price, condition, pricing mode)
- [ ] 5.4 Implement pricing mode selector (fixed price / negotiable)
- [ ] 5.5 Build product edit page (reuse publish form with pre-filled data)
- [ ] 5.6 Implement form validation (title, price, images required)

## 6. Order & Payment (specs/trade-order)

- [ ] 6.1 Create domains/trade/ (api.ts, types.ts, store.ts, payment.weapp.ts, payment.alipay.ts, payment.h5.ts)
- [ ] 6.2 Implement trade store (order CRUD, payment, confirm, refund)
- [ ] 6.3 Build pages/order/create/index.tsx (address selection, coupon, points, note)
- [ ] 6.4 Build pages/order/pay/index.tsx (wx.requestPayment integration)
- [ ] 6.5 Build pages/order/list/index.tsx (tab filter: all/pending_paid/pending_ship/pending_receive/completed)
- [ ] 6.6 Build pages/order/detail/index.tsx (status timeline, actions, logistics link)
- [ ] 6.7 Implement seller shipping confirmation (select logistics + tracking number)
- [ ] 6.8 Implement buyer order confirmation (with prompt)
- [ ] 6.9 Implement order cancellation (with reason selection)
- [ ] 6.10 Build pages/review/index.tsx (star rating + images + tags)

## 7. Offer Negotiation (specs/offer-negotiation)

- [ ] 7.1 Create domains/trade/offer.ts (api, types, store for offer lifecycle)
- [ ] 7.2 Build offer creation panel in product detail (amount + note input)
- [ ] 7.3 Build pages/offer/list/index.tsx (sent/received tabs)
- [ ] 7.4 Build pages/offer/detail/index.tsx (accept/reject/counter/withdraw actions)
- [ ] 7.5 Implement offer expiry handling (48h TTL)
- [ ] 7.6 Implement rate limiting (1 offer per product per minute)

## 8. Shipping & Logistics (specs/shipping-logistics)

- [ ] 8.1 Create domains/address/ (api.ts, types.ts, store.ts)
- [ ] 8.2 Build pages/address/list/index.tsx (CRUD address list)
- [ ] 8.3 Build pages/address/edit/index.tsx (province-city-district picker, validation)
- [ ] 8.4 Create domains/shipping/ (api.ts, types.ts for logistics tracking)
- [ ] 8.5 Build pages/logistics/track/index.tsx (timeline view of shipping status)
- [ ] 8.6 Implement default address logic and address limit (max 20)

## 9. Wallet & Escrow (specs/escrow-wallet)

- [ ] 9.1 Create domains/wallet/ (api.ts, types.ts, store.ts)
- [ ] 9.2 Build pages/wallet/index/index.tsx (balance overview, held/frozen/available)
- [ ] 9.3 Build pages/wallet/transactions/index.tsx (paginated transaction history)
- [ ] 9.4 Build pages/wallet/withdraw/index.tsx (amount input, bank card selection, submit)
- [ ] 9.5 Build pages/wallet/bind-card/index.tsx (bank card info form + verification)

## 10. Community Feed (specs/community-feed)

- [ ] 10.1 Create domains/community/ (api.ts, types.ts, store.ts)
- [ ] 10.2 Build pages/community/feed/index.tsx (tabs: recommended/trending/following)
- [ ] 10.3 Build pages/community/post/index.tsx (post content, comments, likes)
- [ ] 10.4 Build pages/community/create/index.tsx (text + image + product/circle association)
- [ ] 10.5 Create shared/components/community/ (PostCard, CreatorBadge, ShowcaseBadge, ProductCardEmbedded)
- [ ] 10.6 Build circle list page and detail page
- [ ] 10.7 Build creator center (apply, commission dashboard, leaderboard)

## 11. Instant Messaging (specs/instant-messaging)

- [ ] 11.1 Create domains/chat/ (api.ts, types.ts, store.ts, websocket.ts)
- [ ] 11.2 Implement ChatWebSocketManager (send, receive, markRead, reconnect, fallback polling)
- [ ] 11.3 Build pages/message/index.tsx (conversation list with unread counts)
- [ ] 11.4 Build pages/chat/conversation/index.tsx (message list, input, image picker, product card share)
- [ ] 11.5 Implement block user feature
- [ ] 11.6 Implement read receipts (show read status + timestamp)

## 12. Notifications (specs/notification-center)

- [ ] 12.1 Create domains/notification/ (api.ts, types.ts, store.ts)
- [ ] 12.2 Build pages/notification/index.tsx (categorized notification list with tabs)
- [ ] 12.3 Implement unread badge (TabBar badge + list unread markers)
- [ ] 12.4 Implement mark as read (single + batch)
- [ ] 12.5 Implement notification polling fallback (since SSE not available in mini program)

## 13. Marketing Tools (specs/marketing-tools)

- [ ] 13.1 Create domains/marketing/ (api.ts, types.ts, store.ts)
- [ ] 13.2 Build pages/checkin/index.tsx (daily check-in with calendar)
- [ ] 13.3 Build pages/points/index.tsx (balance, transaction history)
- [ ] 13.4 Build pages/points/shop/index.tsx (points-to-coupon exchange)
- [ ] 13.5 Build pages/coupon/list/index.tsx (active/used/expired tabs)
- [ ] 13.6 Build pages/referral/index.tsx (invite code, link, leaderboard, poster)
- [ ] 13.7 Implement referral poster generation (canvas-based)

## 14. Seller Dashboard (specs/seller-dashboard)

- [ ] 14.1 Create domains/seller/ (api.ts, types.ts, store.ts)
- [ ] 14.2 Build pages/seller/index.tsx (dashboard: on-sale/pending-offers/pending-ship orders)
- [ ] 14.3 Build offer management view (accept/reject/counter offers)
- [ ] 14.4 Build product management view (on-sale/sold/archived tabs)

## 15. Admin Panel (specs/admin-panel)

- [ ] 15.1 Create domains/admin/ (api.ts, types.ts)
- [ ] 15.2 Build admin login guard
- [ ] 15.3 Build pages/admin/index.tsx (dashboard: KPIs, charts)
- [ ] 15.4 Build admin user management (list, search, ban/unban)
- [ ] 15.5 Build admin product review (pending approvals)
- [ ] 15.6 Build admin dispute resolution (chat timeline, decision)
- [ ] 15.7 Build admin withdrawal approval queue
- [ ] 15.8 Build admin marketing management (coupon templates, campaigns)

## 16. i18n Multi-language (specs/i18n-multi-lang)

- [ ] 16.1 Create shared/i18n/ (index.ts with i18next init)
- [ ] 16.2 Create zh-CN locale files (common, auth, product, trade, chat, profile, validation)
- [ ] 16.3 Create en-US locale files (common, auth, product, trade, chat, profile, validation)
- [ ] 16.4 Add language switch UI (in profile settings)
- [ ] 16.5 Wrap all UI text with useTranslation() hook
- [ ] 16.6 Implement system language auto-detection

## 17. Profile & Settings (specs/user-profile)

- [ ] 17.1 Build pages/profile/index.tsx (avatar, name, trust score, stats, menu entries)
- [ ] 17.2 Build pages/profile/edit/index.tsx (avatar upload via chooseMedia, nickname, bio)
- [ ] 17.3 Build my listings page (user's published products, edit/delete)
- [ ] 17.4 Build my favorites page (favorited products, unfavorite)
- [ ] 17.5 Build my follows page (following users list, unfollow)
- [ ] 17.6 Build users.$id page (public user profile, listings, reviews)
- [ ] 17.7 Build settings page (about, privacy policy, logout)

## 18. Testing & Optimization

- [ ] 18.1 Add subpackage verification (ensure main package < 2MB)
- [ ] 18.2 Add image lazy loading across all list pages
- [ ] 18.3 Add skeleton loading states for all detail pages
- [ ] 18.4 Add empty state components for all list pages
- [ ] 18.5 Add error boundaries and retry logic
- [ ] 18.6 Verify all API interceptor flows (token refresh, error handling)
- [ ] 18.7 Verify all navigation flows (tab switch, page stack management)
- [ ] 18.8 Verify platform adaptation (weapp primary, alipay secondary, h5 fallback)
- [ ] 18.9 Run bundle analysis (taro build --type weapp --analyzer)
