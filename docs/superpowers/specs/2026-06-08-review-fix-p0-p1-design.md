---
comet_change: review-fix-p0-p1
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-08-review-fix-p0-p1
status: final
---

# 修复完整性评审报告 P0 & P1 缺口设计文档

## 1. 提现上限动态计算 (Withdraw Limit)
- **方案**：在 `pages/wallet/withdraw` 加载时，通过 `useAuthStore` 结合 `kycApi.getStatus()` 获取用户的 `currentKycTier`。前端维护一份与 Spec 一致的 `KYC_TIER_LIMITS` 映射表。`maxWithdraw` = `Math.min(availableBalance, KYC_TIER_LIMITS[currentTier].singleTxLimit)`。
- **降级处理**：如果当前 Tier 限制额度不足，展示引导按钮跳转到 KYC 升级页面。

## 2. 2FA 风控拦截 (Risk Challenge)
- **拦截器**：在 `shared/api/request.ts` 的 axios 响应拦截器中全局处理。当接口返回特定状态（如 412 或业务码 `RISK_CHALLENGE`）时：
  1. 将被拦截的请求配置（config）暂存。
  2. 强制路由跳转至 `/pages/auth/challenge/index`。
- **验证页面**：挑战页面负责发送短信或校验 TOTP。
- **请求重放**：验证成功后，取出暂存的请求进行重放 (replay)，成功后自动回退页面。
- **Block 处理**：如果返回 `RISK_BLOCK`，拦截器弹出全局 Modal 提示"操作被拒绝"，中断请求且不跳转页面。

## 3. 商品及出价交互补全 (Offer & Pricing)
- **商品发布与编辑**：增加 `pricingMode` (fixed/negotiable) 字段的表单选择。
- **商品详情页**：当 `pricingMode === 'negotiable'` 时展示"可议价"标签，并显示出价按钮，点击跳转至出价详情/创建页。
- **出价详情页 (`pages/offer/detail`)**：底部增加 Fixed Action Bar，根据用户角色（卖家或买家）及当前 `offer.status` 渲染不同的操作按钮（接受、拒绝、还价、再次出价）。操作调用完成后触发详情数据的重新 fetch。

## 测试策略
- **风控流**：使用 mock 数据触发 412 响应，验证 challenge 跳转、重放及页面回退流程。
- **提现上限**：分别使用 L1、L2、L3 的用户状态进行提现操作，验证计算的 `maxWithdraw` 是否正确。
- **议价流**：通过双角色视角（同一商品、同一次议价）验证按钮组展示是否匹配对应状态。
