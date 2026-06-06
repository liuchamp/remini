# REMX Mini App 变换方案

> 将 React Web 项目改造为微信小程序的完整规划文档

---

## 1. 项目概述

### 1.1 目标

将 REMX C2C 交易平台从 React Web 应用（React Router 7 + SSR）变换为微信小程序，保留核心业务能力，适配小程序生态限制和用户习惯。

### 1.2 技术选型对比

| 维度 | Web 端 | Mini App (微信小程序) |
|------|--------|---------------------|
| 框架 | React Router 7 | Taro 4 / uni-app |
| 语言 | TypeScript | TypeScript |
| 运行时 | Bun (SSR) | 微信小程序 VM |
| 状态管理 | React Context/Reducer | MobX / Zustand |
| UI 库 | Tailwind CSS | NutUI / Vant Weapp |
| 网络请求 | fetch/axios | wx.request / Taro.request |
| 实时通信 | WebSocket + SSE | WebSocket (受限) |
| 存储 | LocalStorage | wx.setStorageSync |
| 支付 | JSAPI (网页) | wx.requestPayment |
| 登录 | JWT + OAuth | wx.login + code2session |

### 1.3 推荐技术栈

| 组件 | 选型 | 理由 |
|------|------|------|
| **跨端框架** | Taro 4 | React 语法，TypeScript 支持好，生态成熟 |
| **状态管理** | Zustand | 轻量，支持小程序，无 Provider 包裹 |
| **UI 组件库** | NutUI (Taro 版) | 京东出品，组件丰富，适配 Taro |
| **请求封装** | Taro.request + 拦截器 | 统一 token 注入、错误处理 |
| **实时通信** | WebSocket (wx.connectSocket) | 小程序原生支持，但需处理重连 |
| **图片上传** | wx.chooseMedia + 云存储/RustFS | 小程序原生选图 |

---

## 2. 限界上下文与小程序功能映射

### 2.1 核心域 → 小程序页面

| 限界上下文 | Web 端模块 | 小程序页面 | 优先级 |
|-----------|-----------|-----------|--------|
| **交易域** | `features/orders/`, `features/escrow/` | 订单管理、支付、钱包 | P0 |
| **商品域** | `features/products/` | 商品浏览、发布、搜索 | P0 |

### 2.2 支撑域 → 小程序页面

| 限界上下文 | Web 端模块 | 小程序页面 | 优先级 |
|-----------|-----------|-----------|--------|
| **用户域** | `features/profile/` | 登录、注册、个人中心 | P0 |
| **物流域** | `features/logistics/` | 物流追踪、地址管理 | P1 |
| **财务域** | `features/finance/` | 钱包、提现 | P1 |
| **风控域** | `features/risk/` | 实名认证（KYC） | P1 |
| **推荐域** | `features/recommendations/` | 个性化推荐 | P2 |
| **营销工具域** | `features/marketing/` | 优惠券、积分、签到 | P2 |

### 2.3 通用域 → 小程序页面

| 限界上下文 | Web 端模块 | 小程序页面 | 优先级 |
|-----------|-----------|-----------|--------|
| **社区域** | `features/community/` | 社区 Feed、帖子、圈子 | P2 |
| **通讯域** | `features/chat/` | 即时通讯 | P1 |
| **通知域** | `features/notification/` | 消息中心 | P1 |

---

## 3. 页面架构设计

### 3.1 TabBar 导航结构（5 个 Tab）

