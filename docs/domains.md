# 领域模块说明

> 本项目采用 DDD 领域驱动设计，每个领域模块独立封装在 `src/domains/{module}/` 下。

## 模块总览

```
src/domains/
├── address/      # 地址管理
├── admin/        # 管理后台
├── auth/         # 用户认证
├── chat/         # 即时通讯
├── community/    # 社区社交
├── kyc/          # 实名认证 (KYC)
├── marketing/    # 营销工具
├── notification/ # 通知中心
├── product/      # 商品管理
├── seller/       # 卖家中心
├── shipping/     # 物流配送
├── trade/        # 交易订单 + 支付策略 + 出价
├── user/         # 用户信息
└── wallet/       # 钱包财务
```

> **注意：** `offer`（出价/议价）和 `payment`（支付策略）不是独立领域模块，而是 `trade/` 领域的子模块（`offer.ts`, `payment/` 目录）。

---

## 1. auth — 用户认证

| 文件 | 说明 |
|------|------|
| `api.ts` | 登录/注册/退出/Token 刷新 API |
| `store.ts` | 认证状态管理（isLoggedIn, user, token） |
| `types.ts` | 用户认证相关类型 |
| `utils.ts` | Token 存取、权限判断工具 |

**状态管理：** `useAuthStore`
- `isLoggedIn: boolean` — 是否已登录
- `user: User | null` — 当前用户信息
- `token: string | null` — 身份令牌
- `checkAuth()` — 启动时检查登录状态
- `login()` / `logout()` — 登录/退出

---

## 2. user — 用户信息

| 文件 | 说明 |
|------|------|
| `api.ts` | 用户信息 CRUD API |
| `store.ts` | 用户公开信息状态 |
| `types.ts` | 用户信息类型定义 |

---

## 3. product — 商品管理

| 文件 | 说明 |
|------|------|
| `api.ts` | 商品列表/详情/搜索/发布/编辑 API |
| `store.ts` | 商品列表、搜索结果、当前商品状态 |
| `types.ts` | 商品类型定义（Product, Category, SearchParams 等） |

---

## 4. trade — 交易订单

| 文件 | 说明 |
|------|------|
| `api.ts` | 订单 CRUD API |
| `offer.ts` | 出价/议价 API |
| `store.ts` | 订单列表/详情/出价状态管理 |
| `types.ts` | 订单/出价类型定义 |
| `payment/` | 支付策略（按平台隔离） |

---

## 5. address — 地址管理

| 文件 | 说明 |
|------|------|
| `api.ts` | 地址 CRUD API |
| `store.ts` | 地址列表、默认地址状态 |

---

## 6. shipping — 物流配送

| 文件 | 说明 |
|------|------|
| `api.ts` | 物流查询 API |

---

## 7. wallet — 钱包财务

| 文件 | 说明 |
|------|------|
| `api.ts` | 钱包余额/流水/提现 API |
| `store.ts` | 钱包信息、交易记录状态 |

---

## 8. chat — 即时通讯

| 文件 | 说明 |
|------|------|
| `api.ts` | 会话列表/历史消息 API |
| `store.ts` | 会话列表/未读数/当前会话状态 |

> 底层 WebSocket 连接由 `shared/api/websocket.ts` 管理。

---

## 9. community — 社区社交

| 文件 | 说明 |
|------|------|
| `api.ts` | Feed 流/帖子/评论/点赞/收藏 API |
| `store.ts` | Feed 列表、帖子详情状态 |
| `types.ts` | 社区帖子、圈子类型定义 |

---

## 10. notification — 通知中心

| 文件 | 说明 |
|------|------|
| `api.ts` | 通知列表/已读 API |
| `store.ts` | 通知列表/未读数状态 |
| `types.ts` | 通知类型定义（系统通知/交易通知/互动通知） |

---

## 11. marketing — 营销工具

| 文件 | 说明 |
|------|------|
| `api.ts` | 签到/积分/优惠券/邀请 API |
| `store.ts` | 积分/优惠券/签到状态 |
| `types.ts` | 营销相关类型定义 |

---

## 12. kyc — 实名认证

| 文件 | 说明 |
|------|------|
| `api.ts` | 手机验证/身份证 OCR/活体检测 API |
| `store.ts` | KYC 进度/状态管理 |
| `types.ts` | KYC 认证类型定义 |

---

## 13. seller — 卖家中心

| 文件 | 说明 |
|------|------|
| `api.ts` | 卖家数据/出价管理/商品管理 API |
| `store.ts` | 卖家统计数据、管控列表状态 |
| `types.ts` | 卖家相关类型定义 |

---

## 14. admin — 管理后台

| 文件 | 说明 |
|------|------|
| `api.ts` | 后台管理 API（用户管理、审核等） |

---

## 跨模块协作规则

1. **领域模块之间不直接引用**对方的 store，通过共享的 `shared/types/` 类型通信
2. **页面层**可组合多个领域模块的数据
3. **共享层（shared/）** 不依赖任何领域模块
4. **API 路径规划**：所有请求通过 `shared/api/request.ts` 的 `http` 实例发出，拦截器链统一处理 Token、签名、错误
