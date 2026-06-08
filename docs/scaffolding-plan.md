# REMX Taro Mini App Scaffolding Plan

> **⚠️ 历史文档：** 本文件是项目早期脚手架阶段（openspec `remx-taro-marketplace`）的规划文档。当时计划采用 `stores/` + `services/` + `components/` 的平铺结构。
>
> **当前项目实际采用** `domains/`（领域模块）+ `pages/`（页面层）+ `shared/`（共享层）的 **DDD 风格分层架构**，与本规划的结构有较大差异。此文档仅作为历史参考保留。

> Based on openspec change `remx-taro-marketplace` - project structure to scaffold after specs complete.

## 1. Dependencies to Install

```bash
# State management & HTTP
pnpm add zustand axios dayjs

# UI Library (Taro edition)
pnpm add @nutui/nutui-react-taro
pnpm add @nutui/icons-react-taro
```

## 2. Directory Structure

```
src/
├── app.config.ts          # Pages, tabBar, subPackages
├── app.tsx                # App entry (stores init, auth check)
├── app.scss               # Global theme + CSS variables
├── pages/
│   ├── index/             # Home (recommended products)
│   ├── category/          # Category browse (tab)
│   ├── publish/           # Publish product (tab)
│   ├── message/           # Chat list (tab)
│   ├── profile/           # My profile (tab)
│   ├── auth/
│   │   ├── login/         # WeChat login
│   │   └── register/      # Phone registration
│   ├── product/
│   │   ├── detail/        # Product detail
│   │   └── search/        # Search + filter
│   ├── order/
│   │   ├── list/          # Order list
│   │   ├── detail/        # Order detail
│   │   ├── create/        # Create order
│   │   └── pay/           # Payment
│   ├── offer/
│   │   ├── list/          # Offer list
│   │   └── detail/        # Offer detail
│   ├── address/
│   │   ├── list/          # Address management
│   │   └── edit/          # Edit address
│   ├── logistics/
│   │   └── track/         # Logistics tracking
│   ├── wallet/
│   │   ├── index/         # Wallet home
│   │   └── withdraw/      # Withdraw
│   ├── community/
│   │   ├── feed/          # Community feed
│   │   ├── post/          # Post detail
│   │   └── create/        # Create post
│   ├── coupon/
│   │   └── list/          # Coupon list
│   ├── points/
│   │   └── index/         # Points center
│   ├── checkin/
│   │   └── index/         # Daily check-in
│   ├── referral/
│   │   └── index/         # Referral
│   ├── kyc/
│   │   ├── index/         # KYC overview
│   │   ├── phone/         # Phone verification
│   │   └── identity/      # ID OCR
│   ├── review/            # Review page
│   └── notification/      # Notification center
├── stores/                # Zustand stores
│   ├── auth.ts
│   ├── product.ts
│   ├── order.ts
│   ├── chat.ts
│   ├── ui.ts
│   └── marketing.ts
├── services/              # API services
│   ├── request.ts         # Axios + interceptor
│   ├── auth.ts
│   ├── product.ts
│   ├── order.ts
│   ├── offer.ts
│   ├── logistics.ts
│   ├── wallet.ts
│   ├── community.ts
│   ├── chat.ts
│   ├── coupon.ts
│   ├── points.ts
│   ├── kyc.ts
│   ├── upload.ts
│   └── notification.ts
├── components/
│   ├── ui/                # Shared UI components
│   ├── product/           # Product card, grid
│   ├── order/             # Order status card
│   ├── community/         # Post card, creator badge
│   └── common/            # Empty state, error, skeleton
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── usePage.ts
├── utils/
│   ├── format.ts
│   ├── validator.ts
│   ├── storage.ts
│   └── platform.ts
└── types/                 # TypeScript types
    ├── product.ts
    ├── order.ts
    ├── user.ts
    ├── offer.ts
    └── chat.ts
```

