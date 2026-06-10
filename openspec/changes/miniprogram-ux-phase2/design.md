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
    if (pages.length <= 1) {
      // 栈底，跳转到首页
      return Taro.switchTab({ url: '/pages/index/index' });
    }
    return Taro.navigateBack({ delta });
  }
};
```

### 2. 平台集成模块

#### 2.1 微信订阅消息
**方案**: 创建订阅消息工具 + 权限管理

```typescript
// shared/utils/subscribe.ts
export const SubscribeService = {
  // 请求订阅消息权限
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
  
  // 发送订阅消息（后端调用）
  sendNotification: async (userId: string, templateId: string, data: any) => {
    // 调用后端 API 发送订阅消息
  }
};
```

**应用场景**:
- 订单状态更新通知
- 支付成功确认
- 优惠券到期提醒

#### 2.2 微信卡包
**方案**: 创建卡包管理组件

```typescript
// shared/utils/card.ts
export const CardService = {
  // 添加卡到卡包
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

#### 2.3 支付宝生活号
**方案**: 创建生活号入口组件

```typescript
// shared/utils/lifeAccount.ts
export const LifeAccountService = {
  // 打开生活号
  openLifeAccount: async () => {
    try {
      await Taro.openLifeAccount({
        // 配置参数
      });
      return true;
    } catch (err) {
      console.error('打开生活号失败:', err);
      return false;
    }
  },
  
  // 检查是否关注
  checkFollowStatus: async () => {
    // 检查用户是否关注生活号
  }
};
```

#### 2.4 支付宝芝麻信用
**方案**: 创建信用授权组件

```typescript
// shared/utils/creditScore.ts
export const CreditScoreService = {
  // 请求信用授权
  requestAuth: async () => {
    try {
      const res = await Taro.getAuthCode({
        scopes: 'auth_base'
      });
      // 调用后端获取芝麻信用分
      return res;
    } catch (err) {
      console.error('信用授权失败:', err);
      return null;
    }
  }
};
```

#### 2.5 鸿蒙服务卡片
**方案**: 创建服务卡片配置

```typescript
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

### 3. 性能优化模块

#### 3.1 列表虚拟化
**方案**: 使用 `react-virtualized` 或 Taro 内置虚拟列表

```typescript
// shared/components/VirtualList/index.tsx
interface VirtualListProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;  // 预渲染数量
}
```

**应用场景**:
- 首页商品列表
- 分类商品列表
- 订单列表
- 消息列表

#### 3.2 React.memo 优化
**方案**: 为所有展示组件添加 memo

```typescript
// shared/components/product/ProductCard/index.tsx
const ProductCard = React.memo(({ product, onTap }: ProductCardProps) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较函数
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

#### 3.3 图片优化
**方案**: 添加 WebP/AVIF 支持 + 响应式图片

```typescript
// shared/utils/image.ts
export const ImageService = {
  // 获取最优格式图片
  getOptimalImage: (src: string, width: number) => {
    // 检查浏览器支持
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

#### 3.4 代码分割优化
**方案**: 自定义 Vite splitChunks 配置

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

### 4. 测试模块

#### 4.1 单元测试 (Vitest)
**方案**: 配置 Vitest + React Testing Library

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

#### 4.2 E2E 测试 (Playwright)
**方案**: 配置 Playwright + miniprogram-automator

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

## 技术选型

| 模块 | 技术方案 | 理由 |
|------|----------|------|
| 页面过渡 | Taro pageTransition + CSS | 原生支持，性能好 |
| 返回顶部 | 自定义组件 | 轻量，可控 |
| 面包屑 | 自定义组件 | 灵活，符合小程序习惯 |
| 列表虚拟化 | react-virtualized | 成熟稳定，社区支持 |
| 单元测试 | Vitest | 快速，与 Vite 集成 |
| E2E 测试 | Playwright | 跨平台，功能强大 |

## 数据流

```
用户操作
    ↓
导航服务 (NavigationService)
    ↓
页面栈检查
    ↓
跳转/返回
    ↓
页面过渡动画
    ↓
目标页面渲染
```

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 页面过渡动画卡顿 | 用户体验差 | 使用 CSS 动画，避免 JS 动画 |
| 虚拟化列表内存泄漏 | 应用崩溃 | 正确清理事件监听 |
| 平台 API 兼容性 | 功能不可用 | 降级处理，提示用户 |
| 测试覆盖率不足 | 质量风险 | 优先测试核心路径 |

## 实施顺序

1. **Week 1**: 导航增强（过渡动画、返回顶部）
2. **Week 2**: 平台集成（微信、支付宝、鸿蒙）
3. **Week 3**: 性能优化（虚拟化、React.memo）
4. **Week 4**: 测试（单元测试、E2E 测试）
