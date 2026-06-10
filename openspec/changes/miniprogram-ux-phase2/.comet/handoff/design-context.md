# Comet Design Handoff

- Change: miniprogram-ux-phase2
- Phase: design
- Mode: compact
- Context hash: ae091da57cbbbc86904a53de41943fc54e58f12b6e4d582d6cc887efeabd7367

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/miniprogram-ux-phase2/proposal.md

- Source: openspec/changes/miniprogram-ux-phase2/proposal.md
- Lines: 1-74
- SHA256: a5731668e8a92b6e8e6855126f8c37b32d18c3eedad87454fd9a7a8e360337f3

```md
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
- 添加页面过渡动画（CSS transition + Taro pageTransition）
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
```

## openspec/changes/miniprogram-ux-phase2/design.md

- Source: openspec/changes/miniprogram-ux-phase2/design.md
- Lines: 1-395
- SHA256: 1fdd09773d3bd66a84399faf805b9a887fbb5a3cc7681f55c17d570461417793

[TRUNCATED]

```md
# Design: REMX 小程序 UX 优化 - 第二阶段

## 技术架构

### 1. 导航增强模块

#### 1.1 页面过渡动画
**方案**: 使用 Taro 的 `pageTransition` 配置 + CSS 动画

```typescript
// app.config.ts
export default defineAppConfig({
  pageTransition: {
    duration: 300,
    timingFunction: 'ease-in-out'
  }
})
```

**动画类型**:
- 普通页面: 从右侧滑入 (iOS 风格)
- TabBar 页面: 淡入
- 模态页面: 从底部滑入

#### 1.2 返回顶部按钮
**方案**: 创建 `BackTop` 组件，监听滚动事件

```typescript
// shared/components/BackTop/index.tsx
interface BackTopProps {
  threshold?: number;  // 显示阈值，默认 300px
  duration?: number;   // 滚动动画时长，默认 300ms
}
```

**实现细节**:
- 使用 `ScrollView` 的 `onScroll` 事件
- 超过阈值时显示浮动按钮
- 点击后平滑滚动到顶部
- 支持自定义图标和位置

#### 1.3 面包屑导航
**方案**: 创建 `Breadcrumb` 组件 + 路由历史追踪

```typescript
// shared/components/Breadcrumb/index.tsx
interface BreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
  }>;
  separator?: string;
}
```

**实现细节**:
- 使用 `useRouter` 获取当前页面路径
- 维护路由历史栈（Context 或 Store）
- 支持点击跳转和当前页高亮
- 响应式设计（移动端友好）

#### 1.4 页面栈管理
**方案**: 创建导航工具函数 + 深度保护

```typescript
// shared/utils/navigation.ts
export const NavigationService = {
  // 安全的页面跳转（带深度检查）
  safeNavigateTo: async (url: string) => {
    const pages = Taro.getCurrentPages();
    if (pages.length >= 10) {
      // 达到栈深度限制，使用 redirectTo
      return Taro.redirectTo({ url });
    }
    return Taro.navigateTo({ url });
  },
  
  // 智能返回（根据来源判断）
  smartNavigateBack: (delta = 1) => {
    const pages = Taro.getCurrentPages();
```

Full source: openspec/changes/miniprogram-ux-phase2/design.md

## openspec/changes/miniprogram-ux-phase2/tasks.md

- Source: openspec/changes/miniprogram-ux-phase2/tasks.md
- Lines: 1-210
- SHA256: 5cb174ae62be951ce7da182b41727ca1f78959a0d68a42977ef153d49b6b0980

[TRUNCATED]

```md
# Tasks: REMX 小程序 UX 优化 - 第二阶段

## Phase 3: 导航优化 (Week 1)

### 3.1 页面过渡动画
- [ ] 3.1.1 配置 app.config.ts 的 pageTransition
- [ ] 3.1.2 创建页面过渡 CSS 动画
- [ ] 3.1.3 测试不同页面类型的过渡效果
- [ ] 3.1.4 优化动画性能（避免卡顿）

### 3.2 返回顶部按钮
- [ ] 3.2.1 创建 BackTop 组件
- [ ] 3.2.2 实现滚动监听逻辑
- [ ] 3.2.3 添加平滑滚动动画
- [ ] 3.2.4 集成到首页、分类、订单列表
- [ ] 3.2.5 添加自定义图标和位置配置

### 3.3 面包屑导航
- [ ] 3.3.1 创建 Breadcrumb 组件
- [ ] 3.3.2 实现路由历史追踪
- [ ] 3.3.3 添加点击跳转功能
- [ ] 3.3.4 集成到商品详情、订单详情等深层页面
- [ ] 3.3.5 响应式设计适配

### 3.4 页面栈管理
- [ ] 3.4.1 创建 NavigationService 工具
- [ ] 3.4.2 实现 safeNavigateTo（深度检查）
- [ ] 3.4.3 实现 smartNavigateBack（智能返回）
- [ ] 3.4.4 替换现有导航调用
- [ ] 3.4.5 添加导航日志和错误处理

## Phase 4: 平台特性深度集成 (Week 2)

### 4.1 微信订阅消息
- [ ] 4.1.1 创建 SubscribeService 工具
- [ ] 4.1.2 实现权限请求逻辑
- [ ] 4.1.3 集成到订单状态页面
- [ ] 4.1.4 集成到支付成功页面
- [ ] 4.1.5 添加订阅消息模板配置

### 4.2 微信卡包
- [ ] 4.2.1 创建 CardService 工具
- [ ] 4.2.2 实现添加卡到卡包
- [ ] 4.2.3 集成到优惠券页面
- [ ] 4.2.4 集成到会员卡页面
- [ ] 4.2.5 添加卡包 UI 组件

### 4.3 支付宝生活号
- [ ] 4.3.1 创建 LifeAccountService 工具
- [ ] 4.3.2 实现打开生活号功能
- [ ] 4.3.3 实现关注状态检查
- [ ] 4.3.4 集成到设置页面
- [ ] 4.3.5 添加生活号入口 UI

### 4.4 支付宝芝麻信用
- [ ] 4.4.1 创建 CreditScoreService 工具
- [ ] 4.4.2 实现信用授权流程
- [ ] 4.4.3 集成到 KYC 认证页面
- [ ] 4.4.4 添加信用分展示组件
- [ ] 4.4.5 处理授权失败降级

### 4.5 支付宝支付支持
- [ ] 4.5.1 更新支付页面支持支付宝
- [ ] 4.5.2 添加支付宝支付图标
- [ ] 4.5.3 实现支付参数处理
- [ ] 4.5.4 测试支付宝支付流程
- [ ] 4.5.5 添加支付结果处理

### 4.6 鸿蒙服务卡片
- [ ] 4.6.1 创建服务卡片配置文件
- [ ] 4.6.2 实现卡片数据更新
- [ ] 4.6.3 添加卡片 UI 设计
- [ ] 4.6.4 测试鸿蒙服务卡片
- [ ] 4.6.5 添加卡片交互功能

## Phase 6: 性能优化 (Week 3)

### 6.1 列表虚拟化
- [ ] 6.1.1 创建 VirtualList 组件
- [ ] 6.1.2 实现虚拟滚动逻辑
```

Full source: openspec/changes/miniprogram-ux-phase2/tasks.md

