# REMX Mini App 页面详细规格

> 每个页面的参数、交互流程、API 调用详细说明

---

## 1. 认证模块

### 1.1 登录页 `/pages/auth/login`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `redirect` | string | 否 | 登录后跳转路径 |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| Logo | Image | 应用 Logo |
| 微信一键登录按钮 | Button | 调用 `wx.login` |
| 手机号登录入口 | Text/Link | 跳转手机号登录 |
| 注册入口 | Text/Link | 跳转注册页 |
| 用户协议勾选 | Checkbox | 必须勾选才能登录 |

#### 交互流程

```
用户打开小程序
    │
    ├─ 检查本地 Token
    │   ├─ 有效 → 直接进入首页
    │   └─ 无效/过期 → 显示登录页
    │
    ├─ 用户点击"微信一键登录"
    │   ├─ 检查用户协议勾选
    │   │   └─ 未勾选 → 提示"请先同意用户协议"
    │   ├─ wx.login() → 获取 code
    │   ├─ POST /api/auth/wechat-login { code }
    │   │   ├─ 返回 { token, refreshToken, isNewUser, userId }
    │   │   │   ├─ isNewUser = true → 跳转手机号绑定页
    │   │   │   └─ isNewUser = false → 存储 Token → 跳转首页/redirect
    │   │   └─ 错误 → 显示错误提示
    │   └─ 失败 → 显示错误提示
    │
    └─ 用户点击"手机号登录"
        └─ 跳转手机号登录页
```

#### API 调用

```typescript
// 微信登录
POST /api/auth/wechat-login
Request: { code: string }
Response: {
  token: string;
  refreshToken: string;
  isNewUser: boolean;
  userId?: string;
  phone?: string;
}
```

---

### 1.2 手机号登录页 `/pages/auth/login-phone`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `redirect` | string | 否 | 登录后跳转路径 |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 手机号输入框 | Input | 11 位手机号 |
| 验证码输入框 | Input | 6 位数字 |
| 获取验证码按钮 | Button | 倒计时 60 秒 |
| 登录按钮 | Button | 提交登录 |
| 返回 | Icon | 返回上一页 |

#### 交互流程

```
用户输入手机号
    │
    ├─ 格式校验 (11 位数字)
    │   └─ 不通过 → 提示"手机号格式不正确"
    │
    ├─ 点击"获取验证码"
    │   ├─ POST /api/auth/sms/send { phone }
    │   │   ├─ 成功 → 倒计时 60 秒
    │   │   └─ 失败 → 提示错误信息
    │   └─ 频率限制: 同一手机号 60 秒内只能发送一次
    │
    ├─ 用户输入验证码
    │
    └─ 点击"登录"
        ├─ POST /api/auth/login { phone, code }
        │   ├─ 成功 → 存储 Token → 跳转首页
        │   └─ 失败 → 提示错误信息
        └─ 风控: 同一设备 1 小时内最多尝试 5 次
```

#### API 调用

```typescript
// 发送验证码
POST /api/auth/sms/send
Request: { phone: string }
Response: { success: boolean; cooldown: number }

// 手机号登录
POST /api/auth/login
Request: { phone: string; code: string; deviceFingerprint?: string }
Response: {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    username: string;
    avatar: string;
    trustScore: number;
  }
}
```

---

### 1.3 注册页 `/pages/auth/register`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | string | 是 | 手机号（从登录页传递） |
| `code` | string | 是 | 验证码 |
| `referralCode` | string | 否 | 邀请码 |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 用户名输入框 | Input | 2-20 字符 |
| 密码输入框 | Input (password) | 8-20 字符，含字母和数字 |
| 确认密码输入框 | Input (password) | 重复密码 |
| 邀请码输入框 | Input | 可选，8 位 |
| 注册按钮 | Button | 提交注册 |

#### 交互流程

```
用户填写注册信息
    │
    ├─ 用户名校验: 2-20 字符，不含特殊字符
    ├─ 密码校验: 8-20 字符，必须含字母和数字
    ├─ 确认密码: 必须与密码一致
    │
    └─ 点击"注册"
        ├─ POST /api/auth/register {
        │     username, password, phone, code, referralCode?
        │   }
        │   ├─ 成功 → 存储 Token → 跳转首页
        │   └─ 失败 → 提示错误信息
        └─ 邀请码校验: 8 位字母数字，有效且未达上限
```

#### API 调用

```typescript
POST /api/auth/register
Request: {
  username: string;
  password: string;
  phone: string;
  code: string;
  referralCode?: string;
}
Response: {
  token: string;
  refreshToken: string;
  user: User;
}
```

---

## 2. 首页模块

### 2.1 首页 `/pages/home/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tab` | string | 否 | 默认选中 Tab (recommend/nearby/following) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 搜索栏 | SearchBar | 点击跳转搜索页 |
| 轮播图 | Swiper | 平台活动/推荐商品 |
| 分类快捷入口 | Grid | 8 个分类图标 |
| Tab 切换 | Tabs | 推荐/附近/关注 |
| 商品列表 | List (瀑布流) | 商品卡片列表 |

#### 交互流程

```
用户进入首页
    │
    ├─ 加载轮播图
    │   └─ GET /api/banners
    │
    ├─ 加载分类
    │   └─ GET /api/categories
    │
    ├─ 加载推荐商品 (默认 Tab)
    │   └─ GET /api/recommendations/home?page=1&limit=20
    │
    ├─ 下拉刷新
    │   └─ 重新加载所有数据
    │
    └─ 上拉加载更多
        └─ GET /api/recommendations/home?page={next}&limit=20
```

#### API 调用

```typescript
// 获取轮播图
GET /api/banners
Response: { banners: Array<{ id, imageUrl, linkType, linkUrl }> }

// 获取分类
GET /api/categories
Response: { categories: Array<{ id, name, icon, subcategories }> }

// 获取推荐商品
GET /api/recommendations/home
Query: { page: number; limit: number; tab: 'recommend' | 'nearby' | 'following' }
Response: {
  products: Product[];
  hasMore: boolean;
  total: number;
}

// Product 类型
interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: string;
  location: string;
  distance?: number;
  seller: {
    id: string;
    username: string;
    avatar: string;
    trustScore: number;
  };
  isNegotiable: boolean;
  createdAt: string;
}
```

---

