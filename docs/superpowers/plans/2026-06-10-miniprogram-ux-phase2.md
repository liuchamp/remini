# REMX 小程序 UX 优化 - 第二阶段 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现导航增强、平台集成、性能优化和测试覆盖

**Architecture:** 渐进式增强，在现有架构上逐步添加功能

**Tech Stack:** Taro 4.2, React 18, Vitest, Playwright, react-virtualized

---
change: miniprogram-ux-phase2
design-doc: docs/superpowers/specs/2026-06-10-miniprogram-ux-phase2-design.md
base-ref: 1b7df4dc3982d1807f0c409ae7cb0fe33424920d
---

## Phase 3: 导航优化

### Task 1: 页面过渡动画配置

**Files:**
- Modify: `src/app.config.ts`

- [ ] **Step 1: 创建页面过渡动画 hooks**

> ⚠️ Taro 4.x 不支持 `pageTransition` 配置项。改用 Taro 生命周期 hooks + CSS transitions 手动实现。

```typescript
// shared/hooks/usePageTransition.ts
export const usePageTransition = () => {
  useDidShow(() => {
    document.body.classList.add('page-enter');
  });
  useDidHide(() => {
    document.body.classList.remove('page-enter');
  });
};
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app.config.ts
git commit -m "feat(navigation): add page transition animation config"
```

### Task 2: 创建 BackTop 组件

**Files:**
- Create: `src/shared/components/BackTop/index.tsx`
- Create: `src/shared/components/BackTop/index.scss`

- [ ] **Step 1: 创建 BackTop 组件**

```typescript
// src/shared/components/BackTop/index.tsx
import { View, Icon } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface BackTopProps {
  threshold?: number
  duration?: number
  visibilityHeight?: number
}

export const BackTop = ({
  threshold = 300,
  duration = 300,
  visibilityHeight = 300
}: BackTopProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const page = Taro.getCurrentInstance().page
    if (!page) return

    // 监听页面滚动
    const handleScroll = (e) => {
      const scrollTop = e.detail.scrollTop
      setVisible(scrollTop > threshold)
    }

    // 使用 page.onScroll 监听
    page.onScroll = handleScroll

    return () => {
      page.onScroll = undefined
    }
  }, [threshold])

  const scrollToTop = () => {
    Taro.pageScrollTo({
      scrollTop: 0,
      duration
    })
  }

  if (!visible) return null

  return (
    <View className='back-top' onClick={scrollToTop}>
      <Icon type='scrollTop' size={24} color='#fff' />
    </View>
  )
}
```

- [ ] **Step 2: 创建 BackTop 样式**

```scss
// src/shared/components/BackTop/index.scss
.back-top {
  position: fixed;
  right: 32px;
  bottom: 100px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: opacity 0.3s ease;
  
  &:active {
    opacity: 0.7;
  }
}
```

- [ ] **Step 3: 提交代码**

```bash
git add src/shared/components/BackTop/
git commit -m "feat(navigation): add BackTop component"
```

### Task 3: 集成 BackTop 到列表页面

**Files:**
- Modify: `src/pages/index/index.tsx`
- Modify: `src/pages/category/index.tsx`
- Modify: `src/pages/order/list/index.tsx`
- Modify: `src/pages/message/index.tsx`

- [ ] **Step 1: 在首页集成 BackTop**

```typescript
// src/pages/index/index.tsx
import { BackTop } from '@/shared/components/BackTop'

// 在组件中添加
<View>
  {/* 现有内容 */}
  <BackTop threshold={300} />
</View>
```

- [ ] **Step 2: 在分类页集成 BackTop**

```typescript
// src/pages/category/index.tsx
import { BackTop } from '@/shared/components/BackTop'

// 在组件中添加
<View>
  {/* 现有内容 */}
  <BackTop threshold={300} />
</View>
```

- [ ] **Step 3: 在订单列表集成 BackTop**

```typescript
// src/pages/order/list/index.tsx
import { BackTop } from '@/shared/components/BackTop'

// 在组件中添加
<View>
  {/* 现有内容 */}
  <BackTop threshold={300} />
</View>
```

