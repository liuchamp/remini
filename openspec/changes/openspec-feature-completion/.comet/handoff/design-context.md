# Comet Design Handoff

- Change: openspec-feature-completion
- Phase: design
- Mode: compact
- Context hash: 3ad676f4ad7b38102dd1ceb2d4641e3288086e44afb6882152a35043d2a13747

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/openspec-feature-completion/proposal.md

- Source: openspec/changes/openspec-feature-completion/proposal.md
- Lines: 1-39
- SHA256: edd7ce73abef5442dee1790cf93d428c76a96906dd271806af8c1637a9205735

```md
# Proposal: OpenSpec Feature Completion

## Motivation

项目 18 个 domain spec 已定义了完整的功能规格，但实际实现存在显著差距：

- **P0 编译阻断**：12 个页面未注册到路由配置、关键 API 方法缺失导致 TypeScript 编译失败
- **P1 核心功能缺失**：评价页面为空壳、通知中心缺少详情页/偏好设置/TabBar 红点、IM 缺少已读回执/卡片消息/会话管理、社区缺少圈子操作/评论删除、缺少多设备登录管理
- **P2 增强功能未实现**：地址上限检查、物流异常提醒/多包裹/扫码录入、领券中心、创作者中心增强、分享增强、管理后台趋势图、出价到期提醒、积分抵扣 UI
- **P3 质量问题**：44 个页面存在 377 处中文硬编码未走 i18n、余额隐藏切换、发帖草稿自动保存

## Goals

1. 修复所有编译阻断问题，确保 `tsc --noEmit` 零错误
2. 补全核心业务流程（评价、通知、IM、圈子、设备管理）的前端实现
3. 补齐增强功能（物流、领券、创作者、分享、管理后台、出价提醒、积分抵扣）
4. 实现 i18n 全覆盖，消除中文硬编码

## Non-Goals

- 后端 API 的实际实现（本 change 仅涉及前端 stub/mock 层）
- 新增 domain 或 spec（所有需求已在现有 spec 中定义）
- 性能优化或架构重构
- 自动化测试用例编写

## Scope

- 涉及 14 个 domain 模块的 API 补充
- 涉及 20+ 页面的功能补全和增强
- 涉及 `app.config.ts` 路由注册
- i18n zh-CN/en-US 双语覆盖

## Success Criteria

- `tsc --noEmit` 零错误
- 所有 60+ 页面可通过路由访问
- 14 个域模块 API 定义完整
- i18n 覆盖率 100%
- 无 4+ 连续中文硬编码
```

## openspec/changes/openspec-feature-completion/design.md

- Source: openspec/changes/openspec-feature-completion/design.md
- Lines: 1-45
- SHA256: ef9fd14448ee6f5bc30d1bf592919b919443607bd993317021ca71a7c180f4b1

```md
# Design: OpenSpec Feature Completion

## Architecture Decisions

### 分阶段实施策略

采用 4 阶段递进实施，每阶段独立可验证：

1. **Phase 0（编译阻断）**：路由注册 + API stub 补全 → 项目可构建
2. **Phase 1（核心功能）**：评价/通知/IM/圈子/设备管理 → 核心流程可用
3. **Phase 2（增强功能）**：物流/领券/创作者/分享/管理后台/出价/积分 → 功能完整
4. **Phase 3（质量收尾）**：i18n 清理 + 小功能补齐 → 质量达标

### API 补全模式

所有缺失 API 遵循现有 domain 模式：
- `domains/<domain>/api.ts` — 添加方法，返回 `http.get/post/delete<T>()`
- `domains/<domain>/types.ts` — 添加缺失类型定义
- `domains/<domain>/store.ts` — 需要状态管理时添加 zustand store

### 页面实现模式

- 空壳页面：重写为完整页面，遵循现有 Taro + React 组件模式
- 功能增强：在现有页面基础上增量添加
- 新页面：注册到 `app.config.ts` 后创建

### 技术约束

- 框架：Taro 3.x + React 18
- 状态管理：Zustand（现有模式）
- 样式：SCSS modules
- 网络层：现有 `shared/utils/http.ts`
- i18n：`react-i18next`，namespace 按 domain 划分

## Risks

1. **API 响应结构不确定**：后端未实现，前端类型定义可能与实际不一致 → 使用合理 mock 类型
2. **i18n 工作量巨大**：377 处硬编码涉及 44 个文件 → 分批处理，优先 P0/P1 页面
3. **图表库集成**：echarts-for-weixin 在 Taro 中兼容性需验证 → Phase 2 再处理

## Testing Strategy

- Phase 0：`tsc --noEmit` 编译通过
- Phase 1-2：手动功能验证 + 页面可访问性检查
- Phase 3：`grep` 验证无中文硬编码 + 语言切换验证
```