### 2.2 搜索页 `/pages/search/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | 否 | 搜索关键词 |
| `categoryId` | string | 否 | 分类筛选 |
| `sort` | string | 否 | 排序方式 (default/price_asc/price_desc/newest) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 搜索框 | Input | 自动聚焦 |
| 搜索历史 | List | 最近 10 条 |
| 热门搜索 | Tag | 热门关键词 |
| 筛选按钮 | Button | 弹出筛选面板 |
| 排序切换 | Tabs | 综合/价格/最新 |
| 商品列表 | List | 搜索结果 |

#### 交互流程

```
用户进入搜索页
    │
    ├─ 加载搜索历史
    │   └─ 从本地 Storage 读取
    │
    ├─ 加载热门搜索
    │   └─ GET /api/search/hot
    │
    ├─ 用户输入关键词
    │   ├─ 防抖 300ms
    │   └─ 实时搜索建议
    │       └─ GET /api/search/suggest?keyword=xxx
    │
    ├─ 用户确认搜索
    │   ├─ 保存搜索历史
    │   ├─ POST /api/search/log { keyword } (登录用户)
    │   └─ GET /api/products/search?keyword=xxx&categoryId=&sort=&page=1&limit=20
    │
    ├─ 筛选操作
    │   └─ 弹出筛选面板 (价格区间、分类、成色、距离)
    │
    └─ 上拉加载更多
        └─ GET /api/products/search?page={next}&limit=20
```

#### API 调用

```typescript
// 搜索建议
GET /api/search/suggest
Query: { keyword: string }
Response: { suggestions: string[] }

// 热门搜索
GET /api/search/hot
Response: { keywords: Array<{ keyword: string; count: number }> }

// 搜索商品
GET /api/products/search
Query: {
  keyword?: string;
  categoryId?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // km
  sort: 'default' | 'price_asc' | 'price_desc' | 'newest' | 'distance';
  page: number;
  limit: number;
}
Response: {
  products: Product[];
  total: number;
  hasMore: boolean;
  appliedFilters?: {
    synonymExpanded?: string[];
    autoCategory?: string;
  };
}
```

---

### 2.3 商品详情页 `/pages/product/detail`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 商品 ID |
| `from` | string | 否 | 来源 (share/qr/home) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 商品图片轮播 | Swiper | 1-9 张图片 |
| 价格 | Text | 当前价格 + 原价 |
| 议价标识 | Tag | "可议价" (如果 isNegotiable) |
| 商品信息 | Card | 标题、描述、成色、分类 |
| 卖家信息 | Card | 头像、昵称、信任分、在售商品数 |
| 出价区域 | Card | 最高出价、出价列表 (可议价商品) |
| 底部操作栏 | Fixed | 收藏/聊天/出价/立即购买 |

#### 交互流程

```
用户进入商品详情页
    │
    ├─ 加载商品详情
    │   └─ GET /api/products/:id
    │
    ├─ 记录浏览行为
    │   └─ POST /api/behaviors/view { productId }
    │
    ├─ 加载推荐商品
    │   └─ GET /api/recommendations/product/:id
    │
    ├─ 用户操作
    │   ├─ 收藏 → POST /api/products/:id/favorite
    │   ├─ 聊天 → 创建会话 → 跳转聊天页
    │   ├─ 出价 → 弹出出价面板
    │   ├─ 立即购买 → 跳转创建订单页
    │   └─ 分享 → onShareAppMessage
    │
    └─ 出价面板 (可议价商品)
        ├─ 显示当前最高出价
        ├─ 输入出价金额 (≤ 标价)
        ├─ 输入附言 (可选)
        └─ POST /api/products/:id/offers { amount, note }
```

#### API 调用

```typescript
// 获取商品详情
GET /api/products/:id
Response: {
  product: {
    id: string;
    userId: string;
    categoryId: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    status: string;
    latitude: number;
    longitude: number;
    location: string;
    images: string[];
    viewCount: number;
    favoriteCount: number;
    isNegotiable: boolean;
    highestOffer?: number;
    offerCount: number;
    createdAt: string;
    updatedAt: string;
    seller: {
      id: string;
      username: string;
      avatar: string;
      trustScore: number;
      productCount: number;
      isVerified: boolean;
    };
    category: {
      id: string;
      name: string;
    };
  };
  isFavorited: boolean;
  isOwner: boolean;
}

// 收藏/取消收藏
POST /api/products/:id/favorite
Response: { isFavorited: boolean }

// 发起出价
POST /api/products/:id/offers
Request: {
  amount: number;
  note?: string;
}
Response: {
  offer: {
    id: string;
    status: 'pending';
    amount: number;
    createdAt: string;
  };
}
```

---

## 3. 订单模块

### 3.1 创建订单页 `/pages/order/create`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productId` | string | 是 | 商品 ID |
| `offerId` | string | 否 | 议价成交的出价 ID |
| `quantity` | number | 否 | 数量 (默认 1) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 商品信息 | Card | 图片、标题、价格 |
| 收货地址 | AddressCard | 选择收货地址 |
| 优惠券选择 | Cell | 选择可用优惠券 |
| 积分抵扣 | Cell | 输入抵扣积分数量 |
| 备注输入框 | Textarea | 买家留言 |
| 价格明细 | Card | 商品金额、优惠券、积分抵扣、实付金额 |
| 提交订单按钮 | Button | 确认下单 |

#### 交互流程

```
用户进入创建订单页
    │
    ├─ 加载商品信息
    │   └─ GET /api/products/:id
    │
    ├─ 加载收货地址
    │   └─ GET /api/addresses (默认地址高亮)
    │
    ├─ 加载可用优惠券
    │   └─ GET /api/coupons/available?orderId=&amount=
    │
    ├─ 加载积分信息
    │   └─ GET /api/points/balance
    │
    ├─ 用户操作
    │   ├─ 选择收货地址 → 弹出地址选择器
    │   ├─ 选择优惠券 → 弹出优惠券列表
    │   ├─ 输入积分抵扣 → 实时计算实付金额
    │   └─ 输入备注
    │
    └─ 点击"提交订单"
        ├─ POST /api/orders {
        │     productId, offerId?, addressId,
        │     couponId?, pointsUsed?, note?
        │   }
        │   ├─ 成功 → 跳转支付页
        │   └─ 失败 → 提示错误信息
        └─ 校验:
            ├─ 地址不能为空
            ├─ 积分抵扣不超过 50%
            └─ 优惠券满足使用条件
```

