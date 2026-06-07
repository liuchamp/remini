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
