# Design: REMX Taro Marketplace Mini App

## Context

REMX is a C2C second-hand trading platform. The existing web application (React Router 7 + SSR) suffers from poor mobile UX — slow loading, no native capabilities, cumbersome sharing, and low user retention. We are building a cross-platform mini app using **Taro 4.2.0 + React 18 + TypeScript** to leverage the mini-program ecosystem (WeChat, Alipay, H5) for improved traffic acquisition and transaction conversion.

### Current Project State

The existing project at `myApp` is a Taro 4.2.0 scaffold initialized from the ASCF template:

| Aspect | Current State |
|--------|---------------|
| Taro version | 4.2.0 (Vite compiler) |
| Framework | React 18 |
| Styling | Sass |
| Pages | 1 (pages/index/index) |
| State Management | None |
| UI Library | None |
| Platforms | weapp, alipay, h5, ascf (all platforms configured in package.json) |
| Compiler | Vite (`@tarojs/vite-runner`) |

### Backend Integration

The existing backend API is shared with the web version. The mini app reuses these APIs with a single addition: an `X-Client-Type: miniapp` header for platform identification. New endpoints are needed only for WeChat/Alipay `code2session` authentication and mini-program payment unified order.

### API Conventions

- All API responses follow a unified envelope: `{ code: number, data: T, message: string }`
- Authentication via Bearer token in `Authorization` header
- Pagination via cursor-based `pageSize + lastId` parameters
- Real-time updates via WebSocket (separate connection from HTTP API)

---

## Goals / Non-Goals

### Goals

- **Cross-platform mini app** supporting WeChat Mini Program (primary), Alipay (secondary), and H5 (fallback)
- **Full C2C feature parity** with the web version across all 16 capability domains
- **Maintainable project structure** with clear domain boundaries and separation of concerns
- **Subpackage loading** ensuring main package < 2 MB for WeChat Mini Program compliance
- **Backend API reuse** with minimal changes — only platform-specific auth and payment adaptations
- **Offline resilience** — degrade gracefully when network is unavailable, with local cache for critical data
- **i18n support** for Chinese and English, switchable at runtime

### Non-Goals

- Modifying the existing web application codebase
- Implementing features not listed in the proposal
- Backend API redesign or schema migration
- React Native or desktop platform support
- Full end-to-end test coverage (unit + integration only)

---

## Decisions

### 1. State Management: Zustand

**Decision**: Use Zustand v5 as the global state management layer.

**Rationale**:

| Criterion | Zustand | Redux Toolkit | Jotai | Context + useReducer |
|-----------|---------|--------------|-------|---------------------|
| Bundle size | ~2 KB | ~11 KB | ~4 KB | 0 KB (built-in) |
| Provider wrapper | None | Required | Optional | Required per context |
| Taro compatibility | Native | Requires adapter | Native | Native |
| Devtools | Built-in `devtools` middleware | Integrated | External | Manual |
| Learning curve | Low | Medium | Low | Low |
| Persistence | `persist` middleware | Extra lib | Extra lib | Manual |

Zustand is the clear winner for mini apps:
- **No Provider wrapper** means no tree re-render when state changes — critical for mini program performance where excessive re-renders are costly
- **Minimal bundle size** keeps the main package under the 2 MB limit
- **Taro-compatible** out of the box — no React DOM dependency issues
- **Middleware ecosystem** covers persistence (mmkv/storage), devtools, immer for immutable updates

**Store structure** (per domain, lazily loaded):

```
stores/
  authStore.ts          # user session, token, profile
  productStore.ts       # browse, search, filters
  tradeStore.ts         # orders, payments, escrow
  chatStore.ts          # instant messaging state
  notificationStore.ts  # unread count, notification list
  uiStore.ts            # global UI state (theme, locale, loading)
```

Each store is a separate Zustand `create()` call, composable via `useStore()` hooks in React components. Cross-store communication uses Zustand's `getState()` (not events), avoiding coupling.

### 2. UI Framework: NutUI Taro

**Decision**: Use NutUI Taro (`@nutui/nutui-taro`) as the primary UI component library.

**Rationale**:

| Criterion | NutUI Taro | Taro UI | Vant Weapp | Custom |
|-----------|-----------|---------|------------|--------|
| Taro 4 support | ✅ Native | ⚠️ @next WIP | ❌ (native weapp) | ✅ |
| Cross-platform | ✅ weapp/alipay/h5 | ✅ weapp/alipay/h5 | ❌ weapp only | ✅ |
| Bundle size | ~200 KB (tree-shakable) | ~300 KB | ~400 KB | Unlimited |
| Component coverage | 60+ (full suite) | 50+ | 70+ | Skeleton |
| Customization | CSS variables + Sass | Override styles | Weapp-only | Full control |
| Maintenance | Active (JD.com team) | Maintained | Community | Internal cost |

NutUI Taro is the official UI library maintained by the Taro team (JD.com). It:
- Has first-class Taro 4 compatibility with tree-shaking via `@nutui/nutui-taro`
- Supports all target platforms (weapp, alipay, h5, ascf) without shims
- Provides business-oriented components: Address, Sku, Uploader, ShortPassword, Invoice — directly usable for marketplace features
- Allows theme customization via CSS variables (`--nut-*`), making brand theming straightforward
- Has a `nutui.react` variant with React 18 hooks support

**Theming strategy**:
- Define brand colors as CSS variables in `src/styles/variables.scss`
- Override NutUI's default `--nut-*` variables in the app's global stylesheet
- Component-level overrides use Sass modules with NutUI's BEM naming convention

### 3. Project Structure: Domain-Driven Directory Layout

**Decision**: Organize source code by domain (feature), not by file type.

```
src/
  app.ts                    # App entry: providers, global init
  app.config.ts             # App config: pages, subPackages, window
  app.scss                  # Global styles + NutUI theme overrides

  pages/                    # Taro page components (thin, delegates to domain)
    index/                  # Homepage
    product/                # Product detail
    category/               # Category browse
    search/                 # Search results
    publish/                # Product publish
    chat/                   # IM conversation list
    conversation/           # Single conversation
    user/                   # Profile center
    order/                  # Order list
    order-detail/           # Order detail
    wallet/                 # Escrow wallet
    community/              # Community feed
    notification/           # Notification center
    kyc/                    # KYC verification
    seller/                 # Seller dashboard
    admin/                  # Admin panel (subpackage)
    address/                # Address management
    offer/                  # Offer/negotiation

  domains/                  # Domain business logic (no Taro imports)
    auth/
      api.ts                # API calls (login, logout, refresh)
      types.ts              # Interfaces & types
      store.ts              # Zustand store for auth
      utils.ts              # Token helpers, validation
    product/
      api.ts
      types.ts
      store.ts
      utils.ts
    trade/
      api.ts
      types.ts
      store.ts
      utils.ts
    chat/
      api.ts
      types.ts
      store.ts
      websocket.ts          # WebSocket connection + reconnection
      utils.ts
    community/
      api.ts
      types.ts
      store.ts
    notification/
      api.ts
      types.ts
      store.ts
    wallet/
      api.ts
      types.ts
      store.ts

  shared/                   # Cross-domain shared code
    api/
      request.ts            # HTTP interceptor (token, retry, timeout)
      websocket.ts          # WebSocket manager (singleton)
      mock.ts               # Development mock interceptors
    components/
      Loading/              # Skeleton loading component
      Empty/                # Empty state placeholder
      ErrorBoundary/        # Error boundary with retry
      Avatar/               # User avatar (with fallback)
      PriceDisplay/         # Price formatting component
      MediaUploader/        # Cross-platform media picker
      Toast/                # Toast/Snackbar wrapper
      PullToRefresh/        # Pull-to-refresh component
      InfiniteScroll/       # Infinite scroll component
    hooks/
      useAuth.ts            # Auth state hook
      usePullToRefresh.ts   # Pull-to-refresh logic
      useInfiniteScroll.ts  # Infinite scroll logic
      useDebounce.ts        # Debounced value
      useThrottle.ts        # Throttled callback
      useCountDown.ts       # Countdown timer
      useImageUpload.ts     # Image upload with compression
      useLocation.ts        # Geolocation hook (platform-adapted)
    i18n/
      index.ts              # i18n instance
      zh-CN.ts              # Chinese locale
      en-US.ts              # English locale
    utils/
      format.ts             # Date, number, price formatting
      validate.ts           # Form validation rules
      platform.ts           # Platform detection helpers
      storage.ts            # Taro Storage wrapper with TTL
      crypto.ts             # AES/RSA encryption helpers
    constants/
      api.ts                # API endpoints
      config.ts             # App constants
      enums.ts              # Shared enumerations

  styles/
    variables.scss          # Design tokens (colors, spacing, fonts)
    mixins.scss             # Sass mixins and functions
    reset.scss              # Cross-platform style reset
    nutui-override.scss     # NutUI theme variable overrides

  types/
    global.d.ts             # Global type declarations
    api.d.ts                # API response envelope types
    taro.d.ts               # Taro platform type extensions
```

