---
change: openspec-feature-completion
design-doc: docs/superpowers/specs/2026-06-10-feature-completion-design.md
base-ref: 8021b3a0b62403f80915b40cad012f0ab4f04469
---

# OpenSpec Feature Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all implementation gaps between 18 domain specs and the frontend codebase — compile errors, missing features, i18n coverage.

**Architecture:** Add mock interceptor layer for offline development, supplement missing API methods/types/stores across 14 domains, implement/enhance 20+ pages following existing Taro + React + Zustand patterns, integrate echarts-for-weixin for admin panel.

**Tech Stack:** Taro 3.x, React 18, Zustand, SCSS, react-i18next, echarts-for-weixin

---

## File Structure

### New Files to Create

| File | Responsibility |
|------|---------------|
| `src/shared/api/mock-interceptor.ts` | Mock interceptor core logic |
| `src/shared/api/mocks/index.ts` | Aggregates all domain mocks |
| `src/shared/api/mocks/trade.ts` | Trade/review mock data |
| `src/shared/api/mocks/community.ts` | Community/circle mock data |
| `src/shared/api/mocks/notification.ts` | Notification mock data |
| `src/shared/api/mocks/chat.ts` | Chat mock data |
| `src/shared/api/mocks/auth.ts` | Auth/device mock data |
| `src/shared/api/mocks/marketing.ts` | Marketing/coupon/referral mock data |
| `src/shared/api/mocks/shipping.ts` | Shipping mock data |
| `src/shared/api/mocks/wallet.ts` | Wallet mock data |
| `src/shared/api/mocks/admin.ts` | Admin mock data |
| `src/shared/api/mocks/product.ts` | Product mock data |
| `src/shared/api/mocks/seller.ts` | Seller mock data |
| `src/shared/api/mocks/user.ts` | User mock data |
| `src/shared/api/mocks/address.ts` | Address mock data |
| `src/pages/notification/detail/index.tsx` | Notification detail page |
| `src/pages/notification/detail/index.scss` | Notification detail styles |
| `src/pages/notification/settings/index.tsx` | Notification preferences page |
| `src/pages/notification/settings/index.scss` | Notification preferences styles |
| `src/pages/user/devices/index.tsx` | Device management page |
| `src/pages/user/devices/index.scss` | Device management styles |
| `src/pages/admin/components/TrendChart/index.tsx` | Admin trend chart component |
| `src/pages/admin/components/TrendChart/index.scss` | Trend chart styles |

### Files to Modify (by domain)

| File | Changes |
|------|---------|
| `src/app.config.ts` | Register 9 missing pages |
| `src/app.ts` | Add TabBar badge for unread notifications |
| `src/shared/api/request.ts` | Register mock interceptor |
| `src/domains/community/api.ts` | Add 6 methods |
| `src/domains/community/types.ts` | Add Circle, CircleDetail types |
| `src/domains/community/store.ts` | Add circle join/leave, comment delete, draft save |
| `src/domains/marketing/api.ts` | Add 4 methods |
| `src/domains/marketing/types.ts` | Add ReferralInfo, CouponTemplate, CommissionData types |
| `src/domains/trade/api.ts` | Add submitReview, appendReview |
| `src/domains/trade/types.ts` | Add Review, ReviewData types |
| `src/domains/notification/api.ts` | Add getPreferences, updatePreferences |
| `src/domains/notification/types.ts` | Add NotificationPreference type |
| `src/domains/notification/store.ts` | Add TabBar badge integration |
| `src/domains/chat/api.ts` | Add sendReadReceipt, deleteThread, pinThread |
| `src/domains/chat/store.ts` | Add thread delete/pin state |
| `src/domains/auth/api.ts` | Add getDevices, kickDevice |
| `src/domains/auth/types.ts` | Add DeviceSession type |
| `src/domains/shipping/api.ts` | Add getTrackingInfo with packages |
| `src/domains/wallet/store.ts` | Add balance visibility toggle |
| `src/pages/review/index/index.tsx` | Rewrite empty shell → full review page |
| `src/pages/review/index/index.scss` | Create review page styles |
| `src/pages/notification/index/index.tsx` | Add detail navigation, settings entry |
| `src/pages/chat/conversation/index.tsx` | Add product/order card messages, read receipts |
| `src/pages/community/circle/detail/index.tsx` | Add join/leave buttons |
| `src/pages/community/post/index.tsx` | Add comment deletion |
| `src/pages/community/create/index.tsx` | Add draft auto-save |
| `src/pages/offer/detail/index.tsx` | Add expiry countdown |
| `src/pages/order/create/index.tsx` | Add points deduction toggle |
| `src/pages/wallet/index/index.tsx` | Add balance visibility toggle, fix getTxInfo bug |
| `src/pages/logistics/track/index.tsx` | Add anomaly alert, multi-package tabs, scan button |
| `src/pages/coupon/list/index.tsx` | Add coupon claim center |
| `src/pages/community/creator/index.tsx` | Add certification, commission, showcase |
| `src/pages/admin/index/index.tsx` | Add trend chart |
| `src/shared/i18n/resources/zh-CN/*.json` | Add new keys inline per task |
| `src/shared/i18n/resources/en-US/*.json` | Add new keys inline per task |

---

## Phase 0: Mock Infrastructure + Compile Fixes

### Task 0: Mock Interceptor Infrastructure

**Files:**
- Create: `src/shared/api/mock-interceptor.ts`
- Create: `src/shared/api/mocks/index.ts`
- Modify: `src/shared/api/request.ts`

- [ ] **Step 1: Create mock interceptor core**

Create `src/shared/api/mock-interceptor.ts`:

```typescript
import type { ApiResponse } from './request'

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  urlPattern: RegExp
  handler: (url: string, data?: any) => ApiResponse<any>
}

const mockRoutes: MockRoute[] = []

export function registerMocks(routes: MockRoute[]) {
  mockRoutes.push(...routes)
}

export function findMock(method: string, url: string, data?: any): ApiResponse<any> | null {
  const route = mockRoutes.find(
    (r) => r.method === method.toUpperCase() && r.urlPattern.test(url)
  )
  if (!route) return null
  return route.handler(url, data)
}

export function clearMocks() {
  mockRoutes.length = 0
}
```

- [ ] **Step 2: Create mock index aggregator**

Create `src/shared/api/mocks/index.ts`:

```typescript
import { registerMocks } from '../mock-interceptor'

// Domain mocks will be registered here as they are created
// import { tradeMocks } from './trade'
// import { communityMocks } from './community'
// ... etc

export function initAllMocks() {
  // registerMocks(tradeMocks)
  // registerMocks(communityMocks)
  // ... etc
}
```

- [ ] **Step 3: Integrate mock interceptor into HttpClient**

In `src/shared/api/request.ts`, add at the top:

```typescript
import { findMock } from './mock-interceptor'
```

Add a `MOCK_ENABLED` constant near the top of the file (after imports):

```typescript
const MOCK_ENABLED = process.env.MOCK_ENABLED !== 'false'
```

In the `request<T>` method, before the `Taro.request()` call, add mock interception:

```typescript
// Inside request<T> method, after building the URL and before Taro.request:
if (MOCK_ENABLED) {
  const mockResult = findMock(method, url, config.data || config.params)
  if (mockResult) {
    return Promise.resolve(mockResult as ApiResponse<T>)
  }
}
```

- [ ] **Step 4: Verify compilation**

Run: `rtk tsc --noEmit`
Expected: No new errors introduced.

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/mock-interceptor.ts src/shared/api/mocks/index.ts src/shared/api/request.ts
git commit -m "feat: add mock interceptor infrastructure for offline development"
```

---

### Task 0.1: Register Missing Pages in app.config.ts

**Files:**
- Modify: `src/app.config.ts`

- [ ] **Step 1: Add missing pages to subPackages**

In `src/app.config.ts`, update the following subPackages:

**kyc subPackage** — add `liveness/index`:
```typescript
{
  root: 'pages/kyc',
  pages: ['index/index', 'phone/index', 'identity/index', 'liveness/index']
}
```

**wallet subPackage** — add `transactions/index`, `bind-card/index`:
```typescript
{
  root: 'pages/wallet',
  pages: ['index/index', 'withdraw/index', 'transactions/index', 'bind-card/index']
}
```

**community subPackage** — add `circle/list/index`, `circle/detail/index`, `creator/index`:
```typescript
{
  root: 'pages/community',
  pages: ['feed/index', 'post/index', 'create/index', 'circle/list/index', 'circle/detail/index', 'creator/index']
}
```

**admin subPackage** — add `dispute/index`, `withdrawals/index`, `marketing/index`:
```typescript
{
  root: 'pages/admin',
  pages: ['index/index', 'users/index', 'reviews/index', 'dispute/index', 'withdrawals/index', 'marketing/index']
}
```

- [ ] **Step 2: Verify page files exist on disk**

Run: `rtk find "pages/kyc/liveness" "pages/wallet/transactions" "pages/wallet/bind-card" "pages/community/circle" "pages/community/creator" "pages/admin/dispute" "pages/admin/withdrawals" "pages/admin/marketing" src/pages/`

Expected: Each directory has an `index.tsx` file.

- [ ] **Step 3: Verify compilation**

Run: `rtk tsc --noEmit`
Expected: No route-related errors for these pages.

- [ ] **Step 4: Commit**

```bash
git add src/app.config.ts
git commit -m "fix: register 9 missing pages in app.config.ts"
```

---

### Task 0.2: Add Missing Community API Methods + Types + Mocks

**Files:**
- Modify: `src/domains/community/api.ts`
- Modify: `src/domains/community/types.ts`
- Create: `src/shared/api/mocks/community.ts`
- Modify: `src/shared/api/mocks/index.ts`

- [ ] **Step 1: Add Circle types to community/types.ts**

Append to `src/domains/community/types.ts`:

```typescript
export interface Circle {
  id: string
  name: string
  avatar: string
  description: string
  memberCount: number
  todayPostCount: number
  isJoined: boolean
}

