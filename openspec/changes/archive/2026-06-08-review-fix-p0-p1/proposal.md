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
