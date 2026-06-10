---
archived-with: 2026-06-10-miniprogram-ux-optimization
status: final
status: final
---
# REMX 小程序 UX 优化 - 技术设计文档

> **Change**: miniprogram-ux-optimization  
> **Status**: Draft  
> **Created**: 2026-06-10  
> **Author**: Sisyphus

---

## 1. 项目背景

### 1.1 项目概述
REMX 是一个基于 Taro 4.2 + React 18 的跨平台二手交易小程序，支持微信、支付宝、鸿蒙等平台。包含 64 个页面模块，覆盖电商、社区、管理等功能。

### 1.2 当前状态
| 维度 | 现状 |
|------|------|
| 框架 | Taro 4.2.0 + React 18 |
| UI 库 | NutUI React Taro 3.1.0-beta |
| 样式 | SCSS 变量系统，无 Tailwind |
| 状态管理 | Zustand 5 + persist |
| 动画 | 仅 CSS @keyframes，无 Framer Motion |
| 暗黑模式 | ❌ 未实现 |
| 图标 | PNG + Emoji，未使用 SVG |

### 1.3 问题识别
通过 4 个并行探索代理分析发现：
1. **触控目标不一致** - 部分可交互元素 < 48px
2. **加载状态不统一** - 有 Skeleton 但未全面应用
3. **空状态缺失** - 部分列表无空状态设计
4. **平台特性未适配** - 仅基础分享配置
5. **表单 UX 粗糙** - 无实时验证、无自动保存
6. **性能可优化** - 长列表未虚拟化

---

## 2. 设计目标

### 2.1 核心目标
1. **触控体验标准化** - 所有可交互元素 ≥ 48px
2. **加载状态统一** - 骨架屏覆盖所有列表页
3. **空状态完善** - 每个列表页都有漂亮的空状态
4. **平台特性适配** - 微信/支付宝/鸿蒙原生特性
5. **表单 UX 增强** - 实时验证 + 自动保存
6. **性能优化** - 列表虚拟化 + 图片优化

### 2.2 成功指标
| 指标 | 目标 |
|------|------|
| 触控合规率 | 100% 元素 ≥ 48px |
| 骨架屏覆盖 | 100% 列表页 |
| 空状态覆盖 | 100% 列表页 |
| 页面加载时间 | < 2s (3G) |
| 列表滚动帧率 | 60fps (中端设备) |
| 表单完成率 | +15% 提升 |

---

## 3. 技术架构

### 3.1 组件层次
```
src/
├── components/
│   ├── ui/                    # 基础 UI 组件
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Input/
│   ├── feedback/              # 反馈组件
│   │   ├── Skeleton/
│   │   ├── EmptyState/
│   │   └── ErrorBoundary/
│   └── layout/                # 布局组件
│       ├── PageContainer/
│       └── ScrollView/
├── hooks/                     # 自定义 Hooks
│   ├── useKeyboardAware.ts
│   ├── usePullToRefresh.ts
│   └── useVirtualList.ts
└── utils/                     # 工具函数
    ├── platform.ts
    └── haptic.ts
```

