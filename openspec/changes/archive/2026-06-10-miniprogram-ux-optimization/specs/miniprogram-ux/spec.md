# Delta Spec: 小程序 UX 优化能力规格

> **Change**: miniprogram-ux-optimization  
> **Capability**: miniprogram-ux  
> **Version**: 1.0.0  
> **Created**: 2026-06-10

---

## 能力概述

本 delta spec 定义 REMX 小程序 UX 优化的能力规格，涵盖触控体验、加载状态、空状态、平台适配、表单 UX 和性能优化 6 个核心能力。

---

## 能力 1: 触控目标标准化

### 1.1 规格定义
所有可交互元素必须满足以下触控目标要求：

| 元素类型 | 最小尺寸 | 推荐尺寸 |
|---------|---------|---------|
| 按钮 | 48px × 48px | 56px × 56px |
| 列表项 | 48px 高度 | 56px 高度 |
| 图标按钮 | 48px × 48px | 56px × 56px |
| 表单输入 | 48px 高度 | 56px 高度 |
| Tab 项目 | 48px × 48px | 56px × 56px |

### 1.2 实现规格
```scss
// mixins.scss 新增
@mixin touch-target($min-height: 48px) {
  min-height: $min-height;
  min-width: $min-height;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@mixin touch-target-comfortable {
  @include touch-target(56px);
}
```

### 1.3 验收标准
- [ ] 所有按钮 ≥ 48px
- [ ] 所有列表项点击区域 ≥ 48px
- [ ] 所有图标按钮 ≥ 48px
- [ ] 所有表单输入 ≥ 48px
- [ ] 触觉反馈在关键操作时触发

---

## 能力 2: 加载状态统一

### 2.1 规格定义
所有列表页面必须使用骨架屏（Skeleton）作为加载状态，禁止使用通用 spinner。

### 2.2 骨架屏变体
| 变体 | 适用场景 | 布局 |
|------|---------|------|
| `card` | 商品卡片列表 | 2 列网格 |
| `list` | 消息/通知列表 | 单列列表 |
| `detail` | 详情页 | 图文混排 |
| `profile` | 个人资料 | 头像 + 信息 |
| `product` | 商品详情 | 轮播 + 信息 |

### 2.3 实现规格
```tsx
// Skeleton 组件扩展
interface SkeletonProps {
  variant: 'card' | 'list' | 'detail' | 'profile' | 'product'
  count?: number
  animated?: boolean
}
```

### 2.4 验收标准
- [ ] 所有列表页使用 Skeleton
- [ ] 骨架屏与最终布局形状匹配
- [ ] 加载到内容有过渡动画
- [ ] 无闪烁或跳动

---

## 能力 3: 空状态完善

### 3.1 规格定义
所有列表页面在无数据时必须显示空状态，包含插图、文案和操作按钮。

### 3.2 空状态变体
| 变体 | 场景 | 插图 | 操作 |
|------|------|------|------|
| `no-data` | 通用空状态 | 空盒子 | 刷新 |
| `no-orders` | 无订单 | 订单袋 | 去逛逛 |
| `no-favorites` | 无收藏 | 空心星 | 去发现 |
| `no-results` | 搜索无结果 | 放大镜 | 清除筛选 |
| `no-chat` | 无聊天 | 对话气泡 | 去社区 |
| `no-posts` | 无动态 | 笔记本 | 去发布 |

### 3.3 实现规格
```tsx
interface EmptyStateProps {
  variant: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  image?: string
}
```

### 3.4 验收标准
- [ ] 所有列表页有空状态
- [ ] 空状态有明确的行动指引
- [ ] 插图风格统一
- [ ] 文案友好、有引导性

---

## 能力 4: 平台特性适配

### 4.1 规格定义
针对微信、支付宝、鸿蒙三大平台，适配各自的原生特性。