## openspec/changes/openspec-feature-completion/tasks.md

- Source: openspec/changes/openspec-feature-completion/tasks.md
- Lines: 1-60
- SHA256: 4eab048119761160ccb6875f1fb1736bbf3bbb77adfe403255a3a6900a8a8e41

```md
# Tasks: OpenSpec Feature Completion

## Phase 0: 编译阻断修复（P0）

- [ ] **Task 0.1** 注册 12 个缺失页面到 `app.config.ts`
  - pages/kyc/liveness, pages/wallet/transactions, pages/wallet/bind-card
  - pages/community/circle/list, circle/detail, creator
  - pages/admin/dispute, withdrawals, marketing
  - pages/product/edit, pages/profile/edit, pages/users/$id

- [ ] **Task 0.2** 补充 `communityApi.getCircles / getCircleDetail / joinCircle / leaveCircle`
  - 文件：`src/domains/community/api.ts`

- [ ] **Task 0.3** 补充 `marketingApi.getReferralInfo` + `ReferralInfo` 类型
  - 文件：`src/domains/marketing/api.ts`, `src/domains/marketing/types.ts`

## Phase 1: 核心功能补全（P1）

- [ ] **Task 1.1** 订单评价功能实现
  - 重写 `pages/review/index/index.tsx` 为完整评价页面
  - 添加星级选择 + 标签 + 文字 + 图片上传 + 追评
  - 补充 `tradeApi.submitReview / appendReview`

- [ ] **Task 1.2** 通知中心增强
  - TabBar 红点（`Taro.setTabBarBadge`）
  - 通知详情页（新建 `pages/notification/detail/index.tsx`）
  - 通知偏好设置页（新建 `pages/notification/settings/index.tsx`）
  - 补充 `notificationApi.getPreferences / updatePreferences`

- [ ] **Task 1.3** 即时通讯增强
  - 消息已读回执展示 + 自动发送
  - 商品卡片消息 + 订单卡片消息
  - 删除/置顶会话（左滑操作）
  - 补充 `chatApi.sendReadReceipt / deleteThread / pinThread`

- [ ] **Task 1.4** 社区圈子加入/退出 + 评论删除
  - 圈子详情页添加加入/退出按钮
  - 长按评论删除功能
  - 补充 `communityApi.deleteComment`

- [ ] **Task 1.5** 多设备登录管理
  - 新建设备管理页面 `pages/user/devices/index.tsx`
  - 补充 `authApi.getDevices / kickDevice`

## Phase 2: 增强功能补齐（P2）

- [ ] **Task 2.1** 地址上限检查（20 个上限）
- [ ] **Task 2.2** 物流增强（异常提醒 + 多包裹 + 扫码录入）
- [ ] **Task 2.3** 领取优惠券功能（`claimCoupon / getCouponTemplates`）
- [ ] **Task 2.4** 创作者中心增强（达人认证 + 佣金数据 + 晒单）
- [ ] **Task 2.5** 分享增强（朋友圈分享 + Canvas 降级）
- [ ] **Task 2.6** 管理后台完善（独立分包 + 趋势图）
- [ ] **Task 2.7** 出价到期提醒（倒计时 + 颜色提醒）
- [ ] **Task 2.8** 积分抵扣 UI（开关 + 换算 + 上限 50%）

## Phase 3: 质量收尾（P3）

- [ ] **Task 3.1** i18n 硬编码清理（44 文件 377 处）
- [ ] **Task 3.2** 余额隐藏/显示切换
- [ ] **Task 3.3** 发帖草稿自动保存
```