#### API 调用

```typescript
// 获取可用优惠券
GET /api/coupons/available
Query: { amount: number; productId?: string }
Response: {
  coupons: Array<{
    id: string;
    name: string;
    type: 'fixed_discount' | 'percentage_discount' | 'free_shipping';
    value: number;
    minAmount: number;
    validTo: string;
  }>;
}

// 创建订单
POST /api/orders
Request: {
  productId: string;
  offerId?: string;
  addressId: string;
  couponId?: string;
  pointsUsed?: number;
  note?: string;
}
Response: {
  order: {
    id: string;
    orderNo: string;
    totalAmount: number;
    discountAmount: number;
    couponDiscount: number;
    pointsDiscount: number;
    finalAmount: number;
    status: 'pending_payment';
    createdAt: string;
  };
}
```

---

### 3.2 支付页 `/pages/order/pay`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `orderId` | string | 是 | 订单 ID |
| `amount` | number | 是 | 支付金额 |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 支付金额 | Text | 大字显示 |
| 支付方式 | RadioGroup | 微信支付 (默认) |
| 支付按钮 | Button | 确认支付 |
| 取消支付 | Link | 返回订单详情 |

#### 交互流程

```
用户进入支付页
    │
    ├─ 显示支付信息
    │   └─ 订单号、支付金额
    │
    └─ 用户点击"确认支付"
        ├─ POST /api/orders/:id/pay
        │   └─ 返回 { timeStamp, nonceStr, package, signType, paySign }
        ├─ 调用 wx.requestPayment
        │   ├─ 成功 → 跳转支付成功页
        │   └─ 失败 → 提示"支付失败"，可重试
        └─ 超时处理: 5 分钟未支付自动取消
```

#### API 调用

```typescript
// 发起支付
POST /api/orders/:id/pay
Response: {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'MD5' | 'RSA';
  paySign: string;
}

// 支付成功后轮询订单状态
GET /api/orders/:id
Query: { poll: true }
Response: {
  order: {
    id: string;
    status: 'paid' | 'pending_payment';
    paidAt?: string;
  };
}
```

---

### 3.3 订单列表页 `/pages/order/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tab` | string | 否 | 默认 Tab (all/pending_payment/pending_shipment/pending_delivery/completed) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| Tab 切换 | Tabs | 全部/待付款/待发货/待收货/已完成 |
| 订单列表 | List | 订单卡片 |
| 空状态 | Empty | 无订单时显示 |

#### 交互流程

```
用户进入订单列表
    │
    ├─ 加载订单列表
    │   └─ GET /api/orders?status={tab}&page=1&limit=10
    │
    ├─ 切换 Tab
    │   └─ 重新加载对应状态订单
    │
    ├─ 点击订单卡片
    │   └─ 跳转订单详情页
    │
    └─ 上拉加载更多
        └─ GET /api/orders?status={tab}&page={next}&limit=10
```

#### API 调用

```typescript
// 获取订单列表
GET /api/orders
Query: {
  status?: 'pending_payment' | 'pending_shipment' | 'pending_delivery' | 'completed' | 'cancelled' | 'refunding';
  page: number;
  limit: number;
}
Response: {
  orders: Array<{
    id: string;
    orderNo: string;
    product: {
      id: string;
      title: string;
      image: string;
      price: number;
    };
    totalAmount: number;
    status: string;
    statusLabel: string;
    createdAt: string;
    canPay: boolean;
    canCancel: boolean;
    canConfirm: boolean;
    canRefund: boolean;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

### 3.4 订单详情页 `/pages/order/detail`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 订单 ID |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 订单状态 | Header | 状态图标 + 文字 |
| 收货地址 | AddressCard | 收货人信息 |
| 商品信息 | Card | 图片、标题、价格、数量 |
| 物流信息 | Card | 物流公司、运单号、状态 |
| 价格明细 | Card | 商品金额、优惠、实付 |
| 订单信息 | Card | 订单号、创建时间、支付时间 |
| 操作按钮 | ButtonGroup | 根据状态显示不同操作 |

#### 操作按钮逻辑

| 订单状态 | 买家操作 | 卖家操作 |
|---------|---------|---------|
| pending_payment | 取消订单、立即支付 | - |
| pending_shipment | - | 确认发货 |
| shipped | 确认收货、查看物流 | - |
| delivered | - | - |
| completed | 申请售后、评价 | 查看评价 |
| refunding | 查看退款进度 | 处理退款 |
| cancelled | - | - |

#### 交互流程

```
用户进入订单详情页
    │
    ├─ 加载订单详情
    │   └─ GET /api/orders/:id
    │
    ├─ 加载物流信息 (如果已发货)
    │   └─ GET /api/shipping/:orderId
    │
    ├─ 用户操作
    │   ├─ 取消订单 → POST /api/orders/:id/cancel
    │   ├─ 立即支付 → 跳转支付页
    │   ├─ 确认收货 → POST /api/orders/:id/confirm
    │   │   └─ 二次确认弹窗
    │   ├─ 查看物流 → 跳转物流追踪页
    │   ├─ 申请退款 → 跳转退款页
    │   └─ 评价 → 跳转评价页
    │
    └─ 卖家操作
        └─ 确认发货 → 弹出发货表单
            ├─ 选择物流公司
            ├─ 输入运单号
            └─ POST /api/shipping { orderId, providerId, trackingNo }
```

#### API 调用

```typescript
// 获取订单详情
GET /api/orders/:id
Response: {
  order: {
    id: string;
    orderNo: string;
    status: string;
    statusLabel: string;
    product: Product;
    buyer: User;
    seller: User;
    address: Address;
    totalAmount: number;
    discountAmount: number;
    couponDiscount: number;
    pointsDiscount: number;
    finalAmount: number;
    note?: string;
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    shippingOrder?: ShippingOrder;
  };
}

// 取消订单
POST /api/orders/:id/cancel
Request: { reason?: string }
Response: { success: boolean }

// 确认收货
POST /api/orders/:id/confirm
Response: { success: boolean }