```
┌─────────────────────────────────────────┐
│              Mini App                    │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│  首页   │  分类   │  发布   │  消息   │  我的   │
│  Home   │ Category│ Publish │ Message │ Profile │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 3.2 完整页面清单

#### 3.2.1 首页模块 (Home)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 首页 | `/pages/home/index` | 推荐商品、搜索入口、轮播图、分类快捷入口 | `routes/home.tsx` |
| 搜索结果 | `/pages/search/index` | 关键词搜索、筛选、排序 | `routes/products/` |
| 商品详情 | `/pages/product/detail` | 商品图片、价格、议价、卖家信息、出价 | `routes/products/` |
| 分类商品列表 | `/pages/category/list` | 按分类浏览商品 | `routes/home.tsx` |
| 附近商品 | `/pages/nearby/index` | LBS 附近商品地图/列表 | `routes/home.tsx` |

#### 3.2.2 分类模块 (Category)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 分类总览 | `/pages/category/index` | 一级分类网格 | `routes/home.tsx` |
| 二级分类 | `/pages/category/sub` | 二级分类列表 | `routes/home.tsx` |

#### 3.2.3 发布模块 (Publish)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 发布商品 | `/pages/publish/index` | 图片上传、表单填写、定价模式选择 | `routes/products/` |
| 发布成功 | `/pages/publish/success` | 发布确认、分享引导 | - |

#### 3.2.4 消息模块 (Message)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 消息列表 | `/pages/message/index` | 会话列表、未读数 | `routes/messages.tsx` |
| 聊天详情 | `/pages/message/chat` | 文字/图片消息、商品卡片、订单卡片 | `routes/messages.$id.tsx` |
| 通知中心 | `/pages/notification/index` | 系统通知、交易通知、营销通知 | `routes/notifications.tsx` |
| 通知详情 | `/pages/notification/detail` | 通知详情、跳转链接 | `routes/notifications/` |

#### 3.2.5 个人中心模块 (Profile)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 个人中心 | `/pages/profile/index` | 用户信息、信任分、快捷入口 | `routes/profile.tsx` |
| 编辑资料 | `/pages/profile/edit` | 修改头像、昵称、简介 | `routes/profile/` |
| 我的发布 | `/pages/profile/products` | 已发布商品管理 | `routes/profile/` |
| 我的收藏 | `/pages/profile/favorites` | 收藏商品列表 | `routes/profile/` |
| 我的关注 | `/pages/profile/follows` | 关注用户列表 | `routes/profile/` |
| 设置 | `/pages/profile/settings` | 通知偏好、隐私设置 | `routes/profile/` |

#### 3.2.6 交易模块 (Order)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 订单列表 | `/pages/order/index` | 全部/待付款/待发货/待收货/已完成 | `routes/orders.tsx` |
| 订单详情 | `/pages/order/detail` | 订单状态、物流、操作按钮 | `routes/orders.$id.tsx` |
| 创建订单 | `/pages/order/create` | 确认收货地址、优惠券、积分、备注 | `routes/orders.$id.tsx` |
| 支付 | `/pages/order/pay` | 微信支付、积分抵扣 | `routes/orders.$id.pay.tsx` |
| 支付结果 | `/pages/order/pay-success` | 支付成功、查看订单 | `routes/orders.$id.pay.success.tsx` |
| 申请退款 | `/pages/order/refund` | 退款原因、金额 | `routes/orders.$id.tsx` |
| 确认收货 | `/pages/order/confirm` | 确认收货操作 | `routes/orders.$id.tsx` |

#### 3.2.7 出价/议价模块 (Offer)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 出价列表 | `/pages/offer/index` | 我发出的/我收到的出价 | `routes/seller/` |
| 出价详情 | `/pages/offer/detail` | 出价信息、还价、接受/拒绝 | `routes/seller/` |
| 发起出价 | `/pages/offer/create` | 输入金额、附言 | `api.products.$id.offers.tsx` |

#### 3.2.8 物流模块 (Logistics)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 物流追踪 | `/pages/logistics/track` | 运单号、物流时间线 | `routes/orders.$id.tsx` |
| 地址管理 | `/pages/address/index` | 地址列表、新增/编辑/删除 | `routes/profile/` |
| 编辑地址 | `/pages/address/edit` | 地址表单、省市区选择器 | `routes/profile/` |

#### 3.2.9 钱包/财务模块 (Wallet)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 我的钱包 | `/pages/wallet/index` | 可用余额、冻结金额、提现按钮 | `routes/wallet.tsx` |
| 提现 | `/pages/wallet/withdraw` | 提现金额、银行卡选择 | `routes/wallet.tsx` |
| 交易明细 | `/pages/wallet/transactions` | 资金流水列表 | `routes/wallet.tsx` |
| 绑定银行卡 | `/pages/wallet/bindcard` | 银行卡信息填写 | `routes/profile/` |

#### 3.2.10 社区模块 (Community)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 社区 Feed | `/pages/community/index` | 帖子流、商品卡片 | `routes/community.tsx` |
| 帖子详情 | `/pages/community/post` | 帖子内容、评论、点赞 | `routes/community.posts.$id.tsx` |
| 发帖 | `/pages/community/create` | 图文编辑、关联商品 | `routes/community.new.tsx` |
| 圈子列表 | `/pages/community/circles` | 兴趣圈子 | `routes/community.circles.tsx` |
| 圈子详情 | `/pages/community/circle` | 圈子帖子列表 | `routes/community.circles.$id.tsx` |
| 创作者中心 | `/pages/creator/index` | 达人认证、佣金数据 | `routes/community.creator.*` |

#### 3.2.11 营销模块 (Marketing)

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 我的优惠券 | `/pages/coupon/index` | 可用/已用/过期优惠券 | `routes/check-in.tsx` |
| 积分中心 | `/pages/points/index` | 积分余额、签到、兑换 | `routes/check-in.tsx` |
| 签到 | `/pages/checkin/index` | 每日签到、连续签到 | `routes/check-in.tsx` |
| 积分商城 | `/pages/points/shop` | 积分兑换优惠券 | `routes/check-in.tsx` |
| 邀请好友 | `/pages/referral/index` | 邀请码、邀请链接、排行榜 | `routes/community.creator.*` |

#### 3.2.12 KYC/认证模块

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 实名认证 | `/pages/kyc/index` | L0-L3 等级展示、认证入口 | `routes/kyc.phone.tsx` |
| 手机验证 | `/pages/kyc/phone` | 手机号绑定、验证码 | `routes/kyc.phone.tsx` |
| 身份证 OCR | `/pages/kyc/identity` | 拍照上传身份证 | `routes/seller/` |
| 活体检测 | `/pages/kyc/liveness` | 人脸识别引导 | `routes/seller/` |

#### 3.2.13 用户相关模块

| 页面 | 路径 | 功能 | 对应 Web 路由 |
|------|------|------|-------------|
| 登录 | `/pages/auth/login` | 微信一键登录、手机号登录 | `routes/auth/` |
| 注册 | `/pages/auth/register` | 手机号注册、邀请码 | `routes/auth/` |
| 用户主页 | `/pages/user/profile` | 其他用户主页、商品、评价 | `routes/users.$id.tsx` |
| 评价详情 | `/pages/review/detail` | 评价内容、图片 | `routes/review.$orderId.$revieweeId.tsx` |
| 系统设置 | `/pages/settings/index` | 关于、隐私政策、退出登录 | `routes/profile/` |
| 离线提示 | `/pages/offline/index` | 网络异常提示 | `routes/offline.tsx` |

---

## 4. API 接口映射

### 4.1 接口复用策略

Web 端和小程序共享同一后端 API，只需在请求头中标识客户端类型：

```
X-Client-Type: miniapp
X-App-Version: 1.0.0
```

### 4.2 核心 API 模块映射

#### 4.2.1 用户认证 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `POST /api/auth/login` | `wx.login()` → `code2session` → JWT | 替换 OAuth 为微信登录 |
| `POST /api/auth/register` | 手机号 + 验证码 + 邀请码 | 无变更 |
| `POST /api/auth/refresh` | 相同 | 无变更 |
| `GET /api/user/profile` | 相同 | 无变更 |
| `PUT /api/user/profile` | 相同 | 头像改用 `wx.chooseMedia` |

#### 4.2.2 商品 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `GET /api/products` | 相同 | 无变更 |
| `GET /api/products/:id` | 相同 | 无变更 |
| `POST /api/products` | 相同 | 图片上传改用 `wx.chooseMedia` |
| `PUT /api/products/:id` | 相同 | 无变更 |
| `DELETE /api/products/:id` | 相同 | 无变更 |
| `GET /api/products/search` | 相同 | 无变更 |
| `GET /api/recommendations/home` | 相同 | 无变更 |
| `GET /api/recommendations/nearby` | 相同 | 需授权 `wx.getLocation` |

#### 4.2.3 订单 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `POST /api/orders` | 相同 | 无变更 |
| `GET /api/orders` | 相同 | 无变更 |
| `GET /api/orders/:id` | 相同 | 无变更 |
| `POST /api/orders/:id/pay` | `wx.requestPayment` | 替换 JSAPI 支付 |
| `POST /api/orders/:id/confirm` | 相同 | 无变更 |
| `POST /api/orders/:id/refund` | 相同 | 无变更 |

#### 4.2.4 出价 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `POST /api/products/:id/offers` | 相同 | 无变更 |
| `GET /api/user/offers` | 相同 | 无变更 |
| `POST /api/offers/:id/accept` | 相同 | 无变更 |
| `POST /api/offers/:id/counter` | 相同 | 无变更 |
| `POST /api/offers/:id/reject` | 相同 | 无变更 |
| `POST /api/offers/:id/withdraw` | 相同 | 无变更 |

#### 4.2.5 物流 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `GET /api/shipping/:orderId` | 相同 | 无变更 |
| `POST /api/shipping` | 相同 | 无变更 |
| `GET /api/addresses` | 相同 | 无变更 |
| `POST /api/addresses` | 相同 | 无变更 |
| `PUT /api/addresses/:id` | 相同 | 无变更 |
| `DELETE /api/addresses/:id` | 相同 | 无变更 |

#### 4.2.6 社区 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `GET /api/posts` | 相同 | 无变更 |
| `POST /api/posts` | 相同 | 图片改用 `wx.chooseMedia` |
| `POST /api/posts/:id/like` | 相同 | 无变更 |
| `POST /api/posts/:id/comment` | 相同 | 无变更 |
| `GET /api/circles` | 相同 | 无变更 |

#### 4.2.7 聊天 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| WebSocket 连接 | `wx.connectSocket` | 原生 WebSocket |
| `GET /api/threads` | 相同 | 无变更 |
| `GET /api/threads/:id/messages` | 相同 | 无变更 |
| 图片发送 | `wx.chooseMedia` + 上传 | 替换 Web File API |

#### 4.2.8 营销 API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `GET /api/coupons` | 相同 | 无变更 |
| `POST /api/coupons/claim` | 相同 | 无变更 |
| `GET /api/points` | 相同 | 无变更 |
| `POST /api/check-in` | 相同 | 无变更 |
| `GET /api/referral/code` | 相同 | 无变更 |

#### 4.2.9 KYC API

| Web 端 API | 小程序调用方式 | 变更 |
|-----------|--------------|------|
| `POST /api/kyc/phone/send` | 相同 | 无变更 |
| `POST /api/kyc/phone/verify` | 相同 | 无变更 |
| `POST /api/kyc/identity/ocr` | 相同 | 图片改用 `wx.chooseMedia` |
| `POST /api/kyc/liveness/start` | 相同 | 需引导用户授权摄像头 |
| `POST /api/kyc/liveness/submit` | 相同 | 无变更 |

---

## 5. 数据流与状态管理

### 5.1 状态管理架构

```
┌─────────────────────────────────────────────┐
│                 Mini App                     │
├─────────────────────────────────────────────┤
│  Page Layer (Taro Pages)                    │
│    ↓ props/events                           │
│  Store Layer (Zustand)                      │
│    ├─ authStore    (登录态、用户信息)        │
│    ├─ productStore (商品列表、搜索)          │
│    ├─ orderStore   (订单状态)               │
│    ├─ cartStore    (购物车 - 可选)           │
│    ├─ chatStore    (聊天消息)               │
│    └─ uiStore      (全局 UI 状态)           │
├─────────────────────────────────────────────┤
│  Service Layer (API 封装)                    │
│    ├─ request.ts   (统一请求拦截器)          │
│    ├─ token.ts     (Token 管理)             │
│    └─ socket.ts    (WebSocket 管理)         │
└─────────────────────────────────────────────┘
```

### 5.2 Token 管理流程

```
用户打开小程序
    │
    ├─ 本地有 Token?
    │   ├─ 是 → 验证 Token 有效性 → 有效则直接进入
    │   │       └─ 无效 → 刷新 Token → 刷新失败 → 重新登录
    │   └─ 否 → 显示登录页
    │
    ├─ 微信登录流程
    │   ├─ wx.login() → 获取 code
    │   ├─ POST /api/auth/wechat-login { code }
    │   │   ├─ 已绑定用户 → 返回 JWT (access + refresh)
    │   │   └─ 未绑定用户 → 返回临时 token + 绑定手机号引导
    │   └─ 存储 Token 到 Storage
    │
    └─ Token 刷新
        ├─ 请求 401 → 用 refresh_token 刷新
        ├─ 刷新成功 → 重试原请求
        └─ 刷新失败 → 清除 Token → 跳转登录页