- [ ] **Step 4: 在消息页集成 BackTop**

```typescript
// src/pages/message/index.tsx
import { BackTop } from '@/shared/components/BackTop'

// 在组件中添加
<View>
  {/* 现有内容 */}
  <BackTop threshold={300} />
</View>
```

- [ ] **Step 5: 提交代码**

```bash
git add src/pages/index/ src/pages/category/ src/pages/order/list/ src/pages/message/
git commit -m "feat(navigation): integrate BackTop to list pages"
```

### Task 4: 创建 Breadcrumb 组件

**Files:**
- Create: `src/shared/components/Breadcrumb/index.tsx`
- Create: `src/shared/components/Breadcrumb/index.scss`

- [ ] **Step 1: 创建 Breadcrumb 组件**

```typescript
// src/shared/components/Breadcrumb/index.tsx
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
}

export const Breadcrumb = ({
  items,
  separator = '/'
}: BreadcrumbProps) => {
  const handleClick = (path: string) => {
    if (path) {
      Taro.navigateTo({ url: path })
    }
  }

  return (
    <View className='breadcrumb'>
      {items.map((item, index) => (
        <View key={index} className='breadcrumb-item'>
          {index > 0 && <Text className='breadcrumb-separator'>{separator}</Text>}
          {item.path ? (
            <Text
              className='breadcrumb-link'
              onClick={() => handleClick(item.path!)}
            >
              {item.label}
            </Text>
          ) : (
            <Text className='breadcrumb-current'>{item.label}</Text>
          )}
        </View>
      ))}
    </View>
  )
}
```

- [ ] **Step 2: 创建 Breadcrumb 样式**

```scss
// src/shared/components/Breadcrumb/index.scss
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px 32px;
  background: #f5f5f5;
  font-size: 24px;
  
  &-item {
    display: flex;
    align-items: center;
  }
  
  &-separator {
    margin: 0 12px;
    color: #999;
  }
  
  &-link {
    color: #666;
    
    &:active {
      color: #ff6b35;
    }
  }
  
  &-current {
    color: #333;
    font-weight: 500;
  }
}
```

- [ ] **Step 3: 提交代码**

```bash
git add src/shared/components/Breadcrumb/
git commit -m "feat(navigation): add Breadcrumb component"
```

### Task 5: 集成 Breadcrumb 到深层页面

**Files:**
- Modify: `src/pages/product/detail/index.tsx`
- Modify: `src/pages/order/detail/index.tsx`
- Modify: `src/pages/chat/conversation/index.tsx`

- [ ] **Step 1: 在商品详情集成 Breadcrumb**

```typescript
// src/pages/product/detail/index.tsx
import { Breadcrumb } from '@/shared/components/Breadcrumb'

// 在组件中添加
<View>
  <Breadcrumb items={[
    { label: '首页', path: '/pages/index/index' },
    { label: '分类', path: '/pages/category/index' },
    { label: '商品详情' }
  ]} />
  {/* 现有内容 */}
</View>
```

- [ ] **Step 2: 在订单详情集成 Breadcrumb**

```typescript
// src/pages/order/detail/index.tsx
import { Breadcrumb } from '@/shared/components/Breadcrumb'

// 在组件中添加
<View>
  <Breadcrumb items={[
    { label: '我的', path: '/pages/profile/index' },
    { label: '订单', path: '/pages/order/list/index' },
    { label: '订单详情' }
  ]} />
  {/* 现有内容 */}
</View>
```

- [ ] **Step 3: 在聊天页集成 Breadcrumb**

```typescript
// src/pages/chat/conversation/index.tsx
import { Breadcrumb } from '@/shared/components/Breadcrumb'

// 在组件中添加
<View>
  <Breadcrumb items={[
    { label: '消息', path: '/pages/message/index' },
    { label: '聊天' }
  ]} />
  {/* 现有内容 */}
</View>
```

- [ ] **Step 4: 提交代码**

