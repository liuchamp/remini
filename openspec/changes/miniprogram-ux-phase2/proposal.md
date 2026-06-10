# Proposal: REMX 小程序 UX 优化 - 第二阶段

## Why

REMX 小程序已完成第一阶段核心 UX 优化（触控目标、骨架屏、空状态、表单 Hooks），但仍有多个关键领域需要改进：

1. **导航体验不足** - 无页面过渡动画、无返回顶部、无面包屑，深层导航体验差
2. **平台特性未充分利用** - 微信订阅消息、支付宝生活号、鸿蒙分布式能力等功能标记已定义但未实现
3. **性能瓶颈** - 长列表无虚拟化、组件未使用 React.memo、无测试覆盖
4. **质量保障缺失** - 无单元测试、无 E2E 测试、无性能监控

这些问题影响用户体验、平台原生能力和应用质量，需要在第二阶段解决。

## What Changes

### 导航优化 (Phase 3)
- 添加页面过渡动画（Taro 生命周期 hooks + CSS transitions）
- 实现返回顶部按钮（长列表自动显示）
- 添加面包屑导航组件（深层页面路径指示）
- 优化页面栈管理（深度保护、自动清理）

### 平台特性深度集成 (Phase 4)
- 实现微信订阅消息（订单状态、支付成功通知）
- 实现微信卡包功能（优惠券、会员卡）
- 实现支付宝生活号入口
- 实现支付宝芝麻信用授权
- 更新支付页面支持支付宝支付
- 实现鸿蒙服务卡片

### 性能优化 (Phase 6)
- 实现列表虚拟化（首页、分类、订单列表）
- 为所有展示组件添加 React.memo
- 添加 WebP/AVIF 图片支持
- 配置自定义 splitChunks 优化缓存
- 添加性能预算监控

### 测试与打磨 (Phase 7)
- 设置 Vitest 单元测试框架
- 添加 React Testing Library 组件测试
- 设置 Playwright E2E 测试
- 添加关键路径测试覆盖
- 添加性能测试

## Capabilities

### New Capabilities
- `navigation-enhancement`: 页面过渡动画、返回顶部、面包屑导航、页面栈管理
- `platform-integration`: 微信订阅消息、卡包、支付宝生活号、芝麻信用、鸿蒙服务卡片
- `performance-optimization`: 列表虚拟化、React.memo、图片优化、代码分割优化
- `testing-infrastructure`: Vitest 单元测试、React Testing Library、Playwright E2E

### Modified Capabilities
- `miniprogram-ux`: 扩展现有 UX 规格，添加导航和性能相关需求

## Impact

### 代码影响
- **新增文件**: 导航组件、平台集成工具、测试配置、测试文件
- **修改文件**: 所有列表页面（虚拟化）、所有展示组件（React.memo）、支付页面（支付宝支持）
- **依赖新增**: vitest、@testing-library/react、playwright、react-virtualized

### API 影响
- 新增 Taro API 调用：`requestSubscribeMessage`、`addCard`、`openLifeAccount`、`getAuthCode`
- 新增组件导出：`BackTop`、`Breadcrumb`、`VirtualList`

### 平台影响
- 微信：需要申请订阅消息权限、卡包权限
- 支付宝：需要接入生活号、芝麻信用 API
- 鸿蒙：需要配置服务卡片 manifest

### 性能影响
- 首屏加载时间预期减少 20-30%（虚拟化 + 代码分割优化）
- 列表滚动帧率目标 60fps（虚拟化）
- 包大小监控（性能预算）