```

### 5.3 请求拦截器设计

```typescript
// request.ts 伪代码
const request = async (options) => {
  // 1. 注入 Token
  const token = getToken();
  if (token) {
    options.header['Authorization'] = `Bearer ${token}`;
  }

  // 2. 注入客户端标识
  options.header['X-Client-Type'] = 'miniapp';

  // 3. 发起请求
  try {
    const res = await Taro.request(options);
    
    // 4. 处理 401 → 刷新 Token
    if (res.statusCode === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        return Taro.request({ ...options, header: { ...options.header, Authorization: `Bearer ${newToken}` } });
      } else {
        redirectToLogin();
        return Promise.reject('Token expired');
      }
    }
    
    return res.data;
  } catch (err) {
    // 5. 网络异常处理
    Taro.showToast({ title: '网络异常', icon: 'none' });
    return Promise.reject(err);
  }
};
```

---

## 6. 支付集成方案

### 6.1 微信支付流程

```
买家点击"立即购买"
    │
    ├─ 创建订单 (POST /api/orders)
    │   └─ 返回 { orderId, totalAmount, discountAmount, ... }
    │
    ├─ 选择优惠券/积分抵扣 (可选)
    │   └─ POST /api/orders/:id/coupon 或 /points
    │
    ├─ 发起支付 (POST /api/orders/:id/pay)
    │   └─ 后端调用微信支付统一下单 API
    │       └─ 返回 { timeStamp, nonceStr, package, signType, paySign }
    │
    ├─ 调用 wx.requestPayment
    │   ├─ 成功 → 跳转支付成功页
    │   └─ 失败 → 显示失败提示，可重试
    │
    └─ 支付回调
        └─ 后端接收微信支付回调 → 更新订单状态 → 创建托管记录
