# OpenSpec 特性差距修复计划

> 基于 2026-06-09 对 `openspec/specs` 18 个特性规格与项目实际实现的全面分析。

## 目录

- [阶段概览](#阶段概览)
- [Phase 0: 编译阻断修复（P0）](#phase-0-编译阻断修复p0)
- [Phase 1: 核心功能补全（P1）](#phase-1-核心功能补全p1)
- [Phase 2: 增强功能补齐（P2）](#phase-2-增强功能补齐p2)
- [Phase 3: 质量收尾（P3）](#phase-3-质量收尾p3)
- [验收标准](#验收标准)

---

## 阶段概览

| 阶段 | 优先级 | 预估工期 | 涉及文件数 | 目标 |
|------|--------|---------|-----------|------|
| Phase 0 | P0 | 1-2 天 | ~3 | 修复编译阻断问题 |
| Phase 1 | P1 | 3-5 天 | ~15 | 补全核心业务功能 |
| Phase 2 | P2 | 5-7 天 | ~20 | 补齐增强功能 |
| Phase 3 | P3 | 3-5 天 | ~44 | 质量收尾与 i18n |

---

## Phase 0: 编译阻断修复（P0）

> **目标**：修复导致 TypeScript 编译失败的问题，确保项目可构建。

### Task 0.1: 注册 12 个缺失页面到 app.config.ts

**问题**：以下页面存在于 `src/pages/` 但未注册到 `app.config.ts`，导致无法路由访问。

**文件**：`src/app.config.ts`

**操作**：在对应 subPackages 中添加以下页面路径：

| subPackage root | 新增页面 |
|----------------|---------|
| `pages/kyc` | `liveness/index` |
| `pages/wallet` | `transactions/index`, `bind-card/index` |
| `pages/community` | `circle/list/index`, `circle/detail/index`, `creator/index` |
| `pages/admin` | `dispute/index`, `withdrawals/index`, `marketing/index` |
| `pages/product` | `edit/index` |
| `pages/profile` | `edit/index` |
| `pages/users` | `$id/index` |

**验收**：
- [ ] `tsc --noEmit` 无路由相关报错
- [ ] 所有页面可通过 `Taro.navigateTo` 正常跳转

---

### Task 0.2: 补充 communityApi.getCircles / getCircleDetail

**问题**：`pages/community/circle/list/index.tsx` 和 `pages/community/circle/detail/index.tsx` 调用了 `communityApi.getCircles()` 和 `communityApi.getCircleDetail(id)`，但这两个方法未在 `domains/community/api.ts` 中定义。

**文件**：`src/domains/community/api.ts`

**操作**：

```typescript
// 在 communityApi 对象中添加：
getCircles() {
  return http.get<Circle[]>('/community/circles')
},

getCircleDetail(id: string) {
  return http.get<{ circle: Circle; posts: Post[] }>(`/community/circles/${id}`)
},

joinCircle(circleId: string) {
  return http.post<void>(`/community/circles/${circleId}/join`)
},

leaveCircle(circleId: string) {
  return http.delete<void>(`/community/circles/${circleId}/join`)
},
```

**验收**：
- [ ] `communityApi.getCircles` 编译通过
- [ ] `communityApi.getCircleDetail` 编译通过

---

### Task 0.3: 补充 marketingApi.getReferralInfo + ReferralInfo 类型

**问题**：`pages/referral/index/index.tsx` 和 `pages/community/creator/index.tsx` 引用了 `marketingApi.getReferralInfo()` 和 `ReferralInfo` 类型，但均未在 `domains/marketing/api.ts` 中定义。

**文件**：
- `src/domains/marketing/types.ts` — 添加 `ReferralInfo` 接口
- `src/domains/marketing/api.ts` — 添加 `getReferralInfo` 方法并导出 `ReferralInfo`

**操作**：

```typescript
// types.ts 添加：
export interface ReferralLeaderboardEntry {
  rank: number
  name: string
  avatar: string
  referrals: number
}

export interface ReferralInfo {
  code: string
  link: string
  totalReferrals: number
  totalRewards: number
  leaderboard: ReferralLeaderboardEntry[]
}

// api.ts 添加：
getReferralInfo() {
  return http.get<ReferralInfo>('/marketing/referral/info')
},
```

**验收**：
- [ ] `marketingApi.getReferralInfo` 编译通过
- [ ] `ReferralInfo` 类型在引用处正常解析

---

## Phase 1: 核心功能补全（P1）

> **目标**：补全用户核心业务流程中的缺失功能。

### Task 1.1: 订单评价功能实现

**问题**：`pages/review/index/index.tsx` 当前为空壳页面（仅显示 `<Text>评价</Text>`），spec 要求完整的星级+图文评价+标签功能。

**文件**：
- `src/pages/review/index/index.tsx` — 重写为完整评价页面
- `src/pages/review/index/index.scss` — 评价页面样式
- `src/domains/trade/api.ts` — 添加评价 API

**需实现功能**：
1. 总体星级选择（1-5 星）
2. 商品标签选择（如"成色好""发货快"）
3. 文字评价输入（200 字限制）
4. 图片评价上传（最多 3 张）
5. 提交评价 API: `tradeApi.submitReview(orderId, data)`
6. 追评功能入口

**API 定义**：

```typescript
// trade/api.ts 添加：
submitReview(orderId: string, data: {
  rating: number
  tags: string[]
  content: string
  images: string[]
}) {
  return http.post(`/orders/${orderId}/review`, data)
},

appendReview(orderId: string, data: { content: string; images: string[] }) {
  return http.post(`/orders/${orderId}/review/append`, data)
},
```

**验收**：
- [ ] 评价页面可正常展示星级选择器
- [ ] 可上传图片并提交评价
- [ ] 提交后跳转到订单详情

---

### Task 1.2: 通知中心增强

**问题**：缺少通知详情页、TabBar 红点、通知偏好设置。

**文件**：
- `src/domains/notification/api.ts` — 添加偏好设置 API
- `src/domains/notification/types.ts` — 添加 NotificationPreference 类型
- `src/domains/notification/store.ts` — 添加偏好状态管理
- `src/pages/notification/settings/index.tsx` — 新建通知偏好页面
- `src/app.config.ts` — 注册通知偏好页面

**需实现功能**：

1. **TabBar 红点**：在消息 Tab 上展示未读数 badge
   - 修改位置：`src/app.ts` 或 TabBar 组件中调用 `Taro.setTabBarBadge`
   - 数据来源：`useNotificationStore.unreadCount`

2. **通知详情页**：点击通知项跳转到详情
   - 新建 `src/pages/notification/detail/index.tsx`
   - 展示完整通知内容 + "查看详情"跳转按钮
   - 自动标记已读

3. **通知偏好设置**：
   - API: `notificationApi.getPreferences()` / `updatePreferences(data)`
   - 页面：开关列表（系统/交易/营销/互动通知）

**验收**：
- [ ] TabBar 消息图标显示未读红点
- [ ] 点击通知可查看完整内容
- [ ] 通知偏好开关可正常切换并持久化

---

### Task 1.3: 即时通讯增强

**问题**：缺少消息已读回执展示、商品/订单卡片消息、删除/置顶会话。

**文件**：
- `src/domains/chat/api.ts` — 添加缺失 API
- `src/domains/chat/store.ts` — 添加状态管理
- `src/pages/chat/conversation/index.tsx` — 增强聊天页面

**需实现功能**：

1. **消息已读回执**：
   - 发送方消息气泡展示"已送达"/"已读"标识
   - 接收方进入聊天页自动发送已读回执
   - API: `chatApi.sendReadReceipt(threadId, messageIds)`

2. **商品卡片消息**：
   - 聊天输入区添加"发商品"按钮
   - 弹出已发布商品列表供选择
   - 发送含商品缩略图/标题/价格的卡片消息
   - API: `chatApi.sendMessage(threadId, { type: 'product', productId })`

3. **订单卡片消息**：
   - 聊天输入区添加"发订单"按钮
   - 弹出相关订单列表供选择
   - API: `chatApi.sendMessage(threadId, { type: 'order', orderId })`

4. **删除/置顶会话**：
   - 左滑会话项展示"删除"/"置顶"按钮
   - API: `chatApi.deleteThread(id)` / `chatApi.pinThread(id, pinned)`

**验收**：
- [ ] 消息气泡展示已读/未读状态
- [ ] 可发送商品卡片和订单卡片
- [ ] 可删除和置顶会话

---

### Task 1.4: 社区圈子加入/退出 + 评论删除

**问题**：圈子页面缺少加入/退出功能，评论缺少删除功能。

**文件**：
- `src/domains/community/api.ts` — 已在 Task 0.2 添加 joinCircle/leaveCircle
- `src/pages/community/circle/detail/index.tsx` — 添加加入/退出按钮
- `src/pages/community/post/index.tsx` — 添加评论删除

**需实现功能**：

1. **加入圈子**：
   - 圈子详情页顶部展示"加入"/"已加入"按钮
   - 点击加入调用 `communityApi.joinCircle(id)`
   - 加入后按钮变为"已加入"，成员数+1

2. **退出圈子**：
   - 已加入状态点击展示确认弹窗
   - 确认后调用 `communityApi.leaveCircle(id)`
   - 退出后按钮恢复"加入"状态

3. **删除评论**：
   - 长按自己的评论弹出"删除"选项
   - API: `communityApi.deleteComment(commentId)`
   - 确认后评论从列表移除，评论数-1

**验收**：
- [ ] 可加入/退出圈子
- [ ] 可删除自己的评论
- [ ] 操作后数据即时更新

---

### Task 1.5: 多设备登录管理

**问题**：spec 要求用户可查看已登录设备并主动下线指定设备，当前未实现。

**文件**：
- `src/domains/auth/api.ts` — 添加设备管理 API
- `src/pages/user/settings/index.tsx` — 添加账号安全入口
- 或新建 `src/pages/user/devices/index.tsx` — 设备管理页面

**API 定义**：

```typescript
getDevices() {
  return http.get<DeviceSession[]>('/auth/devices')
},
kickDevice(deviceId: string) {
  return http.delete(`/auth/devices/${deviceId}`)
},
```

**验收**：
- [ ] 用户可查看已登录设备列表
- [ ] 可下线指定设备
- [ ] 超过 5 台设备时最早设备自动下线（后端逻辑，前端展示提示）

---

## Phase 2: 增强功能补齐（P2）

> **目标**：补齐增强型功能，提升产品完整度。

### Task 2.1: 地址上限检查

**文件**：`src/pages/address/list/index.tsx`, `src/pages/address/edit/index.tsx`

**操作**：
- 地址列表页面在 `addresses.length >= 20` 时隐藏"新增地址"按钮
- 展示提示文案"地址数量已达上限（20 个），请删除其他地址后再添加"

**验收**：
- [ ] 地址达到 20 个后新增入口不可用
- [ ] 删除后恢复正常

---

### Task 2.2: 物流增强

**文件**：
- `src/pages/logistics/track/index.tsx` — 添加异常提醒和多包裹支持
- `src/pages/seller/index/index.tsx` 或发货页面 — 添加扫码录入

**需实现功能**：

1. **物流异常提醒**：
   - 物流信息超过 3 天未更新时，顶部展示黄色提醒条
   - 展示"联系客服"按钮

2. **多包裹展示**：
   - 当 `trackingInfo.packages` 有多个包裹时，展示切换 Tab
   - 每个包裹独立展示物流时间线

3. **扫码录入运单号**：
   - 发货表单中运单号输入框旁添加扫码按钮
   - 调用 `Taro.scanCode` 获取运单号

**验收**：
- [ ] 物流 3 天未更新展示异常提醒
- [ ] 多包裹可切换查看
- [ ] 扫码可自动填入运单号

---

### Task 2.3: 领取优惠券功能

**问题**：spec 要求公开领取优惠券功能，当前仅有 `useCoupon` 和 `exchangeCoupon`，无 `claimCoupon` API。

**文件**：
- `src/domains/marketing/api.ts` — 添加 claimCoupon API
- `src/pages/coupon/list/index.tsx` — 添加领券中心入口

**API 定义**：

```typescript
claimCoupon(couponTemplateId: string) {
  return http.post(`/marketing/coupons/claim`, { couponTemplateId })
},

getCouponTemplates() {
  return http.get<CouponTemplate[]>('/marketing/coupons/templates')
},
```

**验收**：
- [ ] 用户可在领券中心领取优惠券
- [ ] 领完后按钮变为"已抢完"
- [ ] 领取后优惠券出现在"我的优惠券"中

---

### Task 2.4: 创作者中心增强

**问题**：当前创作者中心仅展示邀请数据，缺少达人认证申请和佣金数据展示。

**文件**：
- `src/pages/community/creator/index.tsx` — 增强创作者中心
- `src/domains/community/api.ts` — 添加达人认证 API
- `src/domains/marketing/api.ts` — 添加佣金查询 API

**需实现功能**：

1. **达人认证申请**：
   - 展示认证条件说明（粉丝数/发帖数/交易额）
   - 提交申请按钮
   - API: `communityApi.applyCreatorCertification(data)`

2. **佣金数据展示**：
   - 累计佣金、可提现佣金、本月预估收入
   - 佣金明细列表（订单号、商品名、佣金金额、结算状态）
   - API: `marketingApi.getCommissionData()`

3. **晒单帖**：
   - 从创作者中心发起晒单，自动关联已成交商品
   - 帖子带"晒单"标签

**验收**：
- [ ] 可申请达人认证
- [ ] 可查看佣金数据和明细
- [ ] 可发布晒单帖

---

### Task 2.5: 分享增强

**文件**：
- `src/shared/utils/share.tsx` — 添加 onShareTimeline 支持
- `src/shared/components/share/PosterGenerator/index.tsx` — 添加降级逻辑

**需实现功能**：

1. **朋友圈分享**：
   - 在 ShareProvider 中添加 `Taro.useShareTimeline` 调用
   - 返回 `{ title, query: 'from=share_timeline' }`

2. **Canvas 降级方案**：
   - `canvasToTempFilePath` 失败时调用后端 `/api/poster/generate`
   - 跳转图片预览页让用户长按保存

**验收**：
- [ ] 所有页面支持分享到朋友圈
- [ ] Canvas 失败时有降级方案

---

### Task 2.6: 管理后台完善

**文件**：
- `src/app.config.ts` — 将 admin 分包独立为管理后台 subpackage
- `src/pages/admin/index/index.tsx` — 添加趋势图组件

**需实现功能**：

1. **独立分包**：admin 相关页面移入单独 subpackage
2. **趋势图**：集成图表库（如 echarts-for-weixin），展示近 7/30 天指标趋势

**验收**：
- [ ] 管理后台独立分包加载
- [ ] 趋势图可交互展示数据

---

### Task 2.7: 出价到期提醒

**文件**：
- `src/domains/trade/offer.ts` — 添加到期提醒逻辑
- `src/pages/offer/detail/index.tsx` — 展示到期倒计时

**操作**：
- 出价详情页展示剩余时间倒计时
- 距离过期不足 4 小时展示黄色提醒
- 距离过期不足 1 小时展示红色加急提醒

**验收**：
- [ ] 出价详情页展示倒计时
- [ ] 临近过期展示提醒标识

---

### Task 2.8: 积分抵扣 UI

**文件**：
- `src/pages/order/create/index.tsx` — 添加积分抵扣开关

**操作**：
- 订单确认页添加"使用积分抵扣"开关
- 展示换算关系：100 积分 = 1 元
- 自动计算可抵扣金额（不超过订单金额 50%）
- 确保抵扣后需支付金额 >= 0.01 元

**验收**：
- [ ] 结算页可开启积分抵扣
- [ ] 金额实时重新计算
- [ ] 抵扣上限 50%，最低支付 0.01 元

---

## Phase 3: 质量收尾（P3）

> **目标**：提升代码质量和国际化覆盖。

### Task 3.1: i18n 硬编码清理

**问题**：当前 44 个 `.tsx` 文件中存在 377 处中文硬编码（4+ 连续中文字符），未走 `useTranslation`。

**文件**：所有含硬编码的页面文件（见附录）

**操作规则**：
1. 公共文案（按钮、提示、空态）走 `common` namespace
2. 页面专属文案走对应 namespace（如 `trade`, `marketing`, `community`）
3. Toast 提示文案使用 `t('key')` 替换
4. 提交前执行 `grep -r '[\u4e00-\u9fff]\{4,\}' src/pages/**/*.tsx` 验证无剩余

**优先级排序**（按硬编码数量）：

| 文件 | 硬编码数 |
|------|---------|
| `order/detail/index.tsx` | 54 |
| `seller/index/index.tsx` | 19 |
| `seller/product-manage/index.tsx` | 17 |
| `publish/index.tsx` | 17 |
| `seller/offer-manage/index.tsx` | 16 |
| `product/detail/index.tsx` | 15 |
| `wallet/bind-card/index.tsx` | 15 |
| `offer/detail/index.tsx` | 18 |
| `address/edit/index.tsx` | 19 |
| `product/edit/index.tsx` | 19 |

**验收**：
- [ ] `grep` 验证 pages 目录下无 4+ 连续中文硬编码
- [ ] zh-CN 和 en-US 翻译文件 key 完整对应
- [ ] 切换语言后所有页面文本正确切换

---

### Task 3.2: 余额隐藏/显示切换

**文件**：`src/pages/wallet/index/index.tsx`

**操作**：
- 余额数字区域添加点击切换可见/隐藏功能
- 隐藏时展示 `****`
- 默认隐藏

**验收**：
- [ ] 点击余额可切换显示/隐藏
- [ ] 默认隐藏状态

---

### Task 3.3: 发帖草稿自动保存

**文件**：
- `src/pages/community/create/index.tsx` — 添加草稿逻辑
- `src/domains/community/store.ts` — 添加草稿状态

**操作**：
- 使用 `Taro.setStorageSync('post_draft', { content, images })` 定时保存
- 进入发帖页时检查是否有草稿，提示恢复
- 提交成功后清除草稿

**验收**：
- [ ] 输入内容自动保存为草稿
- [ ] 重新进入可恢复草稿
- [ ] 发布成功后草稿清除

---

## 验收标准

### 全局验收清单

- [ ] `tsc --noEmit` 零错误
- [ ] 所有 60+ 页面可通过路由访问
- [ ] 14 个域模块 API 定义完整，无 undefined 方法调用
- [ ] i18n zh-CN/en-US 双语覆盖所有 namespace
- [ ] 无 4+ 连续中文硬编码（i18n 完成后）

### 分阶段验收

| 阶段 | 验收条件 |
|------|---------|
| Phase 0 完成 | `tsc --noEmit` 通过，所有页面可路由 |
| Phase 1 完成 | 核心业务流程（评价、通知、IM、圈子、设备管理）可用 |
| Phase 2 完成 | 增强功能（物流、领券、创作者、分享、管理后台）可用 |
| Phase 3 完成 | i18n 覆盖率 100%，代码质量达标 |

### 回归测试重点

1. **下单全流程**：浏览商品 → 出价/购买 → 支付 → 发货 → 收货 → 评价
2. **社区全流程**：发帖 → 评论 → 点赞 → 加入圈子 → 创作者认证
3. **认证全流程**：L1 手机 → L2 身份证 → L3 活体 → 解锁功能
4. **钱包全流程**：充值 → 提现 → 绑定银行卡 → 交易明细
5. **管理后台**：用户封禁 → 商品审核 → 提现审核 → 纠纷仲裁