export interface CircleDetail extends Circle {
  posts: Post[]
}
```

- [ ] **Step 2: Add missing methods to communityApi in community/api.ts**

In the `communityApi` object, add these methods:

```typescript
getCircles() {
  return http.get<Circle[]>('/community/circles')
},

getCircleDetail(id: string) {
  return http.get<{ circle: Circle; posts: Post[] }>(`/community/circles/${id}`)
},

joinCircle(circleId: string) {
  return http.post<void>(`/community/circles/${circleId}/join`)
},

leaveCircle(circleId: string) {
  return http.delete<void>(`/community/circles/${circleId}/join`)
},

deleteComment(commentId: string) {
  return http.delete<void>(`/community/comments/${commentId}`)
},

applyCreatorCertification(data: { reason: string; identityInfo?: string }) {
  return http.post<void>('/community/creator/certification', data)
},
```

Also update the import at the top of the file to include the new types:

```typescript
import type { Post, Comment, CreatePostData, FeedParams, Circle, CircleDetail } from './types'
```

- [ ] **Step 3: Create community mock data**

Create `src/shared/api/mocks/community.ts`:

```typescript
import type { MockRoute } from '../mock-interceptor'
import type { Circle } from '@/domains/community/types'

const mockCircles: Circle[] = [
  {
    id: 'c1',
    name: '数码爱好者',
    avatar: '/static/avatars/digital.jpg',
    description: '分享数码产品评测与使用心得',
    memberCount: 1280,
    todayPostCount: 15,
    isJoined: false,
  },
  {
    id: 'c2',
    name: '二手好物',
    avatar: '/static/avatars/secondhand.jpg',
    description: '发现值得购买的二手好物',
    memberCount: 856,
    todayPostCount: 8,
    isJoined: true,
  },
]