// 卖家发货
POST /api/shipping
Request: {
  orderId: string;
  providerId: string;
  trackingNo: string;
  note?: string;
}
Response: { shippingOrder: ShippingOrder }
```

---

## 4. 出价模块

### 4.1 出价列表页 `/pages/offer/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tab` | string | 否 | 默认 Tab (sent/received) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| Tab 切换 | Tabs | 我发出的/我收到的 |
| 出价列表 | List | 出价卡片 |
| 空状态 | Empty | 无出价时显示 |

#### 出价卡片信息

| 字段 | 说明 |
|------|------|
| 商品图片 | 商品缩略图 |
| 商品标题 | 商品名称 |
| 出价金额 | ¥xxx |
| 状态 | 待处理/已接受/已拒绝/已还价/已过期 |
| 时间 | 出价时间 |
| 操作按钮 | 根据状态显示 |

#### 交互流程

```
用户进入出价列表
    │
    ├─ 加载出价列表
    │   └─ GET /api/user/offers?type={tab}&page=1&limit=20
    │
    ├─ 切换 Tab
    │   └─ 重新加载对应类型出价
    │
    └─ 点击出价卡片
        └─ 跳转出价详情页
```

#### API 调用

```typescript
// 获取我的出价
GET /api/user/offers
Query: {
  type: 'sent' | 'received';
  status?: 'pending' | 'countered' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  page: number;
  limit: number;
}
Response: {
  offers: Array<{
    id: string;
    product: {
      id: string;
      title: string;
      image: string;
      price: number;
    };
    amount: number;
    counterPrice?: number;
    status: string;
    statusLabel: string;
    note?: string;
    createdAt: string;
    expiresAt: string;
    canAccept: boolean;
    canCounter: boolean;
    canReject: boolean;
    canWithdraw: boolean;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

### 4.2 出价详情页 `/pages/offer/detail`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 出价 ID |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 商品信息 | Card | 图片、标题、标价 |
| 出价信息 | Card | 出价金额、附言、状态 |
| 还价信息 | Card | 卖家还价金额 (如果有) |
| 操作按钮 | ButtonGroup | 根据状态和角色显示 |

#### 操作按钮逻辑

| 状态 | 买家操作 | 卖家操作 |
|------|---------|---------|
| pending | 撤回、再次出价 | 接受、还价、拒绝 |
| countered | 接受还价、拒绝还价、再次出价 | - |
| accepted | 查看订单 | 查看订单 |
| rejected | 再次出价 | - |
| withdrawn | - | - |
| expired | 再次出价 | - |

#### 交互流程

```
用户进入出价详情页
    │
    ├─ 加载出价详情
    │   └─ GET /api/offers/:id
    │
    ├─ 用户操作
    │   ├─ 接受出价 → POST /api/offers/:id/accept
    │   │   └─ 创建订单 → 跳转订单详情
    │   ├─ 还价 → 弹出还价面板
    │   │   ├─ 输入还价金额 (≤ 标价)
    │   │   ├─ 输入附言 (可选)
    │   │   └─ POST /api/offers/:id/counter { amount, note }
    │   ├─ 拒绝 → POST /api/offers/:id/reject { reason? }
    │   ├─ 撤回 → POST /api/offers/:id/withdraw
    │   └─ 接受还价 → POST /api/offers/:id/accept-counter
    │       └─ 创建订单 → 跳转订单详情
    │
    └─ 聊天入口
        └─ 跳转聊天页 (与卖家沟通)
```

#### API 调用

```typescript
// 获取出价详情
GET /api/offers/:id
Response: {
  offer: OfferDetail;
  product: Product;
  buyer: User;
  seller: User;
}

// 接受出价
POST /api/offers/:id/accept
Response: {
  order: Order;
}

// 还价
POST /api/offers/:id/counter
Request: { amount: number; note?: string }
Response: { offer: Offer }

// 拒绝
POST /api/offers/:id/reject
Request: { reason?: string }
Response: { success: boolean }

// 撤回
POST /api/offers/:id/withdraw
Response: { success: boolean }

// 接受还价
POST /api/offers/:id/accept-counter
Response: { order: Order }
```

---

## 5. 物流模块

### 5.1 物流追踪页 `/pages/logistics/track`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `orderId` | string | 是 | 订单 ID |
| `shippingOrderId` | string | 否 | 运单 ID |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 物流状态 | Header | 状态图标 + 文字 |
| 物流公司 | Text | 快递公司名称 |
| 运单号 | Text | 可复制 |
| 物流时间线 | Timeline | 物流轨迹列表 |

#### 交互流程

```
用户进入物流追踪页
    │
    ├─ 加载物流信息
    │   └─ GET /api/shipping/:orderId
    │
    └─ 显示物流时间线
        └─ 按时间倒序显示物流轨迹
```

#### API 调用

```typescript
// 获取物流信息
GET /api/shipping/:orderId
Response: {
  shippingOrder: {
    id: string;
    orderId: string;
    type: string;
    provider: {
      id: string;
      name: string;
      code: string;
    };
    trackingNo: string;
    status: string;
    statusLabel: string;
    tracks: Array<{
      status: string;
      location: string;
      message: string;
      createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### 5.2 地址管理页 `/pages/address/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `select` | string | 否 | 选择模式 (true 时选择地址后返回) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 地址列表 | List | 地址卡片 |
| 新增地址按钮 | Button | 跳转编辑页 |
| 空状态 | Empty | 无地址时显示 |

#### 地址卡片信息

| 字段 | 说明 |
|------|------|
| 收货人 | 姓名 + 手机号 |
| 详细地址 | 省市区 + 详细地址 |
| 默认标识 | 默认地址标签 |
| 操作 | 编辑/删除 |

#### 交互流程

```
用户进入地址管理页
    │
    ├─ 加载地址列表
    │   └─ GET /api/addresses
    │
    ├─ 选择模式 (从订单页进入)
    │   ├─ 点击地址卡片 → 返回上一页并携带地址 ID
    │   └─ 点击编辑 → 跳转编辑页
    │
    └─ 管理模式 (从个人中心进入)
        ├─ 点击编辑 → 跳转编辑页
        ├─ 点击删除 → 二次确认 → DELETE /api/addresses/:id
        └─ 点击新增 → 跳转编辑页
```

#### API 调用

```typescript
// 获取地址列表
GET /api/addresses
Response: {
  addresses: Array<{
    id: string;
    recipientName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    tag?: string;
    isDefault: boolean;
  }>;
}

// 删除地址
DELETE /api/addresses/:id
Response: { success: boolean }
```

---

### 5.3 编辑地址页 `/pages/address/edit`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 否 | 地址 ID (编辑时传入) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 收货人输入框 | Input | 必填 |
| 手机号输入框 | Input | 必填 |
| 省市区选择 | Picker | 联动选择器 |
| 详细地址输入框 | Input | 必填 |
| 标签选择 | TagGroup | 家/公司/学校 |
| 设为默认 | Switch | 默认关闭 |
| 保存按钮 | Button | 保存地址 |

#### 交互流程

```
用户进入编辑地址页
    │
    ├─ 编辑模式 (有 id 参数)
    │   └─ 加载地址信息 → GET /api/addresses/:id
    │
    ├─ 新增模式 (无 id 参数)
    │   └─ 显示空表单
    │
    ├─ 用户填写表单
    │   ├─ 收货人: 1-20 字符
    │   ├─ 手机号: 11 位数字
    │   ├─ 省市区: 三级联动选择
    │   └─ 详细地址: 5-100 字符
    │
    └─ 点击"保存"
        ├─ 表单校验
        ├─ POST /api/addresses (新增) 或 PUT /api/addresses/:id (编辑)
        │   ├─ 成功 → 返回地址列表
        │   └─ 失败 → 提示错误信息
        └─ 设为默认: isDefault = true
```

#### API 调用

```typescript
// 获取地址详情
GET /api/addresses/:id
Response: { address: Address }

// 创建地址
POST /api/addresses
Request: {
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  tag?: string;
  isDefault?: boolean;
}
Response: { address: Address }

// 更新地址
PUT /api/addresses/:id
Request: Partial<CreateAddressRequest>
Response: { address: Address }
```

---

## 6. 聊天模块

### 6.1 聊天列表页 `/pages/message/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 会话列表 | List | 会话卡片 |
| 空状态 | Empty | 无会话时显示 |

#### 会话卡片信息

| 字段 | 说明 |
|------|------|
| 对方头像 | 用户头像 |
| 对方昵称 | 用户名 |
| 最后一条消息 | 消息预览 |
| 时间 | 最后消息时间 |
| 未读数 | 红点/数字 |

#### 交互流程

```
用户进入聊天列表
    │
    ├─ 加载会话列表
    │   └─ GET /api/threads
    │
    ├─ WebSocket 连接
    │   └─ 接收新消息通知
    │
    └─ 点击会话卡片
        └─ 跳转聊天详情页
```

#### API 调用

```typescript
// 获取会话列表
GET /api/threads
Response: {
  threads: Array<{
    id: string;
    participant: {
      id: string;
      username: string;
      avatar: string;
    };
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    product?: {
      id: string;
      title: string;
      image: string;
    };
  }>;
}
```

---

### 6.2 聊天详情页 `/pages/message/chat`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `threadId` | string | 是 | 会话 ID |
| `userId` | string | 是 | 对方用户 ID |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 导航栏 | NavigationBar | 对方昵称 |
| 消息列表 | List | 聊天消息 |
| 输入区域 | InputBar | 文字输入 + 图片/商品按钮 |
| 商品卡片 | Card | 商品分享时显示 |

#### 消息类型

| 类型 | 内容 | 说明 |
|------|------|------|
| text | 文字消息 | 纯文本 |
| image | 图片消息 | 缩略图 + 点击预览 |
| product | 商品卡片 | 图片 + 标题 + 价格 |
| order | 订单卡片 | 状态 + 金额 |
| system | 系统消息 | 居中显示 |

#### 交互流程

```
用户进入聊天详情页
    │
    ├─ 加载历史消息
    │   └─ GET /api/threads/:id/messages?page=1&limit=50
    │
    ├─ WebSocket 连接
    │   ├─ 接收新消息
    │   ├─ 发送已读回执
    │   └─ 心跳检测 (30 秒)
    │
    ├─ 用户操作
    │   ├─ 发送文字消息
    │   │   ├─ WS: { type: 'message', content: string, threadId: string }
    │   │   └─ 本地立即显示 + 服务端确认
    │   ├─ 发送图片
    │   │   ├─ wx.chooseMedia (选择图片)
    │   │   ├─ 上传图片 → 获取 URL
    │   │   └─ WS: { type: 'message', content: imageUrl, messageType: 'image' }
    │   ├─ 分享商品
    │   │   ├─ 选择商品
    │   │   └─ WS: { type: 'message', content: productId, messageType: 'product' }
    │   └─ 点击商品卡片 → 跳转商品详情
    │
    └─ 屏蔽用户
        └─ POST /api/blocks { userId }
```

#### API 调用

```typescript
// 获取消息列表
GET /api/threads/:id/messages
Query: { page: number; limit: number }
Response: {
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'product' | 'order' | 'system';
    isRead: boolean;
    createdAt: string;
    product?: Product;
    order?: Order;
  }>;
  hasMore: boolean;
}

// WebSocket 消息格式
interface WSMessage {
  type: 'message' | 'read' | 'typing' | 'online';
  payload: {
    threadId: string;
    senderId: string;
    content?: string;
    messageType?: string;
    messageId?: string;
    timestamp: string;
  };
}
```

---

## 7. 社区模块

### 7.1 社区 Feed 页 `/pages/community/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tab` | string | 否 | 默认 Tab (recommend/trending/following) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| Tab 切换 | Tabs | 推荐/热门/关注 |
| 帖子列表 | List | 帖子卡片 |
| 发帖按钮 | FAB | 浮动按钮，跳转发帖页 |

#### 帖子卡片信息

| 字段 | 说明 |
|------|------|
| 用户信息 | 头像、昵称、达人徽章 |
| 帖子内容 | 文字 (最多 3 行) |
| 帖子图片 | 最多 3 张缩略图 |
| 商品卡片 | 关联商品时显示 |
| 互动数据 | 点赞数、评论数、浏览数 |
| 时间 | 发布时间 |

#### 交互流程

```
用户进入社区 Feed
    │
    ├─ 加载帖子列表
    │   └─ GET /api/posts?tab={tab}&page=1&limit=20
    │
    ├─ 切换 Tab
    │   └─ 重新加载对应类型帖子
    │
    ├─ 点击帖子卡片
    │   └─ 跳转帖子详情页
    │
    ├─ 点击发帖按钮
    │   └─ 跳转发帖页
    │
    └─ 上拉加载更多
        └─ GET /api/posts?tab={tab}&page={next}&limit=20
```

#### API 调用

```typescript
// 获取帖子列表
GET /api/posts
Query: {
  tab: 'recommend' | 'trending' | 'following';
  circleId?: string;
  page: number;
  limit: number;
}
Response: {
  posts: Array<{
    id: string;
    user: {
      id: string;
      username: string;
      avatar: string;
      isCreator: boolean;
      creatorType?: string;
    };
    content: string;
    images: string[];
    shareType: 'normal' | 'product_share' | 'order_showcase' | 'commission';
    product?: Product;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    isLiked: boolean;
    createdAt: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

### 7.2 帖子详情页 `/pages/community/post`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 帖子 ID |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 用户信息 | Card | 头像、昵称、达人徽章 |
| 帖子内容 | Text | 完整内容 |
| 帖子图片 | Grid | 图片预览 |
| 商品卡片 | Card | 关联商品 |
| 评论列表 | List | 评论内容 |
| 输入框 | InputBar | 发表评论 |

#### 交互流程

```
用户进入帖子详情页
    │
    ├─ 加载帖子详情
    │   └─ GET /api/posts/:id
    │
    ├─ 加载评论列表
    │   └─ GET /api/posts/:id/comments?page=1&limit=20
    │
    ├─ 用户操作
    │   ├─ 点赞 → POST /api/posts/:id/like
    │   ├─ 收藏 → POST /api/posts/:id/favorite
    │   ├─ 发表评论 → POST /api/posts/:id/comment { content }
    │   ├─ 回复评论 → POST /api/posts/:id/comment { content, parentId }
    │   └─ 分享 → onShareAppMessage
    │
    └─ 商品卡片点击
        └─ 跳转商品详情页
```

#### API 调用

```typescript
// 获取帖子详情
GET /api/posts/:id
Response: {
  post: PostDetail;
  isLiked: boolean;
  isFavorited: boolean;
}

// 获取评论列表
GET /api/posts/:id/comments
Query: { page: number; limit: number }
Response: {
  comments: Array<{
    id: string;
    user: {
      id: string;
      username: string;
      avatar: string;
    };
    content: string;
    likeCount: number;
    isLiked: boolean;
    parentId?: string;
    replyTo?: User;
    createdAt: string;
  }>;
  total: number;
  hasMore: boolean;
}

// 点赞
POST /api/posts/:id/like
Response: { isLiked: boolean; likeCount: number }

// 发表评论
POST /api/posts/:id/comment
Request: { content: string; parentId?: string }
Response: { comment: Comment }
```

---

### 7.3 发帖页 `/pages/community/create`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productId` | string | 否 | 关联商品 ID |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 内容输入框 | Textarea | 最多 500 字 |
| 图片选择 | Grid | 最多 9 张 |
| 关联商品 | Cell | 选择关联商品 |
| 选择圈子 | Cell | 选择发布圈子 |
| 发布按钮 | Button | 发布帖子 |

#### 交互流程

```
用户进入发帖页
    │
    ├─ 如果有 productId 参数
    │   └─ 自动关联商品
    │
    ├─ 用户编辑内容
    │   ├─ 输入文字 (最多 500 字)
    │   ├─ 选择图片 (最多 9 张)
    │   ├─ 关联商品 (可选)
    │   └─ 选择圈子 (可选)
    │
    └─ 点击"发布"
        ├─ 校验: 内容不能为空
        ├─ 上传图片 → 获取 URL 列表
        ├─ POST /api/posts {
        │     content, images, productId?, circleId?
        │   }
        │   ├─ 成功 → 返回社区 Feed
        │   └─ 失败 → 提示错误信息
        └─ 内容安全: DFA 敏感词过滤
```

#### API 调用

```typescript
// 创建帖子
POST /api/posts
Request: {
  content: string;
  images?: string[];
  productId?: string;
  circleId?: string;
  shareType?: 'normal' | 'product_share';
}
Response: { post: Post }
```

---

## 8. 营销模块

### 8.1 签到页 `/pages/checkin/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 连续签到天数 | Text | 大字显示 |
| 签到日历 | Grid | 本月签到记录 |
| 签到按钮 | Button | 签到/已签到 |
| 积分奖励说明 | Card | 签到规则 |

#### 交互流程

```
用户进入签到页
    │
    ├─ 加载签到信息
    │   └─ GET /api/check-in/status
    │
    ├─ 显示签到日历
    │   └─ 标记已签到日期
    │
    └─ 用户点击"签到"
        ├─ POST /api/check-in
        │   ├─ 成功 → 显示获得积分动画
        │   │   └─ +5 积分 (基础)
        │   │   └─ 连续签到额外奖励
        │   └─ 失败 → 提示错误信息
        └─ 并发控制: 乐观锁防止重复签到
```

#### API 调用

```typescript
// 获取签到状态
GET /api/check-in/status
Response: {
  isCheckedIn: boolean;
 连续Days: number;
  todayReward: number;
  monthCheckIns: string[]; // 已签到日期列表
}

// 签到
POST /api/check-in
Response: {
  points: number;
 连续Days: number;
  message: string;
}
```

---

### 8.2 积分中心页 `/pages/points/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 积分余额 | Text | 大字显示 |
| 积分明细 | List | 积分流水记录 |
| 积分商城入口 | Cell | 跳转积分商城 |
| 签到入口 | Cell | 跳转签到页 |

#### 交互流程

```
用户进入积分中心
    │
    ├─ 加载积分信息
    │   └─ GET /api/points/balance
    │
    ├─ 加载积分明细
    │   └─ GET /api/points/transactions?page=1&limit=20
    │
    └─ 上拉加载更多
        └─ GET /api/points/transactions?page={next}&limit=20
```

#### API 调用

```typescript
// 获取积分余额
GET /api/points/balance
Response: {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

// 获取积分明细
GET /api/points/transactions
Query: { page: number; limit: number }
Response: {
  transactions: Array<{
    id: string;
    type: 'earn' | 'redeem' | 'expire' | 'admin_adjust';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    source: string;
    referenceId?: string;
    note: string;
    createdAt: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

### 8.3 我的优惠券页 `/pages/coupon/index`

#### 页面参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tab` | string | 否 | 默认 Tab (active/used/expired) |

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| Tab 切换 | Tabs | 可用/已用/过期 |
| 优惠券列表 | List | 优惠券卡片 |
| 空状态 | Empty | 无优惠券时显示 |

#### 优惠券卡片信息

| 字段 | 说明 |
|------|------|
| 优惠券类型 | 满减/折扣/免邮 |
| 优惠金额 | ¥xx / x 折 |
| 使用门槛 | 满 xx 可用 |
| 有效期 | 截止日期 |
| 使用状态 | 可用/已用/过期 |

#### 交互流程

```
用户进入优惠券页
    │
    ├─ 加载优惠券列表
    │   └─ GET /api/coupons?status={tab}&page=1&limit=20
    │
    ├─ 切换 Tab
    │   └─ 重新加载对应状态优惠券
    │
    └─ 点击优惠券
        └─ 跳转商品列表 (可用优惠券的商品)
```

#### API 调用

```typescript
// 获取优惠券列表
GET /api/coupons
Query: {
  status: 'active' | 'used' | 'expired';
  page: number;
  limit: number;
}
Response: {
  coupons: Array<{
    id: string;
    template: {
      name: string;
      type: 'fixed_discount' | 'percentage_discount' | 'free_shipping';
      value: number;
      minAmount: number;
    };
    status: string;
    validFrom: string;
    validTo: string;
    usedAt?: string;
    orderId?: string;
    createdAt: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

### 8.4 邀请好友页 `/pages/referral/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 邀请码 | Text | 我的邀请码 + 复制按钮 |
| 邀请链接 | Text | 邀请链接 + 复制按钮 |
| 邀请人数 | Text | 已邀请人数 |
| 邀请奖励 | Card | 奖励规则说明 |
| 邀请排行榜 | List | 排行榜列表 |
| 生成海报 | Button | 生成邀请海报 |

#### 交互流程

```
用户进入邀请页
    │
    ├─ 加载邀请信息
    │   └─ GET /api/referral/code
    │
    ├─ 加载邀请排行榜
    │   └─ GET /api/referral/leaderboard
    │
    ├─ 用户操作
    │   ├─ 复制邀请码 → wx.setClipboardData
    │   ├─ 复制邀请链接 → wx.setClipboardData
    │   └─ 生成海报 → 调用海报生成 API
    │
    └─ 分享
        └─ onShareAppMessage
```

#### API 调用

```typescript
// 获取邀请码
GET /api/referral/code
Response: {
  code: string;
  link: string;
  usedCount: number;
  maxCount: number;
  isActive: boolean;
}

// 获取邀请排行榜
GET /api/referral/leaderboard
Response: {
  leaderboard: Array<{
    rank: number;
    user: {
      id: string;
      username: string;
      avatar: string;
    };
    inviteCount: number;
    completedCount: number;
  }>;
}

// 生成邀请海报
POST /api/referral/poster
Response: { posterUrl: string }
```

---

## 9. KYC 模块

### 9.1 实名认证页 `/pages/kyc/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 当前等级 | Card | L0/L1/L2/L3 等级展示 |
| 等级说明 | Card | 各等级权益说明 |
| 认证入口 | Button | 根据当前等级显示下一步认证 |

#### 交互流程

```
用户进入实名认证页
    │
    ├─ 加载认证状态
    │   └─ GET /api/kyc/status
    │
    ├─ 显示当前等级
    │   └─ L0: 未认证
    │   └─ L1: 手机已验证
    │   └─ L2: 身份已验证
    │   └─ L3: 活体验证
    │
    └─ 认证入口
        ├─ L0 → 跳转手机验证页
        ├─ L1 → 跳转身份证 OCR 页
        ├─ L2 → 跳转活体检测页
        └─ L3 → 显示"已认证"
```

#### API 调用

```typescript
// 获取认证状态
GET /api/kyc/status
Response: {
  currentTier: 'L0' | 'L1' | 'L2' | 'L3';
  phoneVerified: boolean;
  identityVerified: boolean;
  livenessVerified: boolean;
  nextStep: 'phone' | 'identity' | 'liveness' | null;
  pendingVerification?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
  };
}
```

---

### 9.2 手机验证页 `/pages/kyc/phone`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 手机号输入框 | Input | 已绑定手机号 |
| 获取验证码按钮 | Button | 倒计时 60 秒 |
| 验证码输入框 | Input | 6 位数字 |
| 验证按钮 | Button | 提交验证 |

#### 交互流程

```
用户进入手机验证页
    │
    ├─ 加载当前手机号
    │   └─ GET /api/user/profile
    │
    ├─ 用户点击"获取验证码"
    │   └─ POST /api/kyc/phone/send { phone }
    │
    ├─ 用户输入验证码
    │
    └─ 点击"验证"
        ├─ POST /api/kyc/phone/verify { phone, code }
        │   ├─ 成功 → 返回 KYC 首页，等级升至 L1
        │   └─ 失败 → 提示错误信息
        └─ 设备指纹: 同时采集设备指纹
```

#### API 调用

```typescript
// 发送验证码
POST /api/kyc/phone/send
Request: { phone: string }
Response: { success: boolean; cooldown: number }

// 验证手机
POST /api/kyc/phone/verify
Request: { phone: string; code: string; deviceFingerprint?: string }
Response: {
  success: boolean;
  newTier: 'L1';
  message: string;
}
```

---

### 9.3 身份证 OCR 页 `/pages/kyc/identity`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 身份证正面 | Image | 拍照/选择上传 |
| 身份证反面 | Image | 拍照/选择上传 |
| 姓名输入框 | Input | 从 OCR 结果自动填充 |
| 身份证号输入框 | Input | 从 OCR 结果自动填充 |
| 提交按钮 | Button | 提交认证 |

#### 交互流程

```
用户进入身份证 OCR 页
    │
    ├─ 用户点击身份证正面
    │   ├─ wx.chooseMedia (拍照/选择)
    │   ├─ 上传图片 → 获取 URL
    │   └─ POST /api/kyc/identity/ocr { imageUrl, side: 'front' }
    │       └─ 返回 { name, idNumber, expiryDate }
    │
    ├─ 用户点击身份证反面
    │   ├─ wx.chooseMedia (拍照/选择)
    │   ├─ 上传图片 → 获取 URL
    │   └─ POST /api/kyc/identity/ocr { imageUrl, side: 'back' }
    │       └─ 返回 { issueDate, expiryDate }
    │
    ├─ 自动填充表单
    │   └─ 姓名、身份证号从 OCR 结果填充
    │
    └─ 点击"提交"
        ├─ POST /api/kyc/identity/submit {
        │     frontImageUrl, backImageUrl, name, idNumber
        │   }
        │   ├─ 成功 → 返回 KYC 首页，等待审核
        │   └─ 失败 → 提示错误信息
        └─ 审核时间: 1-3 个工作日
```

#### API 调用

```typescript
// 身份证 OCR
POST /api/kyc/identity/ocr
Request: {
  imageUrl: string;
  side: 'front' | 'back';
}
Response: {
  name?: string;
  idNumber?: string;
  issueDate?: string;
  expiryDate?: string;
}

// 提交身份认证
POST /api/kyc/identity/submit
Request: {
  frontImageUrl: string;
  backImageUrl: string;
  name: string;
  idNumber: string;
}
Response: {
  success: boolean;
  verificationId: string;
  message: string;
}
```

---

### 9.4 活体检测页 `/pages/kyc/liveness`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 检测指引 | Text | 引导用户操作 |
| 摄像头预览 | Camera | 实时预览 |
| 开始按钮 | Button | 开始检测 |

#### 交互流程

```
用户进入活体检测页
    │
    ├─ 检查摄像头权限
    │   └─ wx.authorize { scope: 'scope.camera' }
    │
    ├─ 用户点击"开始检测"
    │   ├─ 显示检测指引 (眨眼/摇头/点头)
    │   ├─ POST /api/kyc/liveness/start
    │   │   └─ 返回 { challengeId, challenges: ['blink', 'nod'] }
    │   ├─ 录制视频 (3-5 秒)
    │   ├─ 上传视频 → 获取 URL
    │   └─ POST /api/kyc/liveness/submit {
        │     challengeId, videoUrl, challenges
        │   }
        │   ├─ 成功 → 返回 KYC 首页，等级升至 L3
        │   └─ 失败 → 提示重试
        └─ 检测失败次数: 最多 3 次
```

#### API 调用

```typescript
// 开始活体检测
POST /api/kyc/liveness/start
Response: {
  challengeId: string;
  challenges: Array<'blink' | 'nod' | 'shake' | 'open_mouth'>;
  timeout: number;
}

// 提交活体检测
POST /api/kyc/liveness/submit
Request: {
  challengeId: string;
  videoUrl: string;
  challenges: string[];
}
Response: {
  success: boolean;
  newTier: 'L3';
  message: string;
}
```

---

## 10. 个人中心模块

### 10.1 个人中心页 `/pages/profile/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 用户信息 | Card | 头像、昵称、信任分 |
| 数据统计 | Grid | 发布/收藏/关注/粉丝 |
| 快捷入口 | List | 我的发布/收藏/关注/钱包/设置 |
| 认证状态 | Cell | KYC 等级显示 |

#### 交互流程

```
用户进入个人中心
    │
    ├─ 加载用户信息
    │   └─ GET /api/user/profile
    │
    └─ 用户操作
        ├─ 点击头像 → 跳转编辑资料页
        ├─ 点击发布 → 跳转我的发布页
        ├─ 点击收藏 → 跳转我的收藏页
        ├─ 点击关注 → 跳转我的关注页
        ├─ 点击钱包 → 跳转钱包页
        ├─ 点击设置 → 跳转设置页
        └─ 点击认证 → 跳转 KYC 首页
```

#### API 调用

```typescript
// 获取用户信息
GET /api/user/profile
Response: {
  user: {
    id: string;
    username: string;
    avatar: string;
    phone: string;
    bio?: string;
    trustScore: number;
    currentKycTier: string;
    productCount: number;
    favoriteCount: number;
    followingCount: number;
    followerCount: number;
    isVerified: boolean;
    sellerLevel?: string;
    createdAt: string;
  };
}
```

---

### 10.2 钱包页 `/pages/wallet/index`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 可用余额 | Text | 大字显示 |
| 冻结金额 | Text | 托管中金额 |
| 提现按钮 | Button | 跳转提现页 |
| 交易明细入口 | Cell | 跳转交易明细页 |
| 绑定银行卡入口 | Cell | 跳转绑定银行卡页 |

#### 交互流程

```
用户进入钱包页
    │
    ├─ 加载钱包信息
    │   └─ GET /api/escrow/balance
    │
    └─ 用户操作
        ├─ 点击提现 → 跳转提现页
        ├─ 点击交易明细 → 跳转交易明细页
        └─ 点击绑定银行卡 → 跳转绑定银行卡页
```

#### API 调用

```typescript
// 获取钱包余额
GET /api/escrow/balance
Response: {
  heldBalance: number;
  availableBalance: number;
  withdrawnBalance: number;
  totalEarned: number;
}
```

---

### 10.3 提现页 `/pages/wallet/withdraw`

#### 页面参数

无

#### 页面元素

| 元素 | 类型 | 说明 |
|------|------|------|
| 可提现金额 | Text | 显示可提现余额 |
| 提现金额输入框 | Input | 输入提现金额 |
| 银行卡选择 | Cell | 选择提现银行卡 |
| 提现按钮 | Button | 确认提现 |

#### 交互流程

```
用户进入提现页
    │
    ├─ 加载可提现金额
    │   └─ GET /api/escrow/balance
    │
    ├─ 加载绑定的银行卡
    │   └─ GET /api/payment-accounts
    │
    ├─ 用户输入提现金额
    │   ├─ 校验: 不能超过可提现金额
    │   ├─ 校验: 最低提现金额 (如 10 元)
    │   └─ 校验: 最高提现金额 (如 5000 元)
    │
    └─ 点击"确认提现"
        ├─ POST /api/withdraw {
        │     amount, paymentAccountId
        │   }
        │   ├─ 成功 → 提示"提现申请已提交"
        │   └─ 失败 → 提示错误信息
        └─ 审核: 管理员审核后打款
```

#### API 调用

```typescript
// 获取绑定的银行卡
GET /api/payment-accounts
Response: {
  accounts: Array<{
    id: string;
    type: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    isVerified: boolean;
  }>;
}

// 发起提现
POST /api/withdraw
Request: {
  amount: number;
  paymentAccountId: string;
}
Response: {
  success: boolean;
  withdrawId: string;
  message: string;
}
```

---

*文档版本: v1.0*
*创建时间: 2026-06-07*
