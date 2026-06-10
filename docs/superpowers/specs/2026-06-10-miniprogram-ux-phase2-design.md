---
comet_change: miniprogram-ux-phase2
role: technical-design
canonical_spec: openspec
---

# REMX 小程序 UX 优化 - 第二阶段 技术设计文档

## 1. 项目背景

### 1.1 项目概述
REMX 是基于 Taro 4.2 + React 18 的跨平台二手交易小程序。第一阶段已完成核心 UX 优化（触控目标、骨架屏、空状态、表单 Hooks），第二阶段需要改进导航体验、平台集成、性能优化和测试覆盖。

### 1.2 当前状态
| 维度 | 现状 |
|------|------|
| 导航 | 无页面过渡动画、无返回顶部、无面包屑 |
| 平台 | 微信分享已实现，订阅/卡包/支付宝/鸿蒙未实现 |
| 性能 | 无虚拟化、无 React.memo、无图片格式优化 |
| 测试 | 无测试框架、无测试文件 |

---

## 2. 设计目标

### 2.1 核心目标
1. **导航体验增强** - 页面过渡动画、返回顶部、面包屑导航
2. **平台特性充分利用** - 微信订阅/卡包、支付宝生活号/芝麻信用、鸿蒙卡片
3. **性能优化** - 列表虚拟化、React.memo、图片优化
4. **质量保障** - 单元测试、E2E 测试、性能测试

### 2.2 成功指标
| 指标 | 目标 |
|------|------|
| 页面过渡动画 | 主要页面 100% 覆盖 |
| 返回顶部按钮 | 长列表 100% 覆盖 |
| 面包屑导航 | 深层页面 100% 覆盖 |
| 列表滚动帧率 | 60fps (中端设备) |
| 单元测试覆盖率 | > 60% |
| E2E 测试覆盖 | 核心路径 100% |

---

## 3. 技术架构

### 3.1 导航增强模块

#### 3.1.1 页面过渡动画
**方案**: Taro pageTransition + CSS 动画

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
- TabBar 页面: 淡入 (fade-in)
- 详情页面: 从右侧滑入 (slide-in-right)
- 模态页面: 从底部滑入 (slide-in-bottom)

**应用范围**:
- TabBar: 首页、分类、发布、消息、我的
- 详情页: 商品详情、订单详情、用户详情
- 编辑页: 发布编辑、地址编辑

#### 3.1.2 返回顶部按钮
**方案**: 自定义 BackTop 组件

```typescript
// shared/components/BackTop/index.tsx
interface BackTopProps {
  threshold?: number;    // 显示阈值，默认 300px
  duration?: number;     // 滚动动画时长，默认 300ms
  visibilityHeight?: number; // 显示高度
}
```

**实现细节**:
- 使用 ScrollView 的 onScroll 事件
- 超过阈值时显示浮动按钮
- 点击后平滑滚动到顶部
- 支持自定义图标和位置

**应用范围**:
- 首页商品列表
- 分类商品列表
- 订单列表
- 消息列表

#### 3.1.3 面包屑导航
**方案**: 自定义 Breadcrumb 组件

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
- 使用 useRouter 获取当前页面路径
- 维护路由历史栈（Context）
- 支持点击跳转和当前页高亮
- 响应式设计

**应用范围**:
- 商品详情: 首页 > 分类 > 商品详情
- 订单详情: 我的 > 订单 > 订单详情
- 聊天: 消息 > 聊天

#### 3.1.4 页面栈管理
**方案**: NavigationService 工具

```typescript
// shared/utils/navigation.ts
export const NavigationService = {
  safeNavigateTo: async (url: string) => {
    const pages = Taro.getCurrentPages();
    if (pages.length >= 10) {
      return Taro.redirectTo({ url });
    }
    return Taro.navigateTo({ url });
  },
  
  smartNavigateBack: (delta = 1) => {
    const pages = Taro.getCurrentPages();
    if (pages.length <= 1) {
      return Taro.switchTab({ url: '/pages/index/index' });
    }
    return Taro.navigateBack({ delta });
  }
};
```

