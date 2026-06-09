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