export const communityMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/community\/circles$/,
    handler: () => ({ code: 0, data: mockCircles, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/community\/circles\/\w+$/,
    handler: () => ({
      code: 0,
      data: { circle: mockCircles[0], posts: [] },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/community\/circles\/\w+\/join$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/community\/circles\/\w+\/join$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/community\/comments\/\w+$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/community\/creator\/certification$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
```

- [ ] **Step 4: Register community mocks in index**

In `src/shared/api/mocks/index.ts`, uncomment/add:

```typescript
import { registerMocks } from '../mock-interceptor'
import { communityMocks } from './community'

export function initAllMocks() {
  registerMocks(communityMocks)
}
```

- [ ] **Step 5: Verify compilation**

Run: `rtk tsc --noEmit`
Expected: `getCircles`, `getCircleDetail` references in circle pages now resolve.

- [ ] **Step 6: Commit**

```bash
git add src/domains/community/api.ts src/domains/community/types.ts src/shared/api/mocks/community.ts src/shared/api/mocks/index.ts
git commit -m "feat: add community circle API methods, types, and mocks"
```

---

### Task 0.3: Add Missing Marketing API Methods + Types + Mocks

**Files:**
- Modify: `src/domains/marketing/api.ts`
- Modify: `src/domains/marketing/types.ts`
- Create: `src/shared/api/mocks/marketing.ts`
- Modify: `src/shared/api/mocks/index.ts`

- [ ] **Step 1: Add new types to marketing/types.ts**

Append to `src/domains/marketing/types.ts`:

```typescript
export interface ReferralLeaderboardEntry {
  rank: number
  name: string
  avatar: string
  referrals: number
}

export interface ReferralInfo {
  code: string
  link: string
  totalReferrals: number
  totalRewards: number
  leaderboard: ReferralLeaderboardEntry[]
}

export interface CouponTemplate {
  id: string
  name: string
  type: '满减' | '折扣' | '无门槛'
  discount: number
  minAmount: number
  remaining: number
  total: number
  expiresAt: string
}

export interface CommissionRecord {
  id: string
  orderId: string
  productName: string
  amount: number
  status: 'pending' | 'settled' | 'cancelled'
  createdAt: string
}

export interface CommissionData {
  totalCommission: number
  availableCommission: number
  monthlyEstimate: number
  records: CommissionRecord[]
}
```

- [ ] **Step 2: Add missing methods to marketingApi in marketing/api.ts**

In the `marketingApi` object, add:

```typescript
getReferralInfo() {
  return http.get<ReferralInfo>('/marketing/referral/info')
},

claimCoupon(couponTemplateId: string) {
  return http.post<void>('/marketing/coupons/claim', { couponTemplateId })
},

getCouponTemplates() {
  return http.get<CouponTemplate[]>('/marketing/coupons/templates')
},

getCommissionData() {
  return http.get<CommissionData>('/marketing/commission')
},
```

Update the import to include new types:

```typescript
import type { CheckinData, CheckinResult, PointsData, PointsRecord, Coupon, ReferralInfo, CouponTemplate, CommissionData } from './types'
```

- [ ] **Step 3: Create marketing mock data**

Create `src/shared/api/mocks/marketing.ts`:

```typescript
import type { MockRoute } from '../mock-interceptor'

export const marketingMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/marketing\/referral\/info$/,
    handler: () => ({
      code: 0,
      data: {
        code: 'USER2026',
        link: 'https://remx.com/invite?code=USER2026',
        totalReferrals: 12,
        totalRewards: 360,
        leaderboard: [
          { rank: 1, name: '用户A', avatar: '/static/avatars/a.jpg', referrals: 45 },
          { rank: 2, name: '用户B', avatar: '/static/avatars/b.jpg', referrals: 32 },
        ],
      },
      message: 'ok',
    }),
  },
  {
    method: 'POST',
    urlPattern: /\/marketing\/coupons\/claim$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/marketing\/coupons\/templates$/,
    handler: () => ({
      code: 0,
      data: [
        { id: 'ct1', name: '新人专享', type: '满减', discount: 20, minAmount: 100, remaining: 50, total: 200, expiresAt: '2026-12-31' },
        { id: 'ct2', name: '限时折扣', type: '折扣', discount: 8, minAmount: 50, remaining: 0, total: 100, expiresAt: '2026-07-01' },
      ],
      message: 'ok',
    }),
  },
  {
    method: 'GET',
    urlPattern: /\/marketing\/commission$/,
    handler: () => ({
      code: 0,
      data: {
        totalCommission: 2580.5,
        availableCommission: 1200,
        monthlyEstimate: 450,
        records: [
          { id: 'cr1', orderId: 'ORD001', productName: '二手iPhone 15', amount: 35, status: 'settled', createdAt: '2026-06-01' },
          { id: 'cr2', orderId: 'ORD002', productName: '机械键盘', amount: 18, status: 'pending', createdAt: '2026-06-05' },
        ],
      },
      message: 'ok',
    }),
  },
]
```

- [ ] **Step 4: Register marketing mocks in index**

In `src/shared/api/mocks/index.ts`, add:

```typescript
import { marketingMocks } from './marketing'

export function initAllMocks() {
  registerMocks(communityMocks)
  registerMocks(marketingMocks)
}
```

- [ ] **Step 5: Verify compilation**

Run: `rtk tsc --noEmit`
Expected: `getReferralInfo` reference in referral/creator pages now resolves.

- [ ] **Step 6: Commit**

```bash
git add src/domains/marketing/api.ts src/domains/marketing/types.ts src/shared/api/mocks/marketing.ts src/shared/api/mocks/index.ts
git commit -m "feat: add marketing referral, coupon claim, and commission API methods"
```

---

### Phase 0 Verification

- [ ] **Run `rtk tsc --noEmit`**

Expected: Zero errors. If errors remain, investigate and fix before proceeding.

---

## Phase 1: Core Feature Completion

### Task 1.1: Order Review Page

**Files:**
- Modify: `src/domains/trade/api.ts`
- Modify: `src/domains/trade/types.ts`
- Create: `src/shared/api/mocks/trade.ts`
- Rewrite: `src/pages/review/index/index.tsx`
- Create: `src/pages/review/index/index.scss`
- Modify: `src/shared/i18n/resources/zh-CN/trade.json`
- Modify: `src/shared/i18n/resources/en-US/trade.json`

- [ ] **Step 1: Add Review types to trade/types.ts**

Append to `src/domains/trade/types.ts`:

```typescript
export interface ReviewTag {
  id: string
  label: string
}

export interface ReviewData {
  rating: number
  tags: string[]
  content: string
  images: string[]
}

export interface AppendReviewData {
  content: string
  images: string[]
}

export const REVIEW_TAGS: ReviewTag[] = [
  { id: 't1', label: '成色好' },
  { id: 't2', label: '发货快' },
  { id: 't3', label: '包装好' },
  { id: 't4', label: '描述准确' },
  { id: 't5', label: '性价比高' },
  { id: 't6', label: '卖家靠谱' },
]

export const RATING_LABELS: Record<number, string> = {
  1: '非常不满意',
  2: '不满意',
  3: '一般',
  4: '满意',
  5: '非常满意',
}
```

- [ ] **Step 2: Add review API methods to trade/api.ts**

In the `tradeApi` object, add:

```typescript
submitReview(orderId: string, data: ReviewData) {
  return http.post<void>(`/orders/${orderId}/review`, data)
},

appendReview(orderId: string, data: AppendReviewData) {
  return http.post<void>(`/orders/${orderId}/review/append`, data)
},
```

Add the type import at the top:

```typescript
import type { OrderStatus, ReviewData, AppendReviewData } from './types'
```

- [ ] **Step 3: Create trade mock data**

Create `src/shared/api/mocks/trade.ts`:

```typescript
import type { MockRoute } from '../mock-interceptor'

export const tradeMocks: MockRoute[] = [
  {
    method: 'POST',
    urlPattern: /\/orders\/\w+\/review$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/orders\/\w+\/review\/append$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
```

Register in `src/shared/api/mocks/index.ts`:

```typescript
import { tradeMocks } from './trade'
// add: registerMocks(tradeMocks)
```

- [ ] **Step 4: Add i18n keys**

Add to `src/shared/i18n/resources/zh-CN/trade.json` (merge into existing JSON):

```json
"review": {
  "title": "发表评价",
  "ratingLabel": "总体评分",
  "tagsLabel": "商品标签",
  "contentPlaceholder": "分享你的使用体验（最多200字）",
  "contentLimit": "{count}/200",
  "addImage": "添加图片",
  "imageLimit": "最多3张",
  "submit": "发表评价",
  "submitSuccess": "评价发表成功",
  "appendTitle": "追加评价",
  "appendPlaceholder": "追加你的使用感受",
  "appendSubmit": "发表追评"
}
```

Add to `src/shared/i18n/resources/en-US/trade.json`:

```json
"review": {
  "title": "Write Review",
  "ratingLabel": "Overall Rating",
  "tagsLabel": "Product Tags",
  "contentPlaceholder": "Share your experience (max 200 chars)",
  "contentLimit": "{count}/200",
  "addImage": "Add Photos",
  "imageLimit": "Max 3 photos",
  "submit": "Submit Review",
  "submitSuccess": "Review submitted",
  "appendTitle": "Follow-up Review",
  "appendPlaceholder": "Add more about your experience",
  "appendSubmit": "Submit Follow-up"
}
```

- [ ] **Step 5: Create review page styles**

Create `src/pages/review/index/index.scss`:

```scss
.review-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;

  .section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }

  .star-rating {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .star {
      font-size: 48px;
      color: #ddd;
      &.active { color: #FFB800; }
    }
  }

  .rating-label {
    font-size: 24px;
    color: #FF6B35;
    margin-bottom: 16px;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .tag {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 24px;
      background: #f0f0f0;
      color: #666;
      &.selected {
        background: #FFF0EB;
        color: #FF6B35;
        border: 1px solid #FF6B35;
      }
    }
  }

  .content-input {
    width: 100%;
    height: 200px;
    font-size: 28px;
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 8px;
    box-sizing: border-box;
  }

  .char-count {
    text-align: right;
    font-size: 22px;
    color: #999;
    margin-top: 8px;
  }

  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;

    .image-item {
      width: 160px;
      height: 160px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;

      Image { width: 100%; height: 100%; }

      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 32px;
        height: 32px;
        background: rgba(0,0,0,0.5);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
    }

    .add-image-btn {
      width: 160px;
      height: 160px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 24px;
    }
  }

  .submit-btn {
    width: 100%;
    height: 88px;
    background: #FF6B35;
    color: #fff;
    border-radius: 44px;
    font-size: 30px;
    font-weight: 600;
    margin-top: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
```

- [ ] **Step 6: Rewrite the review page**

Rewrite `src/pages/review/index/index.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { View, Text, Textarea, Image } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '@/domains/trade/api'
import { REVIEW_TAGS, RATING_LABELS } from '@/domains/trade/types'
import './index.scss'

export default function ReviewPage() {
  const { t } = useTranslation(['trade', 'common'])
  const router = useRouter()
  const orderId = router.params.id || ''

  const [rating, setRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = useCallback((label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }, [])

  const chooseImage = useCallback(async () => {
    if (images.length >= 3) return
    const remaining = 3 - images.length
    const res = await Taro.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })
    const newImages = res.tempFiles.map((f) => f.tempFilePath)
    setImages((prev) => [...prev, ...newImages].slice(0, 3))
  }, [images.length])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!orderId) return
    setSubmitting(true)
    try {
      await tradeApi.submitReview(orderId, {
        rating,
        tags: selectedTags,
        content,
        images,
      })
      Taro.showToast({ title: t('trade:review.submitSuccess'), icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: t('common:error.submitFailed'), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }, [orderId, rating, selectedTags, content, images, t])

  return (
    <View className='review-page'>
      <View className='section'>
        <Text className='section-title'>{t('trade:review.ratingLabel')}</Text>
        <View className='star-rating'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </Text>
          ))}
        </View>
        <Text className='rating-label'>{RATING_LABELS[rating]}</Text>
      </View>

      <View className='section'>
        <Text className='section-title'>{t('trade:review.tagsLabel')}</Text>
        <View className='tag-list'>
          {REVIEW_TAGS.map((tag) => (
            <Text
              key={tag.id}
              className={`tag ${selectedTags.includes(tag.label) ? 'selected' : ''}`}
              onClick={() => toggleTag(tag.label)}
            >
              {tag.label}
            </Text>
          ))}
        </View>
      </View>

      <View className='section'>
        <Textarea
          className='content-input'
          placeholder={t('trade:review.contentPlaceholder')}
          maxlength={200}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
        />
        <Text className='char-count'>
          {t('trade:review.contentLimit', { count: content.length })}
        </Text>

        <View className='image-grid'>
          {images.map((img, i) => (
            <View key={i} className='image-item'>
              <Image src={img} mode='aspectFill' />
              <Text className='remove-btn' onClick={() => removeImage(i)}>×</Text>
            </View>
          ))}
          {images.length < 3 && (
            <View className='add-image-btn' onClick={chooseImage}>
              <Text>+{'\n'}{t('trade:review.addImage')}</Text>
            </View>
          )}
        </View>
      </View>

      <View className='submit-btn' onClick={handleSubmit}>
        <Text>{submitting ? t('common:app.loading') : t('trade:review.submit')}</Text>
      </View>
    </View>
  )
}
```

- [ ] **Step 7: Verify compilation**

Run: `rtk tsc --noEmit`
Expected: No errors in review page.

- [ ] **Step 8: Commit**

```bash
git add src/domains/trade/api.ts src/domains/trade/types.ts src/shared/api/mocks/trade.ts src/shared/api/mocks/index.ts src/pages/review/index/index.tsx src/pages/review/index/index.scss src/shared/i18n/resources/zh-CN/trade.json src/shared/i18n/resources/en-US/trade.json
git commit -m "feat: implement order review page with star rating, tags, and image upload"
```

---

### Task 1.2: Notification Center Enhancements

**Files:**
- Modify: `src/domains/notification/api.ts`
- Modify: `src/domains/notification/types.ts`
- Create: `src/shared/api/mocks/notification.ts`
- Modify: `src/shared/api/mocks/index.ts`
- Modify: `src/domains/notification/store.ts`
- Create: `src/pages/notification/detail/index.tsx`
- Create: `src/pages/notification/detail/index.scss`
- Create: `src/pages/notification/settings/index.tsx`
- Create: `src/pages/notification/settings/index.scss`
- Modify: `src/pages/notification/index/index.tsx`
- Modify: `src/app.ts`
- Modify: `src/app.config.ts`
- Modify: `src/shared/i18n/resources/zh-CN/notification.json`
- Modify: `src/shared/i18n/resources/en-US/notification.json`

- [ ] **Step 1: Add NotificationPreference type**

Append to `src/domains/notification/types.ts`:

```typescript
export interface NotificationPreference {
  system: boolean
  transaction: boolean
  marketing: boolean
  interaction: boolean
}
```

- [ ] **Step 2: Add preference API methods**

In `src/domains/notification/api.ts`, add to `notificationApi`:

```typescript
getPreferences() {
  return http.get<NotificationPreference>('/notifications/preferences')
},