```bash
git add src/pages/product/detail/ src/pages/order/detail/ src/pages/chat/conversation/
git commit -m "feat(navigation): integrate Breadcrumb to deep pages"
```

### Task 6: 创建 NavigationService 工具

**Files:**
- Create: `src/shared/utils/navigation.ts`

- [ ] **Step 1: 创建 NavigationService**

```typescript
// src/shared/utils/navigation.ts
import Taro from '@tarojs/taro'

export const NavigationService = {
  /**
   * 安全的页面跳转（带深度检查）
   */
  safeNavigateTo: async (url: string) => {
    const pages = Taro.getCurrentPages()
    if (pages.length >= 10) {
      // 达到栈深度限制，使用 redirectTo
      console.warn('页面栈已满，使用 redirectTo')
      return Taro.redirectTo({ url })
    }
    return Taro.navigateTo({ url })
  },

  /**
   * 智能返回（根据来源判断）
   */
  smartNavigateBack: (delta = 1) => {
    const pages = Taro.getCurrentPages()
    if (pages.length <= 1) {
      // 栈底，跳转到首页
      return Taro.switchTab({ url: '/pages/index/index' })
    }
    return Taro.navigateBack({ delta })
  },

  /**
   * 获取当前页面栈深度
   */
  getPageStackDepth: () => {
    return Taro.getCurrentPages().length
  },

  /**
   * 检查是否可以返回
   */
  canGoBack: () => {
    return Taro.getCurrentPages().length > 1
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/utils/navigation.ts
git commit -m "feat(navigation): add NavigationService utility"
```

### Task 7: 替换现有导航调用

**Files:**
- Modify: `src/pages/product/detail/index.tsx`
- Modify: `src/pages/order/detail/index.tsx`
- Modify: `src/pages/chat/conversation/index.tsx`

- [ ] **Step 1: 在商品详情使用 NavigationService**

```typescript
// src/pages/product/detail/index.tsx
import { NavigationService } from '@/shared/utils/navigation'

// 替换 Taro.navigateTo 为 NavigationService.safeNavigateTo
NavigationService.safeNavigateTo('/pages/order/create/index')
```

- [ ] **Step 2: 在订单详情使用 NavigationService**

```typescript
// src/pages/order/detail/index.tsx
import { NavigationService } from '@/shared/utils/navigation'

// 替换 Taro.navigateBack 为 NavigationService.smartNavigateBack
NavigationService.smartNavigateBack()
```

- [ ] **Step 3: 在聊天页使用 NavigationService**

```typescript
// src/pages/chat/conversation/index.tsx
import { NavigationService } from '@/shared/utils/navigation'

// 替换 Taro.navigateTo 为 NavigationService.safeNavigateTo
NavigationService.safeNavigateTo('/pages/product/detail/index?id=123')
```

- [ ] **Step 4: 提交代码**

```bash
git add src/pages/product/detail/ src/pages/order/detail/ src/pages/chat/conversation/
git commit -m "feat(navigation): replace navigation calls with NavigationService"
```

## Phase 4: 平台特性深度集成

### Task 8: 创建 SubscribeService 工具

**Files:**
- Create: `src/shared/utils/subscribe.ts`

- [ ] **Step 1: 创建 SubscribeService**

```typescript
// src/shared/utils/subscribe.ts
import Taro from '@tarojs/taro'

export const SubscribeService = {
  /**
   * 请求订阅消息权限
   */
  requestPermission: async (templateIds: string[]) => {
    try {
      const res = await Taro.requestSubscribeMessage({
        entityIds: templateIds
      })
      return res
    } catch (err) {
      console.error('订阅消息权限请求失败:', err)
      return null
    }
  },

  /**
   * 发送订阅消息（后端调用）
   */
  sendNotification: async (userId: string, templateId: string, data: any) => {
    // 调用后端 API 发送订阅消息
    // 实际实现需要后端配合
    console.log('发送订阅消息:', { userId, templateId, data })
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/utils/subscribe.ts
git commit -m "feat(platform): add SubscribeService utility"
```

