---
comet_change: openspec-feature-completion
role: technical-design
canonical_spec: openspec
---

# OpenSpec Feature Completion — Technical Design

## 1. Overview

本 change 修复 18 个 domain spec 与实际前端实现之间的差距。所有 spec 需求已在 `openspec/specs/` 中完整定义，本设计仅关注实现层补全。

**规模**：4 个 Phase、25+ tasks、14 个 domain 模块、20+ 页面、单个完整 plan。

**技术栈**：Taro 3.x + React 18 + Zustand + SCSS + react-i18next

## 2. Mock 拦截器架构

### 2.1 集成位置

在现有 `HttpClient` interceptor pipeline 中新增 `mockInterceptor`，作为 response interceptor 在 `tokenRefresher` 之前执行：

```
请求 → tokenInjector → [mockInterceptor] → Taro.request → tokenRefresher → errorNormalizer → riskInterceptor
```

### 2.2 文件结构

```
src/shared/api/
  mock-interceptor.ts     — 核心拦截器逻辑
  mocks/
    index.ts              — 聚合所有 domain mock
    trade.ts              — 订单/评价 mock 数据
    community.ts          — 社区/圈子 mock 数据
    notification.ts       — 通知 mock 数据
    chat.ts               — IM mock 数据
    auth.ts               — 认证/设备 mock 数据
    marketing.ts          — 营销/优惠券/推荐 mock 数据
    address.ts            — 地址 mock 数据
    shipping.ts           — 物流 mock 数据
    wallet.ts             — 钱包 mock 数据
    admin.ts              — 管理后台 mock 数据
    product.ts            — 商品 mock 数据
    seller.ts             — 卖家 mock 数据
    user.ts               — 用户 mock 数据
```

### 2.3 核心设计

- **开关控制**：`MOCK_ENABLED` 环境变量，默认 `true`；`HttpClient` 构造时按开关决定是否注册 mockInterceptor
- **URL 路由匹配**：mock 表以 `{ method: 'GET'|'POST'|..., urlPattern: RegExp, handler: () => ApiResponse<T> }` 结构组织
- **响应格式**：统一返回 `ApiResponse<T>` 即 `{ code: 0, data: T, message: 'ok' }`
- **未匹配降级**：URL 不在 mock 表中时不拦截，请求正常发出到后端
- **后期清理**：后端就绪后 `MOCK_ENABLED=false` 即可，mock 文件保留供测试使用
- **每个 Task 新增 API 时同步添加 mock 数据**

## 3. 分阶段执行策略

### Phase 0: 编译阻断修复（3 tasks）

**执行顺序**：0.1 → 0.2 → 0.3（顺序执行，有依赖）

| Task | 模式 | 文件 |
|------|------|------|
| 0.1 路由注册 | 编辑 `app.config.ts` subPackages | 1 |
| 0.2 community API | 追加方法 + mock | 2 + mock |
| 0.3 marketing API | 追加方法 + 类型 + mock | 3 + mock |

**验证**：`tsc --noEmit` 零错误

### Phase 1: 核心功能补全（5 tasks，可并行）

统一执行模式：
1. 补充 API 方法 + 类型 + mock 数据
2. 补充/更新 zustand store
3. 实现/重写页面组件（同步添加 i18n key）
4. 注册新页面到 `app.config.ts`

| Task | 新建页面 | 增强页面 | 新 API |
|------|---------|---------|--------|
| 1.1 评价 | 0（重写空壳） | 1 | submitReview, appendReview |
| 1.2 通知 | detail, settings | 0 | getPreferences, updatePreferences |
| 1.3 IM | 0 | conversation | sendReadReceipt, deleteThread, pinThread |
| 1.4 圈子 | 0 | circle/detail, post | deleteComment |
| 1.5 设备管理 | devices | 0 | getDevices, kickDevice |

**验证**：各页面可路由访问 + mock 数据渲染 + loading/error/empty/data 四态覆盖

### Phase 2: 增强功能（8 tasks，大部分增量修改）

| Task | 关键变更 |
|------|---------|
| 2.1 地址上限 | `addresses.length >= 20` 时隐藏新增按钮 |
| 2.2 物流增强 | 异常提醒条 + 多包裹 Tab + `Taro.scanCode` 扫码 |
| 2.3 领券中心 | claimCoupon + getCouponTemplates API |
| 2.4 创作者中心 | 达人认证 + 佣金数据 + 晒单帖 |
| 2.5 分享增强 | `onShareTimeline` + Canvas 降级到后端 `/api/poster/generate` |
| 2.6 管理后台 | 独立 subPackage + echarts-for-weixin 趋势图 |
| 2.7 出价提醒 | 倒计时 + 4h 黄色 / 1h 红色 |
| 2.8 积分抵扣 | 开关 + 100积分=1元 + 上限50% + 最低0.01元 |

**Task 2.6 特殊处理**：
- admin 页面从现有 subPackage 拆分为独立 subPackage
- 集成 `echarts-for-weixin` npm 包
- 新建 `src/pages/admin/components/TrendChart/index.tsx` 图表组件
- 使用 `ec-canvas` Taro 适配组件封装

**验证**：各增强功能可交互 + mock 数据展示

### Phase 3: 质量收尾（3 tasks）

- **3.1 i18n 验证**：因同步添加策略，缩减为全局 grep 扫描 + 修复遗漏
- **3.2 余额隐藏**：钱包页面余额区域点击切换可见/隐藏，默认隐藏
- **3.3 发帖草稿**：`Taro.setStorageSync('post_draft', ...)` 定时保存 + 进入恢复 + 发布清除

**验证**：grep 无 4+ 连续中文硬编码 + 语言切换正常

## 4. i18n 策略

采用**随页面实现同步添加**策略：

- 实现/修改页面时，同步将中文文案替换为 `t('namespace:key')`
- 同步在 `src/shared/i18n/resources/zh-CN/<namespace>.json` 和 `en-US/<namespace>.json` 中添加 key
- 遵循现有 13 个 namespace 约定：common, auth, product, trade, chat, profile, validation, marketing, logistics, wallet, kyc, community, notification
- Phase 3 仅做验证和补漏

## 5. 风险与缓解

| 风险 | 缓解 |
|------|------|
| API 响应结构不一致 | 类型基于 spec scenario 推导；后端就绪后仅替换 mock 开关 |
| echarts-for-weixin Taro 兼容性 | 使用 ec-canvas 适配组件；出问题降级为纯 CSS 数字卡片 |
| i18n key 命名冲突 | 新增前 grep 确认无重复；遵循 namespace 分层 |
| 动态路由 `$id` | 已验证 Taro 支持 `pages/users/$id` 模式 |

## 6. 验证策略

### 每 Phase 自动验证

1. `tsc --noEmit` 编译零错误
2. `app.config.ts` 中所有页面路径对应文件存在
3. 页面 import 的所有 API 方法在 domain api.ts 中有定义
4. `grep '[\u4e00-\u9fff]\{4,\}' src/pages/**/*.tsx` 无残留（Phase 3）

### Phase 1-2 手动验证

- 启动 dev server
- 各页面 loading/error/empty/data 四态组件覆盖检查
- mock 数据渲染正确性

## 7. 无 Delta Spec 变更

现有 18 个 domain spec 已完整覆盖所有需求场景。本 change 纯为实现差距修复，无需新增或修改 spec。