```

### 6.2 退款流程

```
买家申请退款
    │
    ├─ 提交退款申请 (POST /api/orders/:id/refund)
    │   └─ { reason, amount, description }
    │
    ├─ 管理员审核 (后台)
    │   ├─ 通过 → 后端调用微信退款 API
    │   └─ 拒绝 → 通知买家
    │
    └─ 退款到账
        └─ 微信支付回调 → 更新订单状态 → 释放托管资金
```

---

## 7. 实时通信方案

### 7.1 WebSocket 管理

```typescript
// socket.ts 伪代码
class WSService {
  private socket: SocketTask | null = null;
  private reconnectTimer: number | null = null;
  private reconnectCount = 0;
  private maxReconnect = 5;

  connect(token: string) {
    this.socket = Taro.connectSocket({
      url: `${WS_URL}?token=${token}`,
      success: () => {
        this.reconnectCount = 0;
      }
    });

    this.socket.onMessage((res) => {
      const data = JSON.parse(res.data);
      this.handleMessage(data);
    });

    this.socket.onClose(() => {
      this.attemptReconnect();
    });

    this.socket.onError(() => {
      this.attemptReconnect();
    });
  }

  attemptReconnect() {
    if (this.reconnectCount < this.maxReconnect) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectCount++;
        this.connect(getToken());
      }, Math.min(1000 * Math.pow(2, this.reconnectCount), 30000));
    }
  }

  send(data: any) {
    if (this.socket) {
      this.socket.send({ data: JSON.stringify(data) });
    }
  }

  handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        chatStore.addMessage(data.payload);
        break;
      case 'notification':
        notificationStore.addNotification(data.payload);
        break;
      case 'order_status':
        orderStore.updateOrderStatus(data.payload);
        break;
    }
  }
}
```

### 7.2 消息轮询降级

小程序 WebSocket 连接不稳定时，降级为轮询：

```
WebSocket 连接成功?
    ├─ 是 → 使用 WebSocket 实时推送
    └─ 否 → 降级为轮询
        ├─ 未读消息数: 每 30 秒轮询一次
        ├─ 订单状态: 每 60 秒轮询一次
        └─ 通知: 每 60 秒轮询一次
