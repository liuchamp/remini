# src/domains/AGENTS.md

## OVERVIEW

14 个 DDD 领域模块，每个自包含 api/store/types/utils，禁止跨 domain 引用 store。

## STRUCTURE

```
domains/
├── auth/         # 用户认证（含 utils.ts：Token 存取、权限判断）
├── user/         # 用户信息
├── product/      # 商品 CRUD、搜索
├── trade/        # 订单 + 出价(offer.ts) + 支付策略(payment/)
├── address/      # 地址管理
├── shipping/     # 物流查询（仅 api.ts）
├── wallet/       # 钱包、提现
├── chat/         # 即时通讯（底层 shared/websocket.ts）
├── community/    # 社区 Feed、帖子
├── notification/ # 通知中心
├── marketing/    # 签到、积分、优惠券
├── kyc/          # 实名认证
├── seller/       # 卖家中心
└── admin/        # 管理后台（仅 api.ts）
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 新增领域 | `domains/{module}/` | 创建 api.ts + store.ts + types.ts |
| 修改认证逻辑 | `domains/auth/store.ts` | useAuthStore：isLoggedIn/user/token |
| 修改支付 | `domains/trade/payment/` | 策略模式：payment.weapp/alipay/h5.ts |
| 修改出价 | `domains/trade/offer.ts` | 出价/议价 API |
| 修改 WebSocket | `shared/api/websocket.ts` | chat 领域依赖此模块 |

## CONVENTIONS

- **标准文件**：api.ts（API 调用）、store.ts（Zustand 状态）、types.ts（类型定义）、utils.ts（可选工具）
- **Store 导出**：`use{Module}Store` 命名（如 `useAuthStore`、`useProductStore`）
- **API 基础**：所有 API 调用基于 `shared/api/request.ts` 的 `http` 实例
- **类型共享**：跨模块类型通信通过 `shared/types/`，不直接引用其他 domain 的 types

## ANTI-PATTERNS

- ❌ 禁止 domain 之间直接 import 对方的 store
- ❌ 禁止在 domain 中引用 `pages/` 层代码
- ❌ 禁止跳过 `shared/api/request.ts` 直接调用 `Taro.request()`