**Rationale**:
- **Domain isolation**: Each domain is self-contained with its own API layer, types, store, and utils. Changing one domain rarely affects others.
- **Lazy store loading**: Domains can register their Zustand stores only when their pages are loaded (subpackage-friendly).
- **Shared layer**: Components, hooks, and utilities shared across domains live in `shared/` — no circular dependencies.
- **Page thinness**: Pages are thin view components that delegate all logic to domain modules. This allows easy testing and potential future extraction into a separate design system.

### 4. Subpackage Strategy

**Decision**: Use Taro's native subpackage configuration (`app.config.ts` → `subPackages`) with main package hosting the most-frequented pages.

**WeChat Mini Program constraint**: Main package must be < 2 MB. Subpackages are lazily loaded on navigation.

```
# Main package (must stay < 2 MB)
pages/
  index/index                # Homepage (feed + recommended)
  category/index             # Category listing
  search/index               # Search (results page)
  product/index              # Product detail
  user/index                 # Profile center
  chat/index                 # IM conversation list
  notification/index         # Notification center

# Subpackage A: Trade & Transaction
trade-pkg/
  pages/
    order/index              # Order list
    order-detail/index       # Order detail
    address/index            # Address management
    wallet/index             # Wallet & balance
    offer/index              # Offer/negotiation list
  stores/                    # Domain stores isolated to this subpackage
    tradeStore.ts
    walletStore.ts

# Subpackage B: Publish & Community
social-pkg/
  pages/
    publish/index            # Product publish (heavy: media picker, OCR)
    community/index          # Community feed
    conversation/index       # Single conversation (WebSocket-heavy)
    kyc/index                # KYC verification (OCR SDK)
  stores/
    productPublishStore.ts
    communityStore.ts
    chatStore.ts

# Subpackage C: Seller & Admin
seller-pkg/
  pages/
    seller/index             # Seller dashboard (stats, charts)
    admin/index              # Admin panel (only for operators)
  stores/
    sellerStore.ts

# Subpackage D: Static pages
static-pkg/
  pages/
    about/index              # About page
    privacy/index            # Privacy policy
    terms/index              # Terms of service
    faq/index                # FAQ
```

**Key strategies for keeping main package < 2 MB**:

1. **Lazy import heavy libraries**: NutUI components are imported per-page via tree-shaking. Heavy deps like QR code generation, OCR SDK, and charts live only in subpackages.
2. **Shared code extraction**: Taro's `mini.commonChunks` configuration extracts runtime, Taro core, and shared utilities into separate common chunks that reside in the main package.
3. **Image optimization**: All static assets use WebP format with lazy loading. Icons use icon font or SVG sprite, never individual PNGs.
4. **NutUI on-demand import**: Use babel-plugin-import or manual per-component imports: `import { Button } from '@nutui/nutui-taro'` — only the used components are bundled.
5. **Taro's optimizeMainPackage**: Enable `mini.optimizeMainPackage` in config to automatically extract subpackage-only modules into subpackage chunks instead of the main package.

### 5. Network Layer: Request Interceptor

**Decision**: Build a lightweight HTTP client on top of `Taro.request()` with interceptor chain pattern.