```

---

## 8. 图片与文件处理

### 8.1 图片上传流程

```
用户点击上传图片
    │
    ├─ wx.chooseMedia (选择图片/拍照)
    │   ├─ 最多 9 张
    │   ├─ 压缩: 选择 medium quality
    │   └─ 返回临时文件路径
    │
    ├─ 压缩图片 (可选)
    │   └─ wx.compressImage → 降低分辨率
    │
    ├─ 上传到 RustFS
    │   ├─ 获取上传凭证 (POST /api/upload/policy)
    │   ├─ 拼接上传 URL
    │   ├─ wx.uploadFile → 上传到 OSS
    │   └─ 返回图片 URL
    │
    └─ 回显图片
        └─ 使用 OSS URL 显示
```

### 8.2 商品图片规格

| 类型 | 尺寸 | 质量 | 数量 |
|------|------|------|------|
| 商品主图 | 750x750 | 80% | 1-9 张 |
| 商品详情 | 宽 750 | 80% | 不限 |
| 头像 | 200x200 | 85% | 1 张 |
| 帖子图片 | 750x750 | 80% | 1-9 张 |

---

## 9. 分享与传播

### 9.1 小程序分享能力

| 分享场景 | 分享方式 | 参数 | 对应功能 |
|---------|---------|------|---------|
| 商品分享 | 转发给好友 | `productId`, `fromUserId` | 商品详情页 |
| 帖子分享 | 转发给好友 | `postId` | 帖子详情页 |
| 邀请分享 | 生成邀请码图片 | `referralCode`, `userId` | 邀请好友 |
| 朋友圈分享 | 生成海报图片 | 商品信息 + 二维码 | 商品推广 |

### 9.2 分享参数传递

```typescript
// 商品分享
Page({
  onShareAppMessage() {
    const product = this.data.product;
    return {
      title: product.title,
      path: `/pages/product/detail?id=${product.id}&from=${getUserId()}`,
      imageUrl: product.images[0]
    };
  }
});

