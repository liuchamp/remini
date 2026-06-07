# 项目架构说明

## 架构总览

本项目采用 **DDD（领域驱动设计）风格的分层架构**，结合 Taro 跨端框架的特性进行适配。

```
┌─────────────────────────────────────────────────┐
│                   Pages (视图层)                  │
│    pages/{module}/{page}/index.tsx              │
├─────────────────────────────────────────────────┤
│                Domains (领域层)                   │
│    domains/{module}/{store,api,types,utils}.ts   │
├─────────────────────────────────────────────────┤
│               Shared (共享层)                    │
│    shared/{components,hooks,utils,api,i18n,types} │
├─────────────────────────────────────────────────┤
│            Taro Framework (框架层)                │
│    @tarojs/taro, components, runtime             │
└─────────────────────────────────────────────────┘
```

## 目录结构与职责

### `src/domains/` — 领域模块

每个领域模块独立封装，包含自己的 API 调用、状态管理、类型定义和工具函数。

```
domains/{module}/
├── api.ts       → 领域 API 调用（基于 shared/api/request）
├── store.ts     → Zustand 状态管理
├── types.ts     → 领域相关类型定义（可选）
└── utils.ts     → 领域工具函数（可选）
```

**领域清单：**

| 领域 | 职责 | 关键依赖 |
|------|------|----------|
| `auth` | 用户认证、Token 管理 | auth store, types |
| `user` | 用户信息管理 | user store, types |
| `product` | 商品 CRUD、搜索 | product store, types |
| `trade` | 订单、支付、出价 | trade store, types, payment/ 策略 |
| `offer` | 议价管理 | — |
| `shipping` | 物流查询 | — |
| `address` | 地址管理 | address store |
| `wallet` | 钱包、提现 | wallet store |
| `chat` | 即时通讯 | chat store |
| `community` | 社区 Feed、帖子 | community store |
| `notification` | 通知中心 | notification store |
| `marketing` | 签到、积分、优惠券 | marketing store, types |
| `kyc` | 实名认证 | kyc store, types |
| `seller` | 卖家中心 | seller store, types |
| `admin` | 管理后台 | — |
| `payment` | 支付策略（支付宝/微信/H5） | — |

### `src/pages/` — 页面层

每个页面独立目录，包含页面组件、配置和样式。

```
pages/{module}/{page}/
├── index.tsx         → 页面组件
├── index.config.ts   → Taro 页面配置
└── index.scss        → 页面样式
```

### `src/shared/` — 共享层

| 目录 | 说明 |
|------|------|
| `api/` | HTTP 客户端 (HttpClient)、WebSocket 管理器 |
| `components/` | 公共 UI 组件（Avatar, Empty, Loading, Toast 等） |
| `hooks/` | 自定义 Hooks（useAuth, useCountDown, useDebounce 等） |
| `i18n/` | 国际化配置 + 中英双语资源文件 |
| `types/` | 全局类型定义 |
| `utils/` | 工具函数（format, platform, storage, validate） |
| `constants/` | 全局常量 |

### `src/styles/` — 全局样式

```
styles/
├── _index.scss           → 样式入口
├── variables.scss        → CSS 变量 / 主题色
├── mixins.scss           → Mixin 函数
├── reset.scss            → 样式重置
└── nutui-override.scss   → NutUI 组件样式覆盖
```

## 数据流

```
页面组件 (Page)
    │ useStore()
    ▼
Zustand Store (domain/store.ts)
    │ 调用 domain api
    ▼
Domain API (domain/api.ts)
    │ http.get/post/put/delete
    ▼
HttpClient (shared/api/request.ts)
    │ 拦截器链: token注入 → 平台签名 → token刷新 → 错误标准化
    ▼
Taro.request() → 后端 API
```

## 支付策略模式

`domains/trade/payment/` 目录使用策略模式，按平台隔离支付实现：

```
payment/
├── payment.weapp.ts   → 微信小程序支付
├── payment.alipay.ts  → 支付宝小程序支付
└── payment.h5.ts      → H5 支付
```

运行时会根据 `process.env.TARO_ENV` 自动选择对应策略。

## 实时通信架构

`shared/api/websocket.ts` 封装了完整的 WebSocket 管理器：

- 自动重连（指数退避，最多 5 次）
- 心跳保活（30s 间隔）
- 消息队列（断连时缓存待发消息）
- 降级轮询（重连失败后自动切换 HTTP 轮询，15s 间隔）
- 事件订阅模式（`wsManager.on('event', handler)`）

## 国际化架构

`shared/i18n/` 基于 i18next + react-i18next：

- 支持 `zh-CN` / `en-US` 双语言
- 按领域划分命名空间（common, auth, product, trade 等 8 个）
- 自动检测系统语言，支持用户手动切换（持久化到 Storage）