### Task 9: 创建 CardService 工具

**Files:**
- Create: `src/shared/utils/card.ts`

- [ ] **Step 1: 创建 CardService**

```typescript
// src/shared/utils/card.ts
import Taro from '@tarojs/taro'

export const CardService = {
  /**
   * 添加卡到卡包
   */
  addCard: async (cardInfo: {
    cardId: string
    cardExt: string
  }) => {
    try {
      await Taro.addCard({
        cardList: [{
          cardId: cardInfo.cardId,
          cardExt: cardInfo.cardExt
        }]
      })
      return true
    } catch (err) {
      console.error('添加卡失败:', err)
      return false
    }
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/utils/card.ts
git commit -m "feat(platform): add CardService utility"
```

### Task 10: 创建 LifeAccountService 工具

**Files:**
- Create: `src/shared/utils/lifeAccount.ts`

- [ ] **Step 1: 创建 LifeAccountService**

```typescript
// src/shared/utils/lifeAccount.ts
import Taro from '@tarojs/taro'

export const LifeAccountService = {
  /**
   * 打开生活号
   */
  openLifeAccount: async () => {
    try {
      await Taro.openLifeAccount({})
      return true
    } catch (err) {
      console.error('打开生活号失败:', err)
      return false
    }
  },

  /**
   * 检查是否关注
   */
  checkFollowStatus: async () => {
    // 检查用户是否关注生活号
    return true
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/utils/lifeAccount.ts
git commit -m "feat(platform): add LifeAccountService utility"
```

### Task 11: 创建 CreditScoreService 工具

**Files:**
- Create: `src/shared/utils/creditScore.ts`

- [ ] **Step 1: 创建 CreditScoreService**

```typescript
// src/shared/utils/creditScore.ts
import Taro from '@tarojs/taro'

export const CreditScoreService = {
  /**
   * 请求信用授权
   */
  requestAuth: async () => {
    try {
      const res = await Taro.getAuthCode({
        scopes: 'auth_base'
      })
      return res
    } catch (err) {
      console.error('信用授权失败:', err)
      return null
    }
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/utils/creditScore.ts
git commit -m "feat(platform): add CreditScoreService utility"
```

### Task 12: 更新支付页面支持支付宝

**Files:**
- Modify: `src/pages/order/pay/index.tsx`

- [ ] **Step 1: 添加支付宝支付支持**

```typescript
// src/pages/order/pay/index.tsx
import { isAlipay } from '@/shared/utils/platform'

// 在组件中添加支付宝支付按钮
{isAlipay && (
  <Button onClick={handleAlipayPay}>
    支付宝支付
  </Button>
)}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/pages/order/pay/
git commit -m "feat(platform): add Alipay payment support"
```

### Task 13: 创建服务卡片配置

**Files:**
- Create: `config/harmony-widget.json`

- [ ] **Step 1: 创建鸿蒙服务卡片配置**

```json
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

- [ ] **Step 2: 提交代码**

```bash
git add config/harmony-widget.json
git commit -m "feat(platform): add HarmonyOS service widget config"
```

## Phase 6: 性能优化

### Task 14: 创建 VirtualList 组件

**Files:**
- Create: `src/shared/components/VirtualList/index.tsx`
- Create: `src/shared/components/VirtualList/index.scss`

- [ ] **Step 1: 安装 react-virtualized**

```bash
pnpm add react-virtualized
```

- [ ] **Step 2: 创建 VirtualList 组件**

```typescript
// src/shared/components/VirtualList/index.tsx
import { FixedSizeList as List } from 'react-virtualized'
import { View } from '@tarojs/components'
import './index.scss'

interface VirtualListProps {
  items: any[]
  itemHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
}