```typescript
// Architecture
Request Pipeline:
  [beforeRequest] → [signRequest] → [attachToken] → [Taro.request()] → [parseResponse] → [handleError] → [afterResponse]

// Interceptor chain (executed in order)
interface RequestInterceptor {
  onFulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRejected?: (error: any) => any;
}

interface ResponseInterceptor {
  onFulfilled: (response: Response) => Response | Promise<Response>;
  onRejected?: (error: any) => any;
}
```

**Built-in interceptors**:

| Interceptor | Stage | Purpose |
|-------------|-------|---------|
| `tokenInjector` | Request | Attach `Authorization: Bearer <token>` from auth store |
| `platformSigner` | Request | Add `X-Client-Type: miniapp`, `X-Platform` headers |
| `requestSigner` | Request | Sign request body with HMAC-SHA256 for tamper-proofing |
| `retryHandler` | Response | Auto-retry on 5xx (max 2 retries, exponential backoff) |
| `tokenRefresher` | Response | On 401, attempt token refresh via refresh_token, retry original request |
| `errorNormalizer` | Response | Normalize all error responses into `ApiError` type |
| `toastHandler` | Response | Show toast on non-critical errors (configurable) |

**Token management flow**:

```
[App Launch]
  ↓
[Check storage for token]
  ├── Token exists → validate with GET /api/auth/verify
  │   ├── Valid → proceed
  │   └── Invalid → attempt refresh_token
  │       ├── Success → update tokens, proceed
  │       └── Fail → force re-login
  └── No token → show login gate / guest mode
```

**Design details**:
- Token storage via Zustand `persist` middleware backed by Taro Storage (encrypted with device key)
- All requests timeout after 15 seconds (configurable via `RequestConfig.timeout`)
- Concurrent token refresh is gated by a mutex — if 3 requests trigger 401 simultaneously, only one refresh is attempted
- A `refreshPromise` cache ensures subsequent 401s during refresh wait for the same promise instead of firing parallel refresh calls
- Offline requests are queued and replayed when connectivity resumes (powered by `Taro.onNetworkStatusChange`)

### 6. WebSocket: Connection Lifecycle Management

**Decision**: Implement a singleton WebSocket manager with auto-reconnection, heartbeat, and polling fallback.

```typescript
// Connection states
enum WSState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  RECONNECTING,
  POLLING_FALLBACK,
}
```

**Lifecycle**:

```
                [App Launch]
                     |
              connect() ————→ CONNECTING
                     |              |
                 onOpen          onError
                     |              |
                CONNECTED     DISCONNECTED
                     |              |
               heartbeat      scheduleReconnect()
              (every 30s)         |
                     |        exponentialBackoff()
                  onClose        (1s → 2s → 4s → 8s → 30s max)
                     |              |
              scheduleReconnect()   |
                     |              |
                └───── RECONNECTING ←┘
```

**Key design decisions**:

| Aspect | Design |
|--------|--------|
| Heartbeat | Ping frame every 30s; server must pong within 5s or connection is considered dead |
| Reconnect strategy | Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (cap). Reset on successful connection |
| Max reconnect attempts | Infinite (for foreground). Stop reconnecting after app goes to background |
| Polling fallback | After 5 failed reconnects, fall back to HTTP polling at 15s intervals. Resume WebSocket when connection succeeds |
| Message format | JSON: `{ type: string, payload: object, id: string, timestamp: number }` |
| Message ordering | Each message has a monotonic `seqId`. Out-of-order messages are buffered and reordered |
| Subscriptions | Client subscribes to topics: `chat:userId`, `trade:userId`, `notification:userId`. Server multiplexes all events through one connection |
| Platform differences | WeChat uses `wx.connectSocket`, Alipay uses `my.connectSocket`, H5 uses native `WebSocket`. Taro's `Taro.connectSocket` abstracts this |

**Usage in chat domain**:
```typescript
// domains/chat/websocket.ts
class ChatWebSocketManager {
  private ws: WebSocketManager; // Singleton

  async sendMessage(conversationId: string, content: string): Promise<void>;
  onMessage(conversationId: string, callback: (msg: Message) => void): () => void;
  markRead(conversationId: string, lastMsgId: string): void;
  getUnreadCount(): Promise<number>;
}
```