### 3.2 设计 Token 扩展
```scss
// 新增：触控目标
$touch-min: 48px;
$touch-comfortable: 56px;

// 新增：动画时长
$duration-fast: 150ms;
$duration-normal: 300ms;
$duration-slow: 500ms;

// 新增：缓动函数
$ease-out: cubic-bezier(0.16, 1, 0.3, 1);
$ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### 3.3 平台适配层
```typescript
// utils/platform.ts 扩展
export const PlatformFeatures = {
  wechat: {
    shareCard: true,
    favorite: true,
    templateMessage: true,
  },
  alipay: {
    lifeAccount: true,
    creditScore: true,
  },
  harmony: {
    distributed: true,
    serviceWidget: true,
  },
}
```

---

## 4. 实现方案

### 4.1 触控目标标准化

**方案**: 创建 `touch-target` mixin，强制所有交互元素 ≥ 48px

```scss
@mixin touch-target($min-height: 48px) {
  min-height: $min-height;
  min-width: $min-height;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

**应用范围**:
- Button 组件
- Tab 栏项目
- 列表项点击区域
- 表单提交按钮
- 所有可点击的图标/图片

### 4.2 加载状态策略

**方案**: 统一使用 Skeleton 组件，替换所有 Loading spinner

**已有组件**: `src/shared/components/Skeleton/index.tsx`
- 支持 `card`、`list`、`detail` 三种布局

**新增变体**:
- `SkeletonProfile` - 个人资料页
- `SkeletonProduct` - 商品详情页
- `SkeletonChat` - 聊天列表

### 4.3 空状态设计

**方案**: 扩展现有 `Empty` 组件，添加场景化变体

**已有组件**: `src/shared/components/Empty/index.tsx`

**新增变体**:
- `EmptyOrders` - 订单空状态
- `EmptyFavorites` - 收藏空状态
- `EmptySearch` - 搜索空状态
- `EmptyChat` - 聊天空状态
- `EmptyCommunity` - 社区动态空状态

### 4.4 平台特性适配

**方案**: 基于 `utils/platform.ts` 扩展平台能力检测

**微信**:
- 分享卡片自定义（`onShareAppMessage`）
- 收藏功能（`wx.addCard`）
- 模板消息（订阅通知）

**支付宝**:
- 生活号集成
- 芝麻信用展示

**鸿蒙**:
- 分布式能力
- 服务卡片

### 4.5 表单 UX 增强

**方案**: 创建表单 hooks + 实时验证

```typescript
// hooks/useFormValidation.ts
export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validate = (field: string, value: any) => { ... }
  const validateAll = () => { ... }
  
  return { errors, validate, validateAll }
}

// hooks/useFormAutosave.ts
export function useFormAutosave(key: string, data: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data))
    }, 1000)
    return () => clearTimeout(timer)
  }, [data])
}
```

### 4.6 性能优化

**方案**: 列表虚拟化 + 图片优化

**虚拟化**:
```typescript
// 使用 Taro VirtualList 或 react-window
import { VirtualList } from '@tarojs/components'
```

**图片优化**:
- 渐进式加载（已有 LazyImage）
- WebP 格式支持
- 响应式图片尺寸

---

## 5. 测试策略

### 5.1 单元测试
- 组件渲染测试
- Hook 行为测试
- 工具函数测试

### 5.2 集成测试
- 页面流程测试
- 表单提交测试
- 平台特性测试

### 5.3 E2E 测试
- 关键用户路径
- 性能基准测试
- 跨平台兼容性

---

## 6. 迁移计划

| 阶段 | 内容 | 周期 |
|------|------|------|
| Phase 1 | 核心组件（Button, Card, Input） | 第 1 周 |
| Phase 2 | 加载/空状态 | 第 2 周 |
| Phase 3 | 导航优化 | 第 3 周 |
| Phase 4 | 平台特性 | 第 4 周 |
| Phase 5 | 表单 UX | 第 5 周 |
| Phase 6 | 性能优化 | 第 6 周 |
| Phase 7 | 测试打磨 | 第 7 周 |

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| NutUI 版本兼容 | 中 | 锁定版本，充分测试 |
| 平台差异 | 高 | 抽象平台层，逐平台适配 |
| 性能回归 | 中 | 基准测试，持续监控 |
| 用户习惯变化 | 低 | 渐进式更新，A/B 测试 |

---

## 8. 附录

### 8.1 相关文件
- `src/styles/variables.scss` - 设计 Token
- `src/styles/mixins.scss` - SCSS Mixins
- `src/shared/components/` - 共享组件
- `src/domains/*/store.ts` - Zustand Stores

### 8.2 参考资源
- [微信小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)
- [支付宝小程序设计规范](https://opendocs.alipay.com/mini/design)
- [鸿蒙应用开发指南](https://developer.huawei.com/consumer/cn/doc/development)