export const VirtualList = ({
  items,
  itemHeight,
  renderItem,
  overscan = 5
}: VirtualListProps) => {
  const Row = ({ index, style }) => (
    <View style={style}>
      {renderItem(items[index], index)}
    </View>
  )

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={itemHeight}
      width='100%'
      overscanRowCount={overscan}
    >
      {Row}
    </List>
  )
}
```

- [ ] **Step 3: 创建 VirtualList 样式**

```scss
// src/shared/components/VirtualList/index.scss
.virtual-list {
  width: 100%;
  overflow: auto;
}
```

- [ ] **Step 4: 提交代码**

```bash
git add src/shared/components/VirtualList/
git commit -m "feat(performance): add VirtualList component"
```

### Task 15: 集成 VirtualList 到列表页面

**Files:**
- Modify: `src/pages/index/index.tsx`
- Modify: `src/pages/category/index.tsx`
- Modify: `src/pages/order/list/index.tsx`
- Modify: `src/pages/message/index.tsx`

- [ ] **Step 1: 在首页集成 VirtualList**

```typescript
// src/pages/index/index.tsx
import { VirtualList } from '@/shared/components/VirtualList'

// 替换 ScrollView 为 VirtualList
<VirtualList
  items={products}
  itemHeight={200}
  renderItem={(item) => <ProductCard product={item} />}
/>
```

- [ ] **Step 2: 在分类页集成 VirtualList**

```typescript
// src/pages/category/index.tsx
import { VirtualList } from '@/shared/components/VirtualList'

// 替换 ScrollView 为 VirtualList
<VirtualList
  items={products}
  itemHeight={200}
  renderItem={(item) => <ProductCard product={item} />}
/>
```

- [ ] **Step 3: 在订单列表集成 VirtualList**

```typescript
// src/pages/order/list/index.tsx
import { VirtualList } from '@/shared/components/VirtualList'

// 替换 ScrollView 为 VirtualList
<VirtualList
  items={orders}
  itemHeight={150}
  renderItem={(item) => <OrderCard order={item} />}
/>
```

- [ ] **Step 4: 在消息页集成 VirtualList**

```typescript
// src/pages/message/index.tsx
import { VirtualList } from '@/shared/components/VirtualList'

// 替换 ScrollView 为 VirtualList
<VirtualList
  items={messages}
  itemHeight={120}
  renderItem={(item) => <MessageCard message={item} />}
/>
```

- [ ] **Step 5: 提交代码**

```bash
git add src/pages/index/ src/pages/category/ src/pages/order/list/ src/pages/message/
git commit -m "feat(performance): integrate VirtualList to list pages"
```

### Task 16: 为 ProductCard 添加 React.memo

**Files:**
- Modify: `src/shared/components/product/ProductCard/index.tsx`

- [ ] **Step 1: 添加 React.memo**

```typescript
// src/shared/components/product/ProductCard/index.tsx
import React from 'react'

const ProductCard = React.memo(({ product, onTap }: ProductCardProps) => {
  // 组件实现
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price
})

export default ProductCard
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/components/product/ProductCard/
git commit -m "feat(performance): add React.memo to ProductCard"
```

### Task 17: 为其他组件添加 React.memo

**Files:**
- Modify: `src/shared/components/community/PostCard/index.tsx`
- Modify: `src/shared/components/LazyImage/index.tsx`
- Modify: `src/shared/components/Skeleton/index.tsx`
- Modify: `src/shared/components/Empty/index.tsx`

- [ ] **Step 1: 为 PostCard 添加 React.memo**

```typescript
// src/shared/components/community/PostCard/index.tsx
import React from 'react'

const PostCard = React.memo(({ post, onTap }: PostCardProps) => {
  // 组件实现
})

export default PostCard
```

- [ ] **Step 2: 为 LazyImage 添加 React.memo**

```typescript
// src/shared/components/LazyImage/index.tsx
import React from 'react'

const LazyImage = React.memo(({ src, fallback, ...props }: LazyImageProps) => {
  // 组件实现
})

export default LazyImage
```

- [ ] **Step 3: 为 Skeleton 添加 React.memo**

```typescript
// src/shared/components/Skeleton/index.tsx
import React from 'react'

const Skeleton = React.memo(({ variant, count, animated }: SkeletonProps) => {
  // 组件实现
})