### 7. Platform Adaptation: Conditional Compilation

**Decision**: Use Taro's built-in conditional compilation (file-level and code-level) for platform-specific code.

**Taro provides three adaptation mechanisms**:

**a) File-level adaptation** (preferred for large differences):

```
src/
  shared/api/
    request.ts              # Base request shared across platforms
  domains/auth/
    api.ts                  # Shared auth API
```

Files with platform suffixes override the base file during compilation:
- `api.weapp.ts` — used only in WeChat build
- `api.alipay.ts` — used only in Alipay build
- `api.h5.ts` — used only in H5 build

**b) Code-level adaptation** (for small differences):

```typescript
import Taro from '@tarojs/taro';

// Runtime platform check
const isWeapp = Taro.getEnv() === Taro.Env.WEAPP;
const isAlipay = Taro.getEnv() === Taro.Env.ALIPAY;
const isH5 = Taro.getEnv() === Taro.Env.WEB;

// Compile-time (dead code elimination)
if (process.env.TARO_ENV === 'weapp') {
  // WeChat-specific: wx.login, wx.requestPayment
} else if (process.env.TARO_ENV === 'alipay') {
  // Alipay-specific: my.getAuthCode, my.tradePay
}
```

**c) Platform-specific components** (for UI differences):

```
shared/components/MediaUploader/
  index.tsx               # Shared logic + imports
  index.weapp.tsx         # WeChat: wx.chooseMedia
  index.alipay.tsx        # Alipay: my.chooseImage + my.chooseVideo
  index.h5.tsx            # H5: <input type="file">
```

**Platform adaptation matrix**:

| Feature | WeChat | Alipay | H5 |
|---------|--------|--------|-----|
| Login | `wx.login` → code2session | `my.getAuthCode` → code2session | OAuth redirect |
| Payment | `wx.requestPayment` | `my.tradePay` | WeChat Pay JSAPI / Alipay web |
| Media picker | `wx.chooseMedia` | `my.chooseImage` + `my.chooseVideo` | `<input type="file">` |
| Location | `wx.getLocation` | `my.getLocation` | Geolocation API |
| Share | `wx.shareAppMessage` | `my.share` | Web Share API / fallback |
| Storage | `wx.setStorageSync` | `my.setStorageSync` | localStorage |
| WebSocket | `wx.connectSocket` | `my.connectSocket` | WebSocket API |
| File download | `wx.downloadFile` | `my.downloadFile` | fetch / XHR |
| OCR (KYC) | `wx.chooseMedia` + server OCR | `my.chooseImage` + server OCR | WebRTC + server OCR |

**Platform abstraction layer** (`shared/utils/platform.ts`):

```typescript
// Wraps all platform-specific APIs behind a unified interface
export const PlatformAPI = {
  login(): Promise<{ code: string }>;
  requestPayment(params: PaymentParams): Promise<PaymentResult>;
  chooseMedia(options?: MediaOptions): Promise<MediaResult>;
  getLocation(): Promise<LocationResult>;
  share(shareData: ShareData): Promise<void>;
  // ... etc
};
```

Each method internally branches on `process.env.TARO_ENV` and calls the appropriate native API. This pattern keeps business logic platform-agnostic.

### 8. i18n: Lightweight Runtime Internationalization

**Decision**: Use `i18next` with `react-i18next` (configured for Taro compatibility), bundled with only Chinese and English locale resources.

**Rationale**:
- `i18next` is the de-facto standard with 30+ language detection and fallback strategies
- `react-i18next` provides `useTranslation()` hook and `<Trans>` component for JSX interpolation
- Bundle size for 2 locales + library core: ~15 KB gzipped
- No runtime polyfill needed — Taro supports all modern JS features

**Language detection order**:
1. User preference (saved in Taro Storage under `@i18n/locale` key)
2. Mini program system language (`Taro.getSystemInfoSync().language`)
3. Default: `zh-CN`