// 接收分享参数
App({
  onLaunch(options) {
    if (options.query.from) {
      // 记录分享来源
      recordShareSource(options.query.from);
    }
  }
});
```

---

## 10. 实施路线图

### Phase 1: 基础框架 (2 周)

| 任务 | 说明 | 交付物 |
|------|------|--------|
| 项目初始化 | Taro 4 + TypeScript + NutUI 配置 | 可运行的空项目 |
| 请求封装 | Token 管理、拦截器、错误处理 | `request.ts`、`token.ts` |
| 登录模块 | 微信一键登录 + 手机号登录 | 登录页、注册页 |
| TabBar 导航 | 5 个 Tab 页面框架 | 首页/分类/发布/消息/我的 |
| 全局状态 | Zustand store 配置 | authStore、uiStore |

### Phase 2: 核心交易 (3 周)

| 任务 | 说明 | 交付物 |
|------|------|--------|
| 商品列表 | 首页推荐、分类列表、搜索 | 首页、分类页、搜索页 |
| 商品详情 | 图片轮播、价格、议价标识 | 商品详情页 |
| 搜索功能 | 关键词搜索、筛选、排序 | 搜索结果页 |
| 下单流程 | 确认订单、选择地址、优惠券 | 创建订单页 |
| 微信支付 | 统一下单、wx.requestPayment | 支付页、支付结果页 |
| 订单管理 | 订单列表、状态筛选 | 订单列表页、订单详情页 |
| 议价功能 | 出价、还价、接受/拒绝 | 出价相关页面 |

### Phase 3: 物流与财务 (2 周)

| 任务 | 说明 | 交付物 |
|------|------|--------|
| 地址管理 | 增删改查、省市区选择器 | 地址管理页面 |
| 物流追踪 | 运单状态、时间线 | 物流追踪页 |
| 发货功能 | 选择物流商、输入运单号 | 卖家发货流程 |
| 钱包 | 余额查询、交易明细 | 钱包页面 |
| 提现 | 提现申请、银行卡管理 | 提现页面 |

### Phase 4: 社交与通讯 (2 周)

| 任务 | 说明 | 交付物 |
|------|------|--------|
| WebSocket | 连接管理、重连机制 | `socket.ts` |
| 聊天功能 | 文字/图片消息、商品卡片 | 聊天页面 |
| 消息列表 | 会话列表、未读数 | 消息列表页 |
| 通知中心 | 系统/交易/营销通知 | 通知页面 |
| 社区 Feed | 帖子列表、商品卡片 | 社区首页 |
| 帖子详情 | 内容、评论、点赞 | 帖子详情页 |

### Phase 5: 营销与 KYC (2 周)

| 任务 | 说明 | 交付物 |
|------|------|--------|
| 签到 | 每日签到、积分奖励 | 签到页面 |
| 积分中心 | 积分余额、兑换 | 积分页面 |
| 优惠券 | 领取、使用、列表 | 优惠券页面 |
| 邀请裂变 | 邀请码、海报生成 | 邀请页面 |
| 手机验证 | 短信验证码 | KYC 手机验证页 |
| 实名认证 | 身份证 OCR、活体检测 | KYC 认证页面 |

### Phase 6: 优化与上线 (1 周)

| 任务 | 说明 | 交付物 |
|------|------|--------|
| 性能优化 | 图片懒加载、分包加载 | 优化后的代码 |
| 体验优化 | 加载骨架屏、空状态、错误页 | UI 细节完善 |
| 分享功能 | 转发、海报生成 | 分享相关功能 |
| 数据埋点 | 关键行为埋点 | 埋点 SDK |
| 提审上线 | 微信小程序提审 | 上线版本 |

---

## 11. 分包策略

为了减小主包体积（< 2MB），采用分包加载：

```
主包 (Main Package)
├── pages/home/          # 首页
├── pages/category/      # 分类
├── pages/publish/       # 发布
├── pages/message/       # 消息
├── pages/profile/       # 个人中心
├── pages/auth/          # 登录注册
└── components/          # 公共组件