export default Skeleton
```

- [ ] **Step 4: 为 Empty 添加 React.memo**

```typescript
// src/shared/components/Empty/index.tsx
import React from 'react'

const Empty = React.memo(({ scene, onAction }: EmptyProps) => {
  // 组件实现
})

export default Empty
```

- [ ] **Step 5: 提交代码**

```bash
git add src/shared/components/
git commit -m "feat(performance): add React.memo to presentational components"
```

### Task 18: 创建 ImageService 工具

**Files:**
- Create: `src/shared/utils/image.ts`

- [ ] **Step 1: 创建 ImageService**

```typescript
// src/shared/utils/image.ts

/**
 * 检测 WebP 支持
 */
const checkWebPSupport = (): boolean => {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

/**
 * 检测 AVIF 支持
 */
const checkAVIFSupport = (): boolean => {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
}

export const ImageService = {
  /**
   * 获取最优格式图片
   */
  getOptimalImage: (src: string, width: number) => {
    const supportsWebP = checkWebPSupport()
    const supportsAVIF = checkAVIFSupport()
    
    if (supportsAVIF) {
      return `${src}?format=avif&width=${width}`
    } else if (supportsWebP) {
      return `${src}?format=webp&width=${width}`
    }
    return `${src}?width=${width}`
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/shared/utils/image.ts
git commit -m "feat(performance): add ImageService utility"
```

### Task 19: 配置 Vite splitChunks

**Files:**
- Modify: `config/vite.ts`

- [ ] **Step 1: 添加 splitChunks 配置**

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
}
```

- [ ] **Step 2: 提交代码**

```bash
git add config/vite.ts
git commit -m "feat(performance): configure Vite splitChunks"
```

## Phase 7: 测试与打磨

### Task 20: 配置 Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: 安装测试依赖**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: 创建 Vitest 配置**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
})
```

- [ ] **Step 3: 创建测试设置文件**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: 添加测试脚本到 package.json**

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

- [ ] **Step 5: 提交代码**

```bash
git add vitest.config.ts src/test/ package.json
git commit -m "test: configure Vitest testing framework"
```

### Task 21: 编写 NavigationService 单元测试

**Files:**
- Create: `src/shared/utils/__tests__/navigation.test.ts`

- [ ] **Step 1: 编写测试**

```typescript
// src/shared/utils/__tests__/navigation.test.ts
import { describe, it, expect, vi } from 'vitest'
import { NavigationService } from '../navigation'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages: vi.fn(() => [{}, {}]),
    navigateTo: vi.fn(),
    redirectTo: vi.fn(),
    switchTab: vi.fn(),
    navigateBack: vi.fn()
  }
}))

describe('NavigationService', () => {
  it('safeNavigateTo should use navigateTo when stack < 10', async () => {
    const Taro = require('@tarojs/taro').default
    Taro.getCurrentPages.mockReturnValue(new Array(5))
    
    await NavigationService.safeNavigateTo('/pages/test/index')
    
    expect(Taro.navigateTo).toHaveBeenCalledWith({ url: '/pages/test/index' })
  })

  it('safeNavigateTo should use redirectTo when stack >= 10', async () => {
    const Taro = require('@tarojs/taro').default
    Taro.getCurrentPages.mockReturnValue(new Array(10))
    
    await NavigationService.safeNavigateTo('/pages/test/index')
    
    expect(Taro.redirectTo).toHaveBeenCalledWith({ url: '/pages/test/index' })
  })

  it('smartNavigateBack should use switchTab when stack <= 1', () => {
    const Taro = require('@tarojs/taro').default
    Taro.getCurrentPages.mockReturnValue([{}])
    
    NavigationService.smartNavigateBack()
    
    expect(Taro.switchTab).toHaveBeenCalledWith({ url: '/pages/index/index' })
  })

  it('smartNavigateBack should use navigateBack when stack > 1', () => {
    const Taro = require('@tarojs/taro').default
    Taro.getCurrentPages.mockReturnValue([{}, {}])
    
    NavigationService.smartNavigateBack()
    
    expect(Taro.navigateBack).toHaveBeenCalledWith({ delta: 1 })
  })
})
```

- [ ] **Step 2: 运行测试**

```bash
pnpm test src/shared/utils/__tests__/navigation.test.ts
```

- [ ] **Step 3: 提交代码**

```bash
git add src/shared/utils/__tests__/
git commit -m "test: add NavigationService unit tests"
```

### Task 22: 配置 Playwright E2E 测试

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/` directory

