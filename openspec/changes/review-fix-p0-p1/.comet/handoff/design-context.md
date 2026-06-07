# Comet Design Handoff

- Change: review-fix-p0-p1
- Phase: design
- Mode: compact
- Context hash: 271054088cd989419ca2af9e0169a0bd1be62157e0135b8ed50f28fb7f24f4b2

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/review-fix-p0-p1/proposal.md

- Source: openspec/changes/review-fix-p0-p1/proposal.md
- Lines: 1-26
- SHA256: a5ddb3e93427499c8be36641c8a5cf33102108d639be0c167a3b7ebd62e0d741

```md
# 修复完整性评审报告 P0 & P1 缺口

## 问题背景
在最近的《REMX Mini-App 功能完整性评审报告 (2026-06-08)》中，发现了一些严重的安全合规缺口（P0）和核心功能缺口（P1）。
为了保证应用的基础安全合规和核心出价交易流程的闭环，需要优先修复这些问题。

## 目标
- 修复 P0 级安全合规缺口：实现提现上限的动态读取、风控挑战（2FA）前端流程、支付拦截 UI。
- 修复 P1 级核心功能缺口：完善出价详情页操作、商品发布页定价模式选择、商品详情页出价入口。
- （可选/视工作量而定）补充管理后台的数据图表。

## 范围
**In Scope:**
- `pages/wallet/withdraw/index.tsx`：提现上限逻辑修改，增加 KYC 升级引导。
- 新增 `pages/auth/challenge/index.tsx` (或类似路由) 用于 2FA 验证流程。
- `pages/order/pay/index.tsx`：处理支付被风控拦截/要求挑战的响应。
- `pages/offer/detail/index.tsx`：增加买卖双方的交互按钮（接受、拒绝、还价、再次出价）。
- `pages/publish/index.tsx` 及 `pages/product/edit/index.tsx`：增加定价模式（一口价/可议价）选择。
- `pages/product/detail/index.tsx`：增加可议价标识和出价按钮入口。

**Out of Scope:**
- P2 体验缺口（聊天发图、积分即将过期通知等）。
- 后端服务的修改（目前假设后端 API 已按 Spec 实现，主要修复前端）。

## 非目标
- 不进行设计系统的重构（Tailwind v4 相关）。
```

## openspec/changes/review-fix-p0-p1/design.md

- Source: openspec/changes/review-fix-p0-p1/design.md
- Lines: 1-23
- SHA256: 2d8529d25243ba28ae134d92efd1c20fa99efb68f82bcde3217f7b44d24c13da

```md
# 技术设计 (Design)

## 高层架构决策

本变更主要集中在前端表现层，以对接现有的业务 API 响应：

1.  **提现上限动态获取**:
    *   在 `walletApi.getBalance` 响应中，或者调用 `kycApi.getStatus()` 获取 `currentTier`。
    *   使用 `kyc-tier-system/spec.md` 中定义的限额映射，提现页面动态计算上限（如 L2 为 5000，L3 为 50000）。

2.  **2FA & 风控挑战流程**:
    *   在全网统一的拦截器中（或支付、提现操作中），识别特定的错误码（如 `RISK_CHALLENGE`）。
    *   增加一个独立的页面 `/pages/auth/challenge/index` 处理 SMS / TOTP 验证。成功后再恢复原操作。
    *   支付页识别 `RISK_BLOCK`，展示对应的错误提示 UI。

3.  **议价交易流补全**:
    *   **商品发布/编辑**: 在表单中增加 Switch 或 Picker 用于选择定价模式 (`pricingMode: 'fixed' | 'negotiable'`)。
    *   **商品详情**: 根据 `pricingMode` 字段渲染 UI 差异。
    *   **出价详情**: 根据 `offer.status` 和当前用户角色 (`buyerId` vs `sellerId`)，渲染对应的按钮组，调用 `offerApi` 的对应方法。

## 方案选型与数据流
- **状态流转**: `Offer` 的状态更新后，通过重新请求 `offerApi.getDetail` 刷新视图。
- **2FA 触发**: 由服务端 API 返回 HTTP 412 或业务错误码触发，前端捕获后路由跳转至 challenge 页面，带上需要重试的 `action_token` 或订单 ID 等上下文。
```

## openspec/changes/review-fix-p0-p1/tasks.md

- Source: openspec/changes/review-fix-p0-p1/tasks.md
- Lines: 1-16
- SHA256: 4576cff7c983d04bf0831445b93e87d26b72b2ce651bf0035b5474c51a25428a

```md
- [ ] **Task 1: 修复提现上限逻辑 (P0)**
  - 修改 `pages/wallet/withdraw/index.tsx`。
  - 获取当前用户的 KYC Tier，根据 Tier 计算 `maxWithdraw`。
  - 在 L1 用户尝试提现（或不满足条件时）提供升级 KYC 的引导 UI。
- [ ] **Task 2: 实现风控挑战与支付拦截 UI (P0)**
  - 创建 `pages/auth/challenge/index.tsx` 用于输入短信验证码/TOTP。
  - 修改 `pages/order/pay/index.tsx`，处理支付 API 返回的 challenge 和 block 错误。
  - 拦截支付并引导至 Challenge 页面。
- [ ] **Task 3: 完善商品发布与详情页的出价入口 (P1)**
  - 在 `pages/publish/index.tsx` 和 `pages/product/edit/index.tsx` 中增加"定价模式"表单项。
  - 在 `pages/product/detail/index.tsx` 中读取商品定价模式，展示"可议价"标签及出价入口按钮。
- [ ] **Task 4: 补全出价详情页操作闭环 (P1)**
  - 在 `pages/offer/detail/index.tsx` 中增加交互按钮区。
  - 支持：接受、拒绝、还价（卖家操作）。
  - 支持：接受还价、拒绝还价、再次出价（买家操作）。
  - 补充处理请求并在操作后刷新数据。
```