---

### 3.2 平台集成模块

#### 3.2.1 微信订阅消息
**方案**: SubscribeService 工具

```typescript
// shared/utils/subscribe.ts
export const SubscribeService = {
  requestPermission: async (templateIds: string[]) => {
    try {
      const res = await Taro.requestSubscribeMessage({
        entityIds: templateIds
      });
      return res;
    } catch (err) {
      console.error('订阅消息权限请求失败:', err);
      return null;
    }
  },
  
  sendNotification: async (userId: string, templateId: string, data: any) => {
    // 调用后端 API 发送订阅消息
  }
};
```

**应用场景**:
- 订单状态更新通知
- 支付成功确认
- 优惠券到期提醒

#### 3.2.2 微信卡包
**方案**: CardService 工具

```typescript
// shared/utils/card.ts
export const CardService = {
  addCard: async (cardInfo: {
    cardId: string;
    cardExt: string;
  }) => {
    try {
      await Taro.addCard({
        cardList: [{
          cardId: cardInfo.cardId,
          cardExt: cardInfo.cardExt
        }]
      });
      return true;
    } catch (err) {
      console.error('添加卡失败:', err);
      return false;
    }
  }
};
```

**应用场景**:
- 优惠券添加到卡包
- 会员卡添加
- 活动卡添加

#### 3.2.3 支付宝生活号
**方案**: LifeAccountService 工具

```typescript
// shared/utils/lifeAccount.ts
export const LifeAccountService = {
  openLifeAccount: async () => {
    try {
      await Taro.openLifeAccount({});
      return true;
    } catch (err) {
      console.error('打开生活号失败:', err);
      return false;
    }
  },
  
  checkFollowStatus: async () => {
    // 检查用户是否关注生活号
  }
};
```

#### 3.2.4 支付宝芝麻信用
**方案**: CreditScoreService 工具

```typescript
// shared/utils/creditScore.ts
export const CreditScoreService = {
  requestAuth: async () => {
    try {
      const res = await Taro.getAuthCode({
        scopes: 'auth_base'
      });
      return res;
    } catch (err) {
      console.error('信用授权失败:', err);
      return null;
    }
  }
};
```

#### 3.2.5 支付宝支付
**方案**: 更新支付页面

```typescript
// pages/order/pay/index.tsx
const PayPage = () => {
  const { platform } = useRouter();
  
  return (
    <View>
      {platform === 'weapp' && <WechatPayButton />}
      {platform === 'alipay' && <AlipayButton />}
    </View>
  );
};
```

#### 3.2.6 鸿蒙服务卡片
**方案**: 配置文件

```json
// config/harmony-widget.json
{
  "widget": {
    "name": "REMX",
    "description": "二手交易小程序",
    "src": "./pages/index/index",
    "data": {
      "interval": 3600
    }
  }
}
```

---

### 3.3 性能优化模块

#### 3.3.1 列表虚拟化
**方案**: react-virtualized

```typescript
// shared/components/VirtualList/index.tsx
interface VirtualListProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}
```

**应用场景**:
- 首页商品列表
- 分类商品列表
- 订单列表
- 消息列表

#### 3.3.2 React.memo 优化
**方案**: 为展示组件添加 memo

```typescript
// shared/components/product/ProductCard/index.tsx
const ProductCard = React.memo(({ product, onTap }: ProductCardProps) => {
  // 组件实现
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price;
});
```

**需要优化的组件**:
- ProductCard
- PostCard
- LazyImage
- Skeleton
- Empty
- Avatar
- RetryButton

#### 3.3.3 图片优化
**方案**: ImageService 工具