## 3. app.config.ts Template

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/category/index',
    'pages/publish/index',
    'pages/message/index',
    'pages/profile/index',
  ],
  subPackages: [
    {
      root: 'pages/product/',
      pages: ['detail/index', 'search/index']
    },
    {
      root: 'pages/order/',
      pages: ['list/index', 'detail/index', 'create/index', 'pay/index']
    },
    {
      root: 'pages/offer/',
      pages: ['list/index', 'detail/index']
    },
    {
      root: 'pages/community/',
      pages: ['feed/index', 'post/index', 'create/index']
    },
    {
      root: 'pages/auth/',
      pages: ['login/index', 'register/index']
    },
    {
      root: 'pages/wallet/',
      pages: ['index/index', 'withdraw/index']
    },
    {
      root: 'pages/kyc/',
      pages: ['index/index', 'phone/index', 'identity/index']
    },
    {
      root: 'pages/marketing/',
      pages: ['coupon/index', 'points/index', 'checkin/index', 'referral/index']
    },
    {
      root: 'pages/address/',
      pages: ['list/index', 'edit/index']
    },
    {
      root: 'pages/logistics/',
      pages: ['track/index']
    }
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#FF6B35',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/index/index', text: '首页', iconPath: 'assets/tab/home.png', selectedIconPath: 'assets/tab/home-active.png' },
      { pagePath: 'pages/category/index', text: '分类', iconPath: 'assets/tab/category.png', selectedIconPath: 'assets/tab/category-active.png' },
      { pagePath: 'pages/publish/index', text: '发布', iconPath: 'assets/tab/publish.png', selectedIconPath: 'assets/tab/publish-active.png' },
      { pagePath: 'pages/message/index', text: '消息', iconPath: 'assets/tab/message.png', selectedIconPath: 'assets/tab/message-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'assets/tab/profile.png', selectedIconPath: 'assets/tab/profile-active.png' }
    ]
  },
  preloadRule: {
    'pages/index/index': { network: 'all', packages: ['pages/product'] },
    'pages/category/index': { network: 'all', packages: ['pages/product'] }
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'REMX',
    navigationBarTextStyle: 'black'
  }
})
```

## 4. request.ts Template (Axios Interceptor)

```typescript
import Taro from '@tarojs/taro'

const request = <T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: any
  showLoading?: boolean
}): Promise<T> => {
  const token = Taro.getStorageSync('token')
  
  if (options.showLoading) {
    Taro.showLoading({ title: '加载中...' })
  }

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Client-Type': 'miniapp',
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      if (options.showLoading) Taro.hideLoading()
      
      if (res.statusCode === 401) {
        // Refresh token
        const refreshed = await refreshToken()
        if (refreshed) {
          return resolve(await request(options))
        } else {
          Taro.reLaunch({ url: '/pages/auth/login/index' })
          return reject(new Error('Token expired'))
        }
      }
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(res.data as T)
      } else {
        Taro.showToast({ title: res.data?.message || '请求失败', icon: 'none' })
        reject(res.data)
      }
    }).catch(err => {
      if (options.showLoading) Taro.hideLoading()
      Taro.showToast({ title: '网络异常', icon: 'none' })
      reject(err)
    })
  })
}
```

## 5. Scaffolding Order

| Step | Action | Files |
|------|--------|-------|
| 1 | Install dependencies | package.json |
| 2 | Update app.config.ts | Pages + tabBar + subPackages |
| 3 | Create global styles | app.scss (theme variables) |
| 4 | Create types directory | All *.ts type files |
| 5 | Create services directory | request.ts + all API services |
| 6 | Create stores directory | All Zustand stores |
| 7 | Create components directory | UI + domain components |
| 8 | Create hooks directory | Custom hooks |
| 9 | Create tab pages | 5 tab page stubs |
| 10 | Create subpackage pages | All subpackage page stubs |
| 11 | Create assets directory | tab icons + placeholder images |