updatePreferences(data: NotificationPreference) {
  return http.put<void>('/notifications/preferences', data)
},

getDetail(id: string) {
  return http.get<Notification>(`/notifications/${id}`)
},
```

Update the import:

```typescript
import type { Notification, NotificationPreference } from './types'
```

- [ ] **Step 3: Create notification mock data**

Create `src/shared/api/mocks/notification.ts`:

```typescript
import type { MockRoute } from '../mock-interceptor'

export const notificationMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/notifications\/preferences$/,
    handler: () => ({
      code: 0,
      data: { system: true, transaction: true, marketing: true, interaction: true },
      message: 'ok',
    }),
  },
  {
    method: 'PUT',
    urlPattern: /\/notifications\/preferences$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'GET',
    urlPattern: /\/notifications\/\w+$/,
    handler: () => ({
      code: 0,
      data: {
        id: 'n1',
        type: 'transaction',
        title: '订单已发货',
        content: '您的订单 ORD001 已发货，物流单号 SF1234567890，预计3天内送达。',
        isRead: false,
        createdAt: '2026-06-09T10:30:00Z',
        link: '/pages/order/detail/index?id=ORD001',
      },
      message: 'ok',
    }),
  },
]
```

Register in `src/shared/api/mocks/index.ts`.

- [ ] **Step 4: Add TabBar badge to notification store**

In `src/domains/notification/store.ts`, update `loadUnreadCount` action to set TabBar badge:

```typescript
loadUnreadCount: async () => {
  try {
    const res = await notificationApi.getUnreadCount()
    if (res.code === 0) {
      const count = res.data
      set({ unreadCount: count })
      if (count > 0) {
        Taro.setTabBarBadge({ index: 3, text: count > 99 ? '99+' : String(count) })
      } else {
        Taro.removeTabBarBadge({ index: 3 })
      }
    }
  } catch (err) {
    console.error('Failed to load unread count', err)
  }
},
```

Ensure `import Taro from '@tarojs/taro'` is at the top of the store file.

- [ ] **Step 5: Register new pages in app.config.ts**

Add to the notification subPackage:

```typescript
{
  root: 'pages/notification',
  pages: ['index/index', 'detail/index', 'settings/index']
}
```

- [ ] **Step 6: Create notification detail page**

Create `src/pages/notification/detail/index.scss`:

```scss
.notification-detail-page {
  min-height: 100vh;
  background: #fff;
  padding: 32px;

  .title {
    font-size: 34px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .meta {
    font-size: 24px;
    color: #999;
    margin-bottom: 32px;
  }

  .content {
    font-size: 28px;
    color: #333;
    line-height: 1.8;
  }

  .action-btn {
    margin-top: 48px;
    width: 100%;
    height: 88px;
    background: #FF6B35;
    color: #fff;
    border-radius: 44px;
    font-size: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
```

Create `src/pages/notification/detail/index.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { notificationApi } from '@/domains/notification/api'
import type { Notification } from '@/domains/notification/types'
import './index.scss'

export default function NotificationDetailPage() {
  const { t } = useTranslation(['notification', 'common'])
  const router = useRouter()
  const id = router.params.id || ''
  const [notification, setNotification] = useState<Notification | null>(null)

  useLoad(async () => {
    if (!id) return
    const res = await notificationApi.getDetail(id)
    if (res.code === 0) {
      setNotification(res.data)
      if (!res.data.isRead) {
        await notificationApi.markAsRead(id)
      }
    }
  })

  const handleNavigate = useCallback(() => {
    if (notification?.link) {
      Taro.navigateTo({ url: notification.link })
    }
  }, [notification])

  if (!notification) return null

  return (
    <View className='notification-detail-page'>
      <Text className='title'>{notification.title}</Text>
      <Text className='meta'>{notification.createdAt}</Text>
      <Text className='content'>{notification.content}</Text>
      {notification.link && (
        <View className='action-btn' onClick={handleNavigate}>
          <Text>{t('notification:action.viewDetail')}</Text>
        </View>
      )}
    </View>
  )
}
```

- [ ] **Step 7: Create notification settings page**

Create `src/pages/notification/settings/index.scss`:

```scss
.notification-settings-page {
  min-height: 100vh;
  background: #f5f5f5;

  .section {
    background: #fff;
    margin-top: 16px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 32px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }
  }

  .setting-label {
    font-size: 28px;
    color: #333;
  }

  .setting-desc {
    font-size: 22px;
    color: #999;
    margin-top: 4px;
  }

  .switch {
    width: 88px;
    height: 48px;
  }
}
```

Create `src/pages/notification/settings/index.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { View, Text, Switch } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { notificationApi } from '@/domains/notification/api'
import type { NotificationPreference } from '@/domains/notification/types'
import './index.scss'

const SETTING_ITEMS: { key: keyof NotificationPreference; labelKey: string; descKey: string }[] = [
  { key: 'system', labelKey: 'settings.system', descKey: 'settings.systemDesc' },
  { key: 'transaction', labelKey: 'settings.transaction', descKey: 'settings.transactionDesc' },
  { key: 'marketing', labelKey: 'settings.marketing', descKey: 'settings.marketingDesc' },
  { key: 'interaction', labelKey: 'settings.interaction', descKey: 'settings.interactionDesc' },
]

export default function NotificationSettingsPage() {
  const { t } = useTranslation(['notification', 'common'])
  const [prefs, setPrefs] = useState<NotificationPreference>({
    system: true,
    transaction: true,
    marketing: true,
    interaction: true,
  })

  useLoad(async () => {
    const res = await notificationApi.getPreferences()
    if (res.code === 0) setPrefs(res.data)
  })

  const handleToggle = useCallback(
    async (key: keyof NotificationPreference, value: boolean) => {
      const newPrefs = { ...prefs, [key]: value }
      setPrefs(newPrefs)
      try {
        await notificationApi.updatePreferences(newPrefs)
      } catch {
        setPrefs(prefs)
        Taro.showToast({ title: t('common:error.networkError'), icon: 'none' })
      }
    },
    [prefs, t]
  )

  return (
    <View className='notification-settings-page'>
      <View className='section'>
        {SETTING_ITEMS.map((item) => (
          <View key={item.key} className='setting-item'>
            <View>
              <Text className='setting-label'>{t(`notification:${item.labelKey}`)}</Text>
              <Text className='setting-desc'>{t(`notification:${item.descKey}`)}</Text>
            </View>
            <Switch
              className='switch'
              checked={prefs[item.key]}
              onChange={(e) => handleToggle(item.key, e.detail.value)}
            />
          </View>
        ))}
      </View>
    </View>
  )
}
```

- [ ] **Step 8: Update notification list page to navigate to detail and settings**

In `src/pages/notification/index/index.tsx`, modify the notification item click handler to navigate to detail:

Find the notification item render and add onClick:

```tsx
onClick={() => Taro.navigateTo({ url: `/pages/notification/detail/index?id=${item.id}` })}
```

Add a settings entry button at the top of the page (e.g., in the header area):

```tsx
<Text
  className='settings-link'
  onClick={() => Taro.navigateTo({ url: '/pages/notification/settings/index' })}
>
  {t('notification:settings.title')}
</Text>
```

- [ ] **Step 9: Add i18n keys**

Add to `src/shared/i18n/resources/zh-CN/notification.json`:

```json
"settings": {
  "title": "通知设置",
  "system": "系统通知",
  "systemDesc": "公告、版本更新等",
  "transaction": "交易通知",
  "transactionDesc": "订单、支付、退款等",
  "marketing": "营销通知",
  "marketingDesc": "活动、优惠券等",
  "interaction": "互动通知",
  "interactionDesc": "评论、点赞、关注等"
},
"detail": {
  "title": "通知详情"
}
```

Add corresponding en-US keys.

- [ ] **Step 10: Verify compilation**

Run: `rtk tsc --noEmit`
Expected: No errors in notification pages.

- [ ] **Step 11: Commit**

```bash
git add src/domains/notification/ src/shared/api/mocks/notification.ts src/shared/api/mocks/index.ts src/pages/notification/ src/app.ts src/app.config.ts src/shared/i18n/resources/zh-CN/notification.json src/shared/i18n/resources/en-US/notification.json
git commit -m "feat: add notification detail page, settings page, and TabBar badge"
```

---

### Task 1.3: Instant Messaging Enhancements

**Files:**
- Modify: `src/domains/chat/api.ts`
- Create: `src/shared/api/mocks/chat.ts`
- Modify: `src/domains/chat/store.ts`
- Modify: `src/pages/chat/conversation/index.tsx`
- Modify: `src/shared/i18n/resources/zh-CN/chat.json`
- Modify: `src/shared/i18n/resources/en-US/chat.json`

- [ ] **Step 1: Add missing chat API methods**

In `src/domains/chat/api.ts`, add to `chatApi`:

```typescript
sendReadReceipt(threadId: string, messageIds: string[]) {
  return http.post<void>(`/threads/${threadId}/read-receipt`, { messageIds })
},

deleteThread(id: string) {
  return http.delete<void>(`/threads/${id}`)
},

pinThread(id: string, pinned: boolean) {
  return http.post<void>(`/threads/${id}/pin`, { pinned })
},
```

- [ ] **Step 2: Create chat mock data**

Create `src/shared/api/mocks/chat.ts`:

```typescript
import type { MockRoute } from '../mock-interceptor'

export const chatMocks: MockRoute[] = [
  {
    method: 'POST',
    urlPattern: /\/threads\/\w+\/read-receipt$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/threads\/\w+$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
  {
    method: 'POST',
    urlPattern: /\/threads\/\w+\/pin$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
```

Register in mocks/index.ts.

- [ ] **Step 3: Update chat store with thread delete/pin**

In `src/domains/chat/store.ts`, add to the store state and actions:

State additions:
```typescript
pinnedThreads: string[]
```

Action additions:
```typescript
deleteThread: async (id: string) => {
  await chatApi.deleteThread(id)
  set((s) => ({ threads: s.threads.filter((t) => t.id !== id) }))
},

pinThread: async (id: string, pinned: boolean) => {
  await chatApi.pinThread(id, pinned)
  set((s) => ({
    pinnedThreads: pinned
      ? [...s.pinnedThreads, id]
      : s.pinnedThreads.filter((t) => t !== id),
  }))
},

sendReadReceipt: async (threadId: string, messageIds: string[]) => {
  await chatApi.sendReadReceipt(threadId, messageIds)
},
```

- [ ] **Step 4: Add product/order card message rendering to conversation page**

In `src/pages/chat/conversation/index.tsx`, add rendering for product and order card messages. In the message rendering section, add conditions:

```tsx
{msg.type === 'product' && (
  <View className='product-card' onClick={() => Taro.navigateTo({ url: `/pages/product/detail/index?id=${msg.productId}` })}>
    <Image src={msg.productImage} className='product-card-image' mode='aspectFill' />
    <View className='product-card-info'>
      <Text className='product-card-title'>{msg.productTitle}</Text>
      <Text className='product-card-price'>¥{msg.productPrice}</Text>
    </View>
  </View>
)}
{msg.type === 'order' && (
  <View className='order-card' onClick={() => Taro.navigateTo({ url: `/pages/order/detail/index?id=${msg.orderId}` })}>
    <Text className='order-card-no'>{msg.orderNo}</Text>
    <Text className='order-card-status'>{msg.orderStatus}</Text>
  </View>
)}
```

Add "send product" and "send order" buttons in the input area:

```tsx
<View className='input-actions'>
  <Text className='action-btn' onClick={handleSendProduct}>{t('chat:action.sendProduct')}</Text>
  <Text className='action-btn' onClick={handleSendOrder}>{t('chat:action.sendOrder')}</Text>
</View>
```

Add handler functions that show a selection popup (simplified — select from recent items):

```typescript
const handleSendProduct = useCallback(() => {
  Taro.navigateTo({ url: '/pages/product/select/index?mode=share' })
}, [])

const handleSendOrder = useCallback(() => {
  Taro.navigateTo({ url: '/pages/order/select/index?mode=share' })
}, [])
```

Note: Product/order selection pages are out of scope for this task. The buttons navigate to placeholder routes; pages can be created later. For now, use `Taro.showToast({ title: t('common:app.comingSoon'), icon: 'none' })` as a temporary handler.

- [ ] **Step 5: Add auto read receipt when entering conversation**

In the conversation page's `useLoad` or message load logic, after messages are loaded, send read receipt for unread messages:

```typescript
const unreadIds = messages.filter((m) => m.senderId !== currentUserId && !m.isRead).map((m) => m.id)
if (unreadIds.length > 0) {
  useChatStore.getState().sendReadReceipt(threadId, unreadIds)
}
```

- [ ] **Step 6: Add i18n keys**

Add to `src/shared/i18n/resources/zh-CN/chat.json`:

```json
"action": {
  "sendProduct": "发商品",
  "sendOrder": "发订单",
  "deleteThread": "删除会话",
  "pinThread": "置顶",
  "unpinThread": "取消置顶"
}
```

Add corresponding en-US keys.

- [ ] **Step 7: Verify compilation**

Run: `rtk tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add src/domains/chat/ src/shared/api/mocks/chat.ts src/shared/api/mocks/index.ts src/pages/chat/conversation/index.tsx src/shared/i18n/resources/zh-CN/chat.json src/shared/i18n/resources/en-US/chat.json
git commit -m "feat: add chat read receipts, product/order cards, thread delete/pin"
```

---

### Task 1.4: Community Circle Join/Leave + Comment Delete

**Files:**
- Modify: `src/pages/community/circle/detail/index.tsx`
- Modify: `src/pages/community/post/index.tsx`
- Modify: `src/domains/community/store.ts`

- [ ] **Step 1: Add circle join/leave to community store**

In `src/domains/community/store.ts`, create or add to a `useCircleStore`:

```typescript
interface CircleState {
  circle: Circle | null
  posts: Post[]
  loading: boolean
  loadDetail: (id: string) => Promise<void>
  joinCircle: (id: string) => Promise<void>
  leaveCircle: (id: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
}

export const useCircleStore = create<CircleState>((set, get) => ({
  circle: null,
  posts: [],
  loading: false,

  loadDetail: async (id) => {
    set({ loading: true })
    try {
      const res = await communityApi.getCircleDetail(id)
      if (res.code === 0) {
        set({ circle: res.data.circle, posts: res.data.posts })
      }
    } finally {
      set({ loading: false })
    }
  },

  joinCircle: async (id) => {
    await communityApi.joinCircle(id)
    const circle = get().circle
    if (circle) {
      set({ circle: { ...circle, isJoined: true, memberCount: circle.memberCount + 1 } })
    }
  },

  leaveCircle: async (id) => {
    await communityApi.leaveCircle(id)
    const circle = get().circle
    if (circle) {
      set({ circle: { ...circle, isJoined: false, memberCount: circle.memberCount - 1 } })
    }
  },

  deleteComment: async (commentId) => {
    await communityApi.deleteComment(commentId)
    set((s) => ({
      comments: s.comments.filter((c) => c.id !== commentId),
    }))
  },
}))
```

Note: Import `Circle` from `@/domains/community/types`.

- [ ] **Step 2: Add join/leave buttons to circle detail page**

In `src/pages/community/circle/detail/index.tsx`, add a join/leave button in the circle header section:

```tsx
<View
  className={`join-btn ${circle.isJoined ? 'joined' : ''}`}
  onClick={async () => {
    if (circle.isJoined) {
      const res = await Taro.showModal({ title: '确认退出', content: `确定退出「${circle.name}」？` })
      if (res.confirm) await leaveCircle(circle.id)
    } else {
      await joinCircle(circle.id)
    }
  }}
>
  <Text>{circle.isJoined ? t('community:circle.joined') : t('community:circle.join')}</Text>
</View>
```

Add i18n keys to `zh-CN/community.json`:

```json
"circle": {
  "join": "加入圈子",
  "joined": "已加入",
  "leave": "退出圈子",
  "members": "成员",
  "todayPosts": "今日发帖"
}
```

- [ ] **Step 3: Add comment deletion to post page**

In `src/pages/community/post/index.tsx`, add long-press handler to comment items:

```tsx
onLongPress={() => {
  if (comment.user.id === currentUserId) {
    Taro.showActionSheet({ itemList: [t('common:app.delete')] }).then(async (res) => {
      if (res.tapIndex === 0) {
        await usePostStore.getState().deleteComment(comment.id)
        Taro.showToast({ title: t('common:app.deleteSuccess'), icon: 'success' })
      }
    })
  }
}}
```

Add `deleteComment` action to `usePostStore` in the community store file:

```typescript
deleteComment: async (commentId: string) => {
  await communityApi.deleteComment(commentId)
  set((s) => ({
    comments: s.comments.filter((c) => c.id !== commentId),
  }))
},
```

- [ ] **Step 4: Verify compilation**

Run: `rtk tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/pages/community/circle/detail/ src/pages/community/post/ src/domains/community/store.ts src/shared/i18n/resources/zh-CN/community.json src/shared/i18n/resources/en-US/community.json
git commit -m "feat: add circle join/leave and comment deletion"
```

---

### Task 1.5: Multi-Device Login Management

**Files:**
- Modify: `src/domains/auth/api.ts`
- Modify: `src/domains/auth/types.ts`
- Create: `src/shared/api/mocks/auth.ts`
- Create: `src/pages/user/devices/index.tsx`
- Create: `src/pages/user/devices/index.scss`
- Modify: `src/app.config.ts`
- Modify: `src/shared/i18n/resources/zh-CN/auth.json`
- Modify: `src/shared/i18n/resources/en-US/auth.json`

- [ ] **Step 1: Add DeviceSession type**

Append to `src/domains/auth/types.ts`:

```typescript
export interface DeviceSession {
  id: string
  deviceModel: string
  osVersion: string
  appVersion: string
  networkType: string
  lastActiveAt: string
  isCurrent: boolean
}
```

- [ ] **Step 2: Add device API methods**

In `src/domains/auth/api.ts`, add to `authApi`:

```typescript
getDevices() {
  return http.get<DeviceSession[]>('/auth/devices')
},

kickDevice(deviceId: string) {
  return http.delete<void>(`/auth/devices/${deviceId}`)
},
```

Add import: `import type { DeviceSession } from './types'`

- [ ] **Step 3: Create auth mock data**

Create `src/shared/api/mocks/auth.ts`:

```typescript
import type { MockRoute } from '../mock-interceptor'

export const authMocks: MockRoute[] = [
  {
    method: 'GET',
    urlPattern: /\/auth\/devices$/,
    handler: () => ({
      code: 0,
      data: [
        { id: 'd1', deviceModel: 'iPhone 15 Pro', osVersion: 'iOS 18', appVersion: '1.2.0', networkType: 'WiFi', lastActiveAt: '2026-06-10T08:30:00Z', isCurrent: true },
        { id: 'd2', deviceModel: 'Huawei Mate 60', osVersion: 'HarmonyOS 4', appVersion: '1.2.0', networkType: '4G', lastActiveAt: '2026-06-09T22:00:00Z', isCurrent: false },
      ],
      message: 'ok',
    }),
  },
  {
    method: 'DELETE',
    urlPattern: /\/auth\/devices\/\w+$/,
    handler: () => ({ code: 0, data: null, message: 'ok' }),
  },
]
```

- [ ] **Step 4: Register devices page in app.config.ts**

Add to user subPackage:

```typescript
{
  root: 'pages/user',
  pages: ['profile/index', 'settings/index', 'devices/index']
}
```

- [ ] **Step 5: Create device management page**

Create `src/pages/user/devices/index.scss`:

```scss
.devices-page {
  min-height: 100vh;
  background: #f5f5f5;

  .device-card {
    background: #fff;
    margin: 16px;
    padding: 24px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .device-info {
    flex: 1;
  }

  .device-model {
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }

  .device-meta {
    font-size: 22px;
    color: #999;
    margin-top: 8px;
  }

  .current-badge {
    font-size: 20px;
    color: #4CAF50;
    background: #E8F5E9;
    padding: 4px 12px;
    border-radius: 10px;
  }

  .kick-btn {
    font-size: 24px;
    color: #FF6B35;
    padding: 8px 20px;
    border: 1px solid #FF6B35;
    border-radius: 20px;
  }
}
```

Create `src/pages/user/devices/index.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/domains/auth/api'
import type { DeviceSession } from '@/domains/auth/types'
import './index.scss'

export default function DevicesPage() {
  const { t } = useTranslation(['auth', 'common'])
  const [devices, setDevices] = useState<DeviceSession[]>([])

  useLoad(async () => {
    const res = await authApi.getDevices()
    if (res.code === 0) setDevices(res.data)
  })

  const handleKick = useCallback(async (device: DeviceSession) => {
    const res = await Taro.showModal({
      title: t('auth:devices.kickTitle'),
      content: t('auth:devices.kickConfirm', { device: device.deviceModel }),
    })
    if (!res.confirm) return
    await authApi.kickDevice(device.id)
    setDevices((prev) => prev.filter((d) => d.id !== device.id))
    Taro.showToast({ title: t('auth:devices.kickSuccess'), icon: 'success' })
  }, [t])

  return (
    <View className='devices-page'>
      {devices.map((device) => (
        <View key={device.id} className='device-card'>
          <View className='device-info'>
            <Text className='device-model'>{device.deviceModel}</Text>
            <Text className='device-meta'>
              {device.osVersion} · {device.networkType} · {device.lastActiveAt.slice(0, 10)}
            </Text>
          </View>
          {device.isCurrent ? (
            <Text className='current-badge'>{t('auth:devices.currentDevice')}</Text>
          ) : (
            <Text className='kick-btn' onClick={() => handleKick(device)}>
              {t('auth:devices.kickAction')}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}
```

- [ ] **Step 6: Add i18n keys**

Add to `src/shared/i18n/resources/zh-CN/auth.json`:

```json
"devices": {
  "title": "已登录设备",
  "currentDevice": "当前设备",
  "kickAction": "下线",
  "kickTitle": "下线设备",
  "kickConfirm": "确定要将 {device} 下线吗？",
  "kickSuccess": "设备已下线"
}
```

Add corresponding en-US keys.

- [ ] **Step 7: Verify compilation**

Run: `rtk tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add src/domains/auth/ src/shared/api/mocks/auth.ts src/shared/api/mocks/index.ts src/pages/user/devices/ src/app.config.ts src/shared/i18n/resources/zh-CN/auth.json src/shared/i18n/resources/en-US/auth.json
git commit -m "feat: add multi-device login management page"
```

---

## Phase 2: Enhanced Features

### Task 2.1: Address Limit Check

**Status: ALREADY IMPLEMENTED** — `src/pages/address/list/index.tsx` already enforces the 20-address limit. Verify and skip.

- [ ] **Step 1: Verify address limit implementation**

Read `src/pages/address/list/index.tsx` and confirm that:
- The "add address" button is hidden or disabled when `addresses.length >= 20`
- A hint message is shown

If confirmed, mark complete and skip to Task 2.2.

---

### Task 2.2: Logistics Enhancements

**Files:**
- Modify: `src/pages/logistics/track/index.tsx`
- Modify: `src/shared/i18n/resources/zh-CN/logistics.json`
- Modify: `src/shared/i18n/resources/en-US/logistics.json`

- [ ] **Step 1: Add anomaly alert bar**

In `src/pages/logistics/track/index.tsx`, add a computed value to check if the latest logistics update is older than 3 days:

```typescript
const isAnomaly = useMemo(() => {
  if (!tracks.length) return false
  const lastUpdate = new Date(tracks[0].time).getTime()
  const threeDays = 3 * 24 * 60 * 60 * 1000
  return Date.now() - lastUpdate > threeDays
}, [tracks])
```

Add the anomaly alert at the top of the page:

```tsx
{isAnomaly && (
  <View className='anomaly-alert'>
    <Text className='anomaly-text'>{t('logistics:anomalyAlert')}</Text>
    <Text className='contact-btn' onClick={() => Taro.makePhoneCall({ phoneNumber: '400-000-0000' })}>
      {t('logistics:contactService')}
    </Text>
  </View>
)}
```

- [ ] **Step 2: Add multi-package Tab support**

Check if the logistics page already supports `packages` data. If not, add Tab rendering for multiple packages:

```tsx
{packages.length > 1 && (
  <View className='package-tabs'>
    {packages.map((pkg, i) => (
      <Text
        key={pkg.id}
        className={`tab ${activePackage === i ? 'active' : ''}`}
        onClick={() => setActivePackage(i)}
      >
        {t('logistics:package')} {i + 1}
      </Text>
    ))}
  </View>
)}
```

- [ ] **Step 3: Add scan button for seller shipping form**

In the seller shipping form (likely `src/pages/seller/index/index.tsx` or a dedicated shipping page), add a scan button next to the tracking number input:

```tsx
<View className='tracking-input-row'>
  <Input
    className='tracking-input'
    placeholder={t('logistics:trackingNoPlaceholder')}
    value={trackingNo}
    onInput={(e) => setTrackingNo(e.detail.value)}
  />
  <Text
    className='scan-btn'
    onClick={async () => {
      const res = await Taro.scanCode({ scanType: ['barCode', 'qrCode'] })
      setTrackingNo(res.result)
    }}
  >
    {t('logistics:scanCode')}
  </Text>
</View>
```

- [ ] **Step 4: Add i18n keys**

Add to `zh-CN/logistics.json`:

```json
"anomalyAlert": "物流信息超过3天未更新",
"contactService": "联系客服",
"package": "包裹",
"scanCode": "扫码",
"trackingNoPlaceholder": "输入运单号"
```

- [ ] **Step 5: Verify and commit**

```bash
git add src/pages/logistics/track/ src/pages/seller/ src/shared/i18n/resources/zh-CN/logistics.json src/shared/i18n/resources/en-US/logistics.json
git commit -m "feat: add logistics anomaly alert, multi-package tabs, and scan button"
```

---

### Task 2.3: Coupon Claim Center

**Files:**
- Modify: `src/pages/coupon/list/index.tsx`
- Modify: `src/domains/marketing/store.ts`
- Modify: `src/shared/i18n/resources/zh-CN/marketing.json`

- [ ] **Step 1: Add coupon template state to marketing store**

In `src/domains/marketing/store.ts`, add to `useCouponStore` or create a new store section:

```typescript
templates: CouponTemplate[]
loadTemplates: async () => {
  const res = await marketingApi.getCouponTemplates()
  if (res.code === 0) set({ templates: res.data })
},
claimCoupon: async (templateId: string) => {
  await marketingApi.claimCoupon(templateId)
  set((s) => ({
    templates: s.templates.map((t) =>
      t.id === templateId ? { ...t, remaining: Math.max(0, t.remaining - 1) } : t
    ),
  }))
},
```

- [ ] **Step 2: Add claim center section to coupon list page**

In `src/pages/coupon/list/index.tsx`, add a "领券中心" section above or below the user's coupon list:

```tsx
<View className='claim-section'>
  <Text className='section-title'>{t('marketing:coupon.claimCenter')}</Text>
  {templates.map((tpl) => (
    <View key={tpl.id} className='coupon-template-card'>
      <View className='template-info'>
        <Text className='template-name'>{tpl.name}</Text>
        <Text className='template-discount'>
          {tpl.type === '折扣' ? `${tpl.discount}折` : `¥${tpl.discount}`}
        </Text>
        <Text className='template-condition'>{t('marketing:coupon.minAmount', { amount: tpl.minAmount })}</Text>
        <Text className='template-remaining'>
          {tpl.remaining > 0 ? t('marketing:coupon.remaining', { count: tpl.remaining }) : t('marketing:coupon.claimed')}
        </Text>
      </View>
      <View
        className={`claim-btn ${tpl.remaining <= 0 ? 'disabled' : ''}`}
        onClick={async () => {
          if (tpl.remaining <= 0) return
          await claimCoupon(tpl.id)
          Taro.showToast({ title: t('marketing:coupon.claimSuccess'), icon: 'success' })
        }}
      >
        <Text>{tpl.remaining > 0 ? t('marketing:coupon.claim') : t('marketing:coupon.soldOut')}</Text>
      </View>
    </View>
  ))}
</View>
```

- [ ] **Step 3: Add i18n keys**

Add to `zh-CN/marketing.json`:

```json
"coupon": {
  "claimCenter": "领券中心",
  "claim": "领取",
  "soldOut": "已抢完",
  "claimSuccess": "领取成功",
  "claimed": "已领完",
  "remaining": "剩余 {count} 张",
  "minAmount": "满 {amount} 元可用"
}
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/pages/coupon/list/ src/domains/marketing/store.ts src/shared/i18n/resources/zh-CN/marketing.json src/shared/i18n/resources/en-US/marketing.json
git commit -m "feat: add coupon claim center to coupon list page"
```

---

### Task 2.4: Creator Center Enhancements

**Files:**
- Modify: `src/pages/community/creator/index.tsx`
- Modify: `src/shared/i18n/resources/zh-CN/community.json`

- [ ] **Step 1: Add certification application section**

In `src/pages/community/creator/index.tsx`, add a certification section:

```tsx
<View className='certification-section'>
  <Text className='section-title'>{t('community:creator.certification')}</Text>
  <View className='condition-list'>
    <Text>{t('community:creator.conditionFans')}: ≥ 100</Text>
    <Text>{t('community:creator.conditionPosts')}: ≥ 20</Text>
    <Text>{t('community:creator.conditionSales')}: ≥ ¥1000</Text>
  </View>
  <View
    className='apply-btn'
    onClick={async () => {
      await communityApi.applyCreatorCertification({ reason: '' })
      Taro.showToast({ title: t('community:creator.applySuccess'), icon: 'success' })
    }}
  >
    <Text>{t('community:creator.applyCertification')}</Text>
  </View>
</View>
```

- [ ] **Step 2: Add commission data section**

```tsx
<View className='commission-section'>
  <Text className='section-title'>{t('community:creator.commissionData')}</Text>
  <View className='commission-summary'>
    <View className='summary-item'>
      <Text className='amount'>¥{commissionData.totalCommission.toFixed(2)}</Text>
      <Text className='label'>{t('community:creator.totalCommission')}</Text>
    </View>
    <View className='summary-item'>
      <Text className='amount'>¥{commissionData.availableCommission.toFixed(2)}</Text>
      <Text className='label'>{t('community:creator.availableCommission')}</Text>
    </View>
    <View className='summary-item'>
      <Text className='amount'>¥{commissionData.monthlyEstimate.toFixed(2)}</Text>
      <Text className='label'>{t('community:creator.monthlyEstimate')}</Text>
    </View>
  </View>
</View>
```

Load commission data in `useLoad`:

```typescript
const [commissionData, setCommissionData] = useState({ totalCommission: 0, availableCommission: 0, monthlyEstimate: 0, records: [] })
useLoad(async () => {
  const res = await marketingApi.getCommissionData()
  if (res.code === 0) setCommissionData(res.data)
})
```

- [ ] **Step 3: Add i18n keys**

Add to `zh-CN/community.json`:

```json
"creator": {
  "certification": "达人认证",
  "conditionFans": "粉丝数",
  "conditionPosts": "发帖数",
  "conditionSales": "交易额",
  "applyCertification": "申请认证",
  "applySuccess": "申请已提交",
  "commissionData": "佣金数据",
  "totalCommission": "累计佣金",
  "availableCommission": "可提现",
  "monthlyEstimate": "本月预估"
}
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/pages/community/creator/ src/shared/i18n/resources/zh-CN/community.json src/shared/i18n/resources/en-US/community.json
git commit -m "feat: add creator certification and commission data to creator center"
```

---

### Task 2.5: Share Enhancements

**Files:**
- Modify: `src/shared/components/share/` (or equivalent share provider)

- [ ] **Step 1: Add onShareTimeline support**

In the share utility/provider component, add `Taro.useShareTimeline`:

```typescript
Taro.useShareTimeline(() => ({
  title: pageTitle || t('common:app.name'),
  query: 'from=share_timeline',
}))
```

- [ ] **Step 2: Add Canvas fallback to poster generator**

In the poster generator component, wrap `Taro.canvasToTempFilePath` in try/catch and call backend fallback:

```typescript
try {
  const res = await Taro.canvasToTempFilePath({ canvasId: 'poster-canvas' })
  setPosterUrl(res.tempFilePath)
} catch {
  Taro.showToast({ title: t('common:app.loading'), icon: 'none' })
  const fallbackRes = await http.get<string>('/poster/generate')
  if (fallbackRes.code === 0) {
    setPosterUrl(fallbackRes.data)
    Taro.previewImage({ urls: [fallbackRes.data] })
  }
}
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/shared/components/share/
git commit -m "feat: add onShareTimeline and Canvas poster fallback"
```

---

### Task 2.6: Admin Panel Trend Chart

**Files:**
- Install: `echarts-for-weixin` (via npm)
- Create: `src/pages/admin/components/TrendChart/index.tsx`
- Create: `src/pages/admin/components/TrendChart/index.scss`
- Modify: `src/pages/admin/index/index.tsx`

- [ ] **Step 1: Install echarts-for-weixin**

Run: `npm install echarts echarts-for-weixin --save`

If the package is unavailable or incompatible, skip this task and use a CSS-only fallback (number cards).

- [ ] **Step 2: Create TrendChart component**

Create `src/pages/admin/components/TrendChart/index.tsx`:

```tsx
import { useRef, useEffect } from 'react'
import { View } from '@tarojs/components'
import * as echarts from 'echarts'
import './index.scss'

interface TrendChartProps {
  data: { date: string; value: number }[]
  title: string
}

export default function TrendChart({ data, title }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.init(chartRef.current)
    chartInstance.current = chart
    chart.setOption({
      title: { text: title, textStyle: { fontSize: 14 } },
      xAxis: { type: 'category', data: data.map((d) => d.date) },
      yAxis: { type: 'value' },
      series: [{ data: data.map((d) => d.value), type: 'line', smooth: true }],
    })
    return () => chart.dispose()
  }, [data, title])

  return <View className='trend-chart' ref={chartRef} />
}
```

Note: If echarts doesn't work in Taro mini-program context, replace with a simple CSS bar chart or static number display.

- [ ] **Step 3: Add trend chart to admin dashboard**

In `src/pages/admin/index/index.tsx`, import and use the TrendChart component:

```tsx
import TrendChart from './components/TrendChart'

// In the dashboard section:
<TrendChart
  title={t('admin:trend.orderTrend')}
  data={dashboardData.orderTrend || []}
/>
<TrendChart
  title={t('admin:trend.revenueTrend')}
  data={dashboardData.revenueTrend || []}
/>
```

- [ ] **Step 4: Add i18n keys and commit**

```bash
git add src/pages/admin/ package.json
git commit -m "feat: add echarts trend chart to admin dashboard"
```

---

### Task 2.7: Offer Expiry Countdown

**Files:**
- Modify: `src/pages/offer/detail/index.tsx`
- Modify: `src/shared/i18n/resources/zh-CN/trade.json`

- [ ] **Step 1: Add countdown timer logic**

In `src/pages/offer/detail/index.tsx`, add state and interval:

```typescript
const [timeLeft, setTimeLeft] = useState('')
const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal')

useEffect(() => {
  if (!offer?.expiresAt) return
  const update = () => {
    const diff = new Date(offer.expiresAt).getTime() - Date.now()
    if (diff <= 0) {
      setTimeLeft(t('trade:offerStatusExpired'))
      setUrgency('normal')
      return
    }
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    if (diff < 3600000) setUrgency('critical')
    else if (diff < 14400000) setUrgency('warning')
    else setUrgency('normal')
  }
  update()
  const timer = setInterval(update, 1000)
  return () => clearInterval(timer)
}, [offer?.expiresAt, t])
```

- [ ] **Step 2: Add countdown display in the page**

```tsx
{offer.status === 'pending' && timeLeft && (
  <View className={`countdown-bar ${urgency}`}>
    <Text>{t('trade:offer.expiresIn')}: {timeLeft}</Text>
  </View>
)}
```

Style:
- `warning`: yellow background
- `critical`: red background with bold text

- [ ] **Step 3: Add i18n keys**

Add to `zh-CN/trade.json`:

```json
"offer": {
  "expiresIn": "距过期"
}
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/pages/offer/detail/ src/shared/i18n/resources/zh-CN/trade.json src/shared/i18n/resources/en-US/trade.json
git commit -m "feat: add offer expiry countdown with urgency indicators"
```

---

### Task 2.8: Points Deduction UI

**Files:**
- Modify: `src/pages/order/create/index.tsx`
- Modify: `src/shared/i18n/resources/zh-CN/trade.json`

- [ ] **Step 1: Add points deduction toggle**

In `src/pages/order/create/index.tsx`, add state and logic:

```typescript
const [usePointsDeduction, setUsePointsDeduction] = useState(false)
const [pointsBalance, setPointsBalance] = useState(0)

// Load points balance
useLoad(async () => {
  // ... existing load logic
  const pointsRes = await marketingApi.getPointsData()
  if (pointsRes.code === 0) setPointsBalance(pointsRes.data.points)
})

// Calculate deduction
const pointsDeductionAmount = useMemo(() => {
  if (!usePointsDeduction) return 0
  const maxDeduction = orderAmount * 0.5 // 50% limit
  const pointsValue = pointsBalance / 100 // 100 points = 1 yuan
  return Math.min(pointsValue, maxDeduction)
}, [usePointsDeduction, orderAmount, pointsBalance])

// Ensure minimum payment is 0.01
const finalAmount = Math.max(0.01, orderAmount - couponDiscount - pointsDeductionAmount)
```

- [ ] **Step 2: Add UI for points toggle**

```tsx
<View className='points-row'>
  <View>
    <Text>{t('trade:usePoints')}</Text>
    <Text className='points-hint'>
      {t('trade:points.rate', { points: pointsBalance, amount: (pointsBalance / 100).toFixed(2) })}
    </Text>
  </View>
  <Switch
    checked={usePointsDeduction}
    onChange={(e) => setUsePointsDeduction(e.detail.value)}
  />
</View>
{usePointsDeduction && pointsDeductionAmount > 0 && (
  <View className='deduction-row'>
    <Text>{t('trade:points.deduction')}</Text>
    <Text className='deduction-amount'>-¥{pointsDeductionAmount.toFixed(2)}</Text>
  </View>
)}
```

- [ ] **Step 3: Add i18n keys**

Add to `zh-CN/trade.json`:

```json
"points": {
  "rate": "{points} 积分可用（≈ ¥{amount}）",
  "deduction": "积分抵扣"
}
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/pages/order/create/ src/shared/i18n/resources/zh-CN/trade.json src/shared/i18n/resources/en-US/trade.json
git commit -m "feat: add points deduction toggle to order create page"
```

---

## Phase 3: Quality

### Task 3.1: i18n Verification and Cleanup

- [ ] **Step 1: Scan for remaining hardcoded Chinese**

Run: `grep -r '[\u4e00-\u9fff]\{4,\}' src/pages/**/*.tsx --include='*.tsx' | grep -v 'node_modules'`

Review each match and determine if it needs i18n extraction (some Chinese in comments or console.log is acceptable).

- [ ] **Step 2: Extract remaining hardcoded strings**

For each file with hardcoded Chinese:
1. Move the string to the appropriate namespace JSON file (zh-CN and en-US)
2. Replace with `t('namespace:key')`

- [ ] **Step 3: Verify language switching**

Run: Start dev server, switch language, verify pages display correct translations.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ src/shared/i18n/
git commit -m "refactor: extract remaining hardcoded Chinese strings to i18n"
```

---

### Task 3.2: Balance Visibility Toggle

**Files:**
- Modify: `src/pages/wallet/index/index.tsx`
- Modify: `src/domains/wallet/store.ts` (optional)

- [ ] **Step 1: Fix getTxInfo bug**

In `src/pages/wallet/index/index.tsx`, find the `getTxInfo` function (around line 65-69) and add the missing return statement:

```typescript
function getTxInfo(tx: any) {
  // ... existing logic ...
  return { label, color, prefix }
}
```

- [ ] **Step 2: Add visibility toggle state**

```typescript
const [balanceVisible, setBalanceVisible] = useState(false)
```

- [ ] **Step 3: Add toggle UI**

Replace the balance display with:

```tsx
<Text className='balance-amount' onClick={() => setBalanceVisible(!balanceVisible)}>
  {balanceVisible ? `¥${balance.available.toFixed(2)}` : '****'}
</Text>
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/pages/wallet/index/
git commit -m "feat: add balance visibility toggle and fix getTxInfo bug"
```

---

### Task 3.3: Post Draft Auto-Save

**Files:**
- Modify: `src/pages/community/create/index.tsx`
- Modify: `src/domains/community/store.ts`

- [ ] **Step 1: Add draft save/restore logic**

In `src/pages/community/create/index.tsx`, add:

```typescript
const DRAFT_KEY = 'post_draft'

// Restore draft on load
useLoad(() => {
  const draft = Taro.getStorageSync(DRAFT_KEY)
  if (draft) {
    Taro.showModal({
      title: t('community:draft.recoverTitle'),
      content: t('community:draft.recoverContent'),
    }).then((res) => {
      if (res.confirm) {
        setContent(draft.content || '')
        setImages(draft.images || [])
      } else {
        Taro.removeStorageSync(DRAFT_KEY)
      }
    })
  }
})

// Auto-save draft on content change
useEffect(() => {
  if (content || images.length > 0) {
    Taro.setStorageSync(DRAFT_KEY, { content, images })
  }
}, [content, images])

// Clear draft after successful submit
// In the submit handler, after success:
Taro.removeStorageSync(DRAFT_KEY)
```

- [ ] **Step 2: Add i18n keys**

Add to `zh-CN/community.json`:

```json
"draft": {
  "recoverTitle": "恢复草稿",
  "recoverContent": "发现上次未发布的草稿，是否恢复？"
}
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/pages/community/create/ src/shared/i18n/resources/zh-CN/community.json src/shared/i18n/resources/en-US/community.json
git commit -m "feat: add post draft auto-save and recovery"
```

---

## Final Verification

- [ ] **Run `rtk tsc --noEmit`** — zero errors
- [ ] **Verify all pages exist**: All paths in `app.config.ts` map to actual files
- [ ] **Scan i18n**: `grep -r '[\u4e00-\u9fff]\{4,\}' src/pages/**/*.tsx` returns minimal results (only comments/console)
- [ ] **Start dev server**: Key pages render with mock data