```typescript
// shared/utils/image.ts
export const ImageService = {
  getOptimalImage: (src: string, width: number) => {
    const supportsWebP = checkWebPSupport();
    const supportsAVIF = checkAVIFSupport();
    
    if (supportsAVIF) {
      return `${src}?format=avif&width=${width}`;
    } else if (supportsWebP) {
      return `${src}?format=webp&width=${width}`;
    }
    return `${src}?width=${width}`;
  }
};
```

#### 3.3.4 代码分割优化
**方案**: Vite splitChunks 配置

```typescript
// config/vite.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-taro': ['@tarojs/taro', '@tarojs/components'],
          'vendor-nutui': ['@nutui/nutui-react-taro']
        }
      }
    }
  }
};
```

---

### 3.4 测试模块

#### 3.4.1 单元测试 (Vitest)
**方案**: Vitest + React Testing Library

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
```

**测试范围**:
- 工具函数测试
- Hooks 测试
- 组件渲染测试

#### 3.4.2 E2E 测试 (Playwright)
**方案**: Playwright + miniprogram-automator

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 375, height: 667 }
  }
});
```

**测试场景**:
- 用户登录流程
- 商品浏览和搜索
- 下单支付流程
- 消息聊天流程

---

## 4. 数据流

### 4.1 导航数据流
```
用户操作
    ↓
NavigationService.safeNavigateTo()
    ↓
页面栈检查 (getCurrentPages)
    ↓
跳转/返回
    ↓
页面过渡动画 (pageTransition)
    ↓
目标页面渲染
```

### 4.2 平台集成数据流
```
用户触发平台功能
    ↓
PlatformService (Subscribe/Card/LifeAccount)
    ↓
Taro API 调用
    ↓
平台响应
    ↓
UI 更新
```

### 4.3 性能优化数据流
```
列表数据加载
    ↓
VirtualList 组件
    ↓
虚拟滚动渲染
    ↓
用户滚动
    ↓
动态加载/卸载
```

---

## 5. 技术选型

| 模块 | 技术方案 | 理由 |
|------|----------|------|
| 页面过渡 | Taro pageTransition + CSS | 原生支持，性能好 |
| 返回顶部 | 自定义组件 | 轻量，可控 |
| 面包屑 | 自定义组件 | 灵活，符合小程序习惯 |
| 列表虚拟化 | react-virtualized | 成熟稳定，社区支持 |
| 单元测试 | Vitest | 快速，与 Vite 集成 |
| E2E 测试 | Playwright | 跨平台，功能强大 |

---

## 6. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 页面过渡动画卡顿 | 用户体验差 | 使用 CSS 动画，避免 JS 动画 |
| 虚拟化列表内存泄漏 | 应用崩溃 | 正确清理事件监听 |
| 平台 API 兼容性 | 功能不可用 | 降级处理，提示用户 |
| 测试覆盖率不足 | 质量风险 | 优先测试核心路径 |

---

## 7. 实施顺序

1. **Week 1**: Phase 3 导航优化（过渡动画、返回顶部、面包屑）
2. **Week 2**: Phase 4 平台集成（与 Week 1 并行）
3. **Week 3**: Phase 6 性能优化（虚拟化、React.memo）
4. **Week 4**: Phase 7 测试（单元测试、E2E 测试）

---

## 8. 验收标准

### Phase 3
- [ ] 主要页面有过渡动画
- [ ] 长列表有返回顶部按钮
- [ ] 深层页面有面包屑导航
- [ ] 页面栈无深度溢出

### Phase 4
- [ ] 微信订阅消息可用
- [ ] 微信卡包功能可用
- [ ] 支付宝生活号入口可用
- [ ] 支付宝芝麻信用授权可用
- [ ] 支付宝支付可用
- [ ] 鸿蒙服务卡片可用

### Phase 6
- [ ] 长列表滚动 60fps
- [ ] 所有展示组件使用 React.memo
- [ ] 图片加载时间减少 30%
- [ ] 首屏加载时间减少 20%

### Phase 7
- [ ] 单元测试覆盖率 > 60%
- [ ] E2E 测试覆盖核心路径
- [ ] 性能测试通过