**Resource structure**:
```
shared/i18n/
  index.ts              # i18next init with detection + fallback
  resources/
    zh-CN/
      common.json       # Shared strings (loading, errors, buttons)
      auth.json         # Auth-related strings
      product.json      # Product browse & publish
      trade.json        # Orders, payments, escrow
      chat.json         # IM strings
      profile.json      # User profile, settings
      validation.json   # Form validation messages
    en-US/
      (same structure as zh-CN)
```

**Usage**:
```typescript
import { useTranslation } from 'react-i18next';

function PriceDisplay({ price }: { price: number }) {
  const { t } = useTranslation('product');
  return <Text>{t('price', { value: formatPrice(price) })}</Text>;
}
```

**Key design decisions**:
- Namespace-per-domain keeps translation files focused and lazy-loadable
- ICU MessageFormat for pluralization (`{count} item(s)`) — bundled as `i18next-icu`
- Date/time formatting via `Intl.DateTimeFormat` (available on all target platforms)
- Server-rendered content (product titles, descriptions) is NOT translated — only UI chrome
- Language switch is instant (no app restart) via `i18next.changeLanguage()`

---

## Risks / Trade-offs

### 1. WebSocket Instability on Mobile Networks

**Risk**: Mini programs on WeChat/Alipay may experience WebSocket disconnections due to:
- Background-to-foreground transitions (app suspended, WebSocket closed)
- Network switching (WiFi → cellular)
- Poor signal in subway/tunnel scenarios
- Platform-imposed limits (max 5 WebSocket connections per program)

**Mitigation**:
- **Heartbeat + auto-reconnect** as described in Decision #6
- **Polling fallback** — degrade gracefully to HTTP polling at 15s intervals after 5 failed reconnects
- **Message queue** — outbound messages during disconnection are queued and sent on reconnection
- **Sequence numbers** — detect and deduplicate messages sent during reconnection race conditions
- **Idempotency keys** — trade-related messages include idempotency key to prevent duplicate order processing

### 2. Mini Program Size Limits

**Risk**: WeChat Mini Program enforces a 2 MB main package limit. With NutUI + dependencies + business code, we could easily exceed this.

**Mitigation**:
- **Subpackage granularity** — 4 subpackages as designed in Decision #4
- **Tree-shaking** — NutUI components are imported per-component, not as a whole library
- **Image/asset optimization** — WebP format, SVG sprites, lazy loading for off-screen images
- **Code splitting** — heavy dependencies (OCR SDK, chart library, QR code generator) are imported only in the subpackage that needs them
- **Taro optimizeMainPackage** — auto-extracts subpackage-only shared modules from the main package
- **Bundle analysis** — regular `taro build --type weapp --analyzer` checks in CI

**Trade-off**: Subpackage splitting adds complexity — shared stores between packages need to be accessed via the main package's global store, creating a slight coupling. We accept this in exchange for staying under the size limit.

### 3. Platform API Differences

**Risk**: WeChat and Alipay mini programs have diverging APIs for the same functionality (login, payment, media). Some features may not have equivalents on both platforms.