分包 A - 交易 (order)
├── pages/order/         # 订单相关
├── pages/logistics/     # 物流相关
└── pages/wallet/        # 钱包相关

分包 B - 社区 (community)
├── pages/community/     # 社区相关
├── pages/creator/       # 创作者中心
└── pages/review/        # 评价相关

分包 C - 营销 (marketing)
├── pages/coupon/        # 优惠券
├── pages/points/        # 积分
├── pages/checkin/       # 签到
└── pages/referral/      # 邀请

分包 D - 认证 (kyc)
├── pages/kyc/           # KYC 认证
└── pages/settings/      # 设置
```

---

## 12. 项目目录结构

```
remx-miniapp/
├── src/
│   ├── app.ts                 # 小程序入口
│   ├── app.config.ts          # 全局配置
│   ├── app.scss               # 全局样式
│   ├── pages/
│   │   ├── home/              # 首页
│   │   ├── category/          # 分类
│   │   ├── publish/           # 发布
│   │   ├── message/           # 消息
│   │   ├── profile/           # 个人中心
│   │   ├── product/           # 商品
│   │   ├── order/             # 订单
│   │   ├── offer/             # 出价
│   │   ├── logistics/         # 物流
│   │   ├── wallet/            # 钱包
│   │   ├── community/         # 社区
│   │   ├── coupon/            # 优惠券
│   │   ├── points/            # 积分
│   │   ├── checkin/           # 签到
│   │   ├── referral/          # 邀请
│   │   ├── kyc/               # KYC
│   │   ├── auth/              # 认证
│   │   ├── notification/      # 通知
│   │   ├── address/           # 地址
│   │   ├── user/              # 用户
│   │   ├── review/            # 评价
│   │   ├── settings/          # 设置
│   │   └── offline/           # 离线
│   ├── components/
│   │   ├── ui/                # 基础 UI 组件
│   │   ├── product/           # 商品相关组件
│   │   ├── order/             # 订单相关组件
│   │   ├── chat/              # 聊天相关组件
│   │   ├── community/         # 社区相关组件
│   │   └── common/            # 公共组件
│   ├── stores/                # Zustand 状态管理
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── chat.ts
│   │   └── ui.ts
│   ├── services/              # API 服务封装
│   │   ├── request.ts
│   │   ├── token.ts
│   │   ├── socket.ts
│   │   ├── upload.ts
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── offer.ts
│   │   ├── logistics.ts
│   │   ├── wallet.ts
│   │   ├── community.ts
│   │   ├── chat.ts
│   │   ├── coupon.ts
│   │   ├── points.ts
│   │   ├── kyc.ts
│   │   └── notification.ts
│   ├── utils/
│   │   ├── format.ts          # 格式化工具
│   │   ├── validator.ts       # 表单验证
│   │   ├── storage.ts         # 本地存储封装
│   │   ├── platform.ts        # 平台判断
│   │   └── share.ts           # 分享工具
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useRequest.ts
│   │   ├── useSocket.ts
│   │   └── usePage.ts
│   ├── styles/
│   │   ├── variables.scss     # 全局变量
│   │   ├── mixins.scss        # 公共 mixins
│   │   └── common.scss        # 公共样式
│   └── assets/
│       ├── icons/
│       └── images/
├── config/
│   ├── dev.ts                 # 开发环境配置
│   └── prod.ts                # 生产环境配置
├── project.config.json        # 微信小程序配置
├── package.json
└── tsconfig.json
```

---

## 13. 与 Web 端差异清单

| 功能 | Web 端 | 小程序端 | 处理方式 |
|------|--------|---------|---------|
| 登录方式 | JWT + OAuth (微信/支付宝/Google) | 微信一键登录 + 手机号 | 替换为 `wx.login` + `code2session` |
| 支付方式 | JSAPI 支付 | `wx.requestPayment` | 使用微信支付 SDK |
| 图片上传 | HTML File Input | `wx.chooseMedia` | 使用原生 API |
| WebSocket | 浏览器原生 | `wx.connectSocket` | 使用原生 API |
| SSE 推送 | EventSource | 不支持 | 改为轮询或 WebSocket |
| 地理定位 | Navigator.geolocation | `wx.getLocation` | 需授权 |
| 分享 | Web Share API | `onShareAppMessage` | 使用原生 API |
| 推送通知 | Notification API | 订阅消息 | 使用微信订阅消息 |
| 本地存储 | LocalStorage (10MB) | Storage (10MB) | 类似，API 不同 |
| 路由 | React Router | Taro Router | 使用 Taro 路由 |
| 页面栈 | SPA (无限) | 最多 10 层 | 注意页面栈管理 |
| 下拉刷新 | 自定义 | `enablePullDownRefresh` | 使用原生 API |
| 上拉加载 | 自定义 | `onReachBottom` | 使用原生 API |

---

## 14. 注意事项与风险

### 14.1 小程序限制

| 限制项 | 说明 | 应对策略 |
|--------|------|---------|
| 主包大小 | < 2MB | 分包加载、图片 CDN |
| 总包大小 | < 20MB | 分包加载 |
| 页面栈 | 最多 10 层 | 使用 `redirectTo` 替代 `navigateTo` |
| Storage | 同步 API | 大数据异步处理 |
| WebSocket | 单连接 | 复用连接、消息合并 |
| 网络请求 | 10 个并发 | 请求队列、优先级管理 |
| 图片大小 | 单张 < 10MB | 压缩后上传 |

### 14.2 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 微信审核不通过 | 上线延迟 | 提前了解审核规范，准备备选方案 |
| 支付资质 | 无法接入支付 | 提前申请微信支付商户号 |
| 实名认证 | KYC 流程复杂 | 简化认证流程，分阶段上线 |
| 性能问题 | 卡顿、闪退 | 性能监控、分包优化 |
| 数据同步 | Web/小程序数据不一致 | 共享后端 API，数据实时同步 |

---

## 15. 总结

本方案将 REMX C2C 交易平台从 React Web 应用完整变换为微信小程序，核心要点：

1. **技术栈**: Taro 4 + TypeScript + Zustand + NutUI
2. **页面**: 40+ 页面，覆盖所有核心业务场景
3. **API**: 共享后端，仅需适配登录/支付/图片上传等平台差异
4. **实时通信**: WebSocket + 轮询降级
5. **分享**: 微信原生分享能力
6. **实施**: 6 个阶段，约 12 周完成

---

*文档版本: v1.0*  
*创建时间: 2026-06-07*