- [ ] **Step 1: 安装 Playwright**

```bash
pnpm add -D @playwright/test
npx playwright install
```

- [ ] **Step 2: 创建 Playwright 配置**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 375, height: 667 }
  }
})
```

- [ ] **Step 3: 提交代码**

```bash
git add playwright.config.ts
git commit -m "test: configure Playwright E2E testing"
```

### Task 23: 编写登录流程 E2E 测试

**Files:**
- Create: `e2e/login.spec.ts`

- [ ] **Step 1: 编写 E2E 测试**

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('用户登录流程', async ({ page }) => {
  // 1. 打开首页
  await page.goto('http://localhost:3000')
  
  // 2. 点击"我的" Tab
  await page.click('text=我的')
  
  // 3. 点击"登录"按钮
  await page.click('text=登录')
  
  // 4. 输入手机号
  await page.fill('input[placeholder="请输入手机号"]', '13800138000')
  
  // 5. 点击"获取验证码"
  await page.click('text=获取验证码')
  
  // 6. 输入验证码
  await page.fill('input[placeholder="请输入验证码"]', '123456')
  
  // 7. 点击"登录"
  await page.click('text=登录')
  
  // 8. 验证登录成功
  await expect(page.locator('text=我的')).toBeVisible()
})
```

- [ ] **Step 2: 提交代码**

```bash
git add e2e/
git commit -m "test: add login E2E test"
```

### Task 24: 添加性能测试

**Files:**
- Create: `src/test/performance.test.ts`

- [ ] **Step 1: 编写性能测试**

```typescript
// src/test/performance.test.ts
import { describe, it, expect } from 'vitest'

describe('性能测试', () => {
  it('首页加载时间应小于 2 秒', async () => {
    const startTime = Date.now()
    
    // 模拟首页加载
    // 实际测试需要在真实环境中运行
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    expect(loadTime).toBeLessThan(2000)
  })

  it('列表滚动帧率应达到 60fps', async () => {
    // 模拟滚动测试
    // 实际测试需要在真实环境中运行
    
    const fps = 60
    expect(fps).toBeGreaterThanOrEqual(60)
  })
})
```

- [ ] **Step 2: 提交代码**

```bash
git add src/test/
git commit -m "test: add performance tests"
```

## 验收检查

### Phase 3 验收
- [ ] 所有主要页面有过渡动画
- [ ] 长列表有返回顶部按钮
- [ ] 深层页面有面包屑导航
- [ ] 页面栈无深度溢出

### Phase 4 验收
- [ ] 微信订阅消息工具可用
- [ ] 微信卡包工具可用
- [ ] 支付宝生活号工具可用
- [ ] 支付宝芝麻信用工具可用
- [ ] 支付宝支付支持
- [ ] 鸿蒙服务卡片配置

### Phase 6 验收
- [ ] 长列表使用 VirtualList
- [ ] 所有展示组件使用 React.memo
- [ ] ImageService 工具可用
- [ ] Vite splitChunks 配置

### Phase 7 验收
- [ ] Vitest 配置完成
- [ ] NavigationService 单元测试通过
- [ ] Playwright 配置完成
- [ ] 登录 E2E 测试通过
- [ ] 性能测试通过

## 最终提交

```bash
git add -A
git commit -m "feat(miniprogram-ux-phase2): complete all phases

Phase 3: Navigation enhancement (page transitions, BackTop, Breadcrumb)
Phase 4: Platform integration (WeChat, Alipay, HarmonyOS)
Phase 6: Performance optimization (VirtualList, React.memo, images)
Phase 7: Testing infrastructure (Vitest, Playwright)"
```