**Mitigation**:
- **Abstraction layer** — all platform-specific APIs behind `PlatformAPI` (Decision #7)
- **Graceful degradation** — if a feature is unavailable on a platform, show a user-friendly fallback
- **Feature flags** — per-platform capability registry:
  ```typescript
  const platformCapabilities = {
    weapp: { ocr: true, bluetooth: false, nfc: false },
    alipay: { ocr: false, bluetooth: true, nfc: true },
    h5: { ocr: false, bluetooth: false, nfc: false },
  };
  ```
- **Conditional compilation** — compile out unsupported features for specific platforms
- **Testing matrix** — automated smoke tests on WeChat DevTools + Alipay IDE + H5 browser

**Trade-off**: Maintenance cost scales with the number of supported platforms. We prioritize WeChat (primary) and add Alipay + H5 with feature parity for core flows only. Niche features may launch on WeChat first.

### 4. Payment Integration Complexity

**Risk**: Payment flows differ significantly across platforms:
- WeChat: `wx.requestPayment` with `timeStamp, nonceStr, package, signType, paySign`
- Alipay: `my.tradePay` with `tradeNO` or `orderStr`
- H5: Redirect to WeChat Pay JSAPI or Alipay web payment page
- Each requires a backend endpoint for unified order creation

**Mitigation**:
- **Platform-specific payment modules** in `domains/trade/payment/` with file-level adaptation:
  - `payment.weapp.ts` — WeChat payment flow
  - `payment.alipay.ts` — Alipay payment flow
  - `payment.h5.ts` — H5 payment flow
- **Backend unified order endpoint** accepts a `platform` parameter and returns platform-specific payment parameters
- **Result polling** — after payment, poll order status for 30s (since `wx.requestPayment` success callback is not 100% reliable)
- **Idempotency** — prevent double-charge via `orderId + outRefundId` idempotency keys

**Trade-off**: Three parallel payment implementations require triple the testing effort. We mitigate by using the same backend unified order API and only varying the frontend payment invocation.

### 5. Offline Mode Data Freshness

**Risk**: Users may browse products in areas with poor connectivity. Stale cached data leads to inaccurate price/availability information.

**Mitigation**:
- **Cache-and-network** strategy: show cached data immediately, update when network responds
- **Staleness indicators**: show `updated X minutes ago` timestamps on data from cache
- **TTL-based invalidation**: product listings: 5 min, user profile: 30 min, order status: no cache (always fresh)
- **Zone of control**: offline writes (e.g., draft publish) are queued and submitted when online, with conflict resolution

**Trade-off**: Some users may see slightly outdated product data. Acceptable trade-off for offline availability.

### 6. NutUI Bundle Size

**Risk**: Despite tree-shaking, NutUI's component styles are bundled as CSS, which contributes to the main package size.

**Mitigation**:
- **Component-level imports** — `import { Button } from '@nutui/nutui-taro'` ensures only used components are included
- **Sass-based theming** — override `--nut-*` variables in `variables.scss` rather than importing NutUI's theme CSS separately
- **NutUI config adjustment** — set `designWidth: 375` for NutUI components (NutUI is designed at 375px, project base is 750px):
  ```typescript
  // config/index.ts
  designWidth(input) {
    if (input?.file.replace(/\\+/g, '/').indexOf('@nutui/nutui-taro') > -1) {
      return 375;
    }
    return 750;
  }
  ```

---

## Appendix

### A. Dependencies

```json
{
  "dependencies": {
    "@tarojs/components": "4.2.0",
    "@tarojs/react": "4.2.0",
    "@tarojs/runtime": "4.2.0",
    "@tarojs/taro": "4.2.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@nutui/nutui-taro": "^4.0.0",
    "zustand": "^5.0.0",
    "i18next": "^24.0.0",
    "react-i18next": "^15.0.0",
    "i18next-icu": "^2.0.0",
    "immer": "^10.0.0"
  },
  "devDependencies": {
    "@tarojs/cli": "4.2.0",
    "@tarojs/plugin-framework-react": "4.2.0",
    "@tarojs/plugin-platform-weapp": "4.2.0",
    "@tarojs/plugin-platform-alipay": "4.2.0",
    "@tarojs/plugin-platform-h5": "4.2.0",
    "@tarojs/vite-runner": "4.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    "sass": "^1.75.0",
    "typescript": "^5.4.5"
  }
}
```

### B. Taro Configuration (`config/index.ts`)

Key configuration decisions:

```typescript
export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'remx-marketplace',
    designWidth(input) {
      // NutUI is designed at 375px; project uses 750px base
      if (input?.file.includes('@nutui/nutui-taro')) return 375;
      return 750;
    },
    framework: 'react',
    compiler: 'vite',
    mini: {
      optimizeMainPackage: { enable: true },
      postcss: {
        pxtransform: { enable: true },
        cssModules: { enable: true }
      }
    },
    // ...
  };
});
```

### C. Platform Build Scripts

```json
{
  "scripts": {
    "dev:weapp": "taro build --type weapp --watch",
    "dev:alipay": "taro build --type alipay --watch",
    "dev:h5": "taro build --type h5 --watch",
    "build:weapp": "taro build --type weapp",
    "build:alipay": "taro build --type alipay",
    "build:h5": "taro build --type h5",
    "analyze:weapp": "taro build --type weapp --analyzer"
  }
}
```