### 4.2 微信特性
| 特性 | 实现 | 优先级 |
|------|------|--------|
| 分享卡片 | `onShareAppMessage` 自定义 | P0 |
| 收藏 | `wx.addCard` | P1 |
| 订阅消息 | `wx.requestSubscribeMessage` | P1 |
| 小程序码 | `wx.getUnlimitedQRCode` | P2 |

### 4.3 支付宝特性
| 特性 | 实现 | 优先级 |
|------|------|--------|
| 生活号 | 生活号窗口组件 | P1 |
| 芝麻信用 | 芝麻授权 | P2 |
| 到店红包 | 营销工具 | P2 |

### 4.4 鸿蒙特性
| 特性 | 实现 | 优先级 |
|------|------|--------|
| 分布式 | 分布式数据管理 | P2 |
| 服务卡片 | 服务卡片模板 | P2 |
| 碰一碰 | NFC 触发 | P3 |

### 4.5 验收标准
- [ ] 微信分享卡片自定义
- [ ] 微信收藏功能可用
- [ ] 支付宝生活号集成
- [ ] 鸿蒙服务卡片可用

---

## 能力 5: 表单 UX 增强

### 5.1 规格定义
所有表单页面必须支持实时验证、键盘感知滚动和自动保存。

### 5.2 实时验证
```typescript
// 验证时机
- onBlur: 字段失焦时验证
- onChange: 可选，防抖后验证
- onSubmit: 提交前全量验证

// 错误展示
- 字段下方红色提示
- 输入框边框变红
- 错误动画（shake）
```

### 5.3 键盘感知滚动
```typescript
// 当键盘弹起时，自动滚动到聚焦的输入框
useKeyboardAware({
  offset: 80, // 额外偏移量
  animation: true, // 平滑滚动
})
```

### 5.4 自动保存
```typescript
// 表单数据自动保存到 localStorage
useFormAutosave({
  key: 'publish-form',
  data: formData,
  delay: 1000, // 防抖 1s
})
```

### 5.5 验收标准
- [ ] 所有表单有实时验证
- [ ] 键盘弹起时输入框可见
- [ ] 表单数据自动保存
- [ ] 验证错误有动画反馈

---

## 能力 6: 性能优化

### 6.1 规格定义
长列表必须使用虚拟化，图片必须渐进式加载，关键路径必须有错误边界。

### 6.2 列表虚拟化
```typescript
// 适用场景
- 商品列表（> 20 项）
- 订单列表（> 20 项）
- 消息列表（> 50 项）
- 评论列表（> 30 项）

// 实现方案
import { VirtualList } from '@tarojs/components'
```

### 6.3 图片优化
```typescript
// 渐进式加载
<LazyImage
  src={url}
  placeholder={<SkeletonImage />}
  error={<ErrorImage />}
  onLoad={() => { /* analytics */ }}
/>

// 响应式尺寸
- 列表缩略图: 200x200
- 详情大图: 750x750
- 头像: 100x100
```

### 6.4 错误边界
```typescript
// 关键路径必须有 ErrorBoundary
<ErrorBoundary fallback={<ErrorPage />}>
  <ProductDetail />
</ErrorBoundary>
```

### 6.5 验收标准
- [ ] 长列表使用虚拟化
- [ ] 图片渐进式加载
- [ ] 关键路径有错误边界
- [ ] React.memo 优化频繁渲染组件
- [ ] 60fps 滚动帧率

---

## 依赖关系

```
触控目标 → 加载状态 → 空状态 → 平台特性 → 表单 UX → 性能优化
    ↓           ↓           ↓           ↓           ↓           ↓
  基础        反馈        引导        集成        交互        体验
```

## 验证方法

1. **单元测试** - 每个组件/ Hook 有测试
2. **集成测试** - 页面流程有测试
3. **E2E 测试** - 关键路径有测试
4. **性能测试** - Lighthouse 基准
5. **手动测试** - 真机测试各平台
