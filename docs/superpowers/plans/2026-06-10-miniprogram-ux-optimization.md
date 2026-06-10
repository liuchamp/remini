---
archived-with: 2026-06-10-miniprogram-ux-optimization
status: final
---
# REMX 小程序 UX 优化 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化 REMX 小程序的用户体验，涵盖触控目标、加载状态、空状态、平台适配、表单 UX 和性能优化 6 个核心领域

**Architecture:** 在现有 NutUI + SCSS 架构基础上，通过新增 mixin、扩展组件、添加 hooks 来实现 UX 优化，保持向后兼容

**Tech Stack:** Taro 4.2, React 18, SCSS, NutUI React Taro, Zustand

---
change: miniprogram-ux-optimization
design-doc: docs/superpowers/specs/2026-06-10-miniprogram-ux-optimization-design.md
base-ref: f4b5a291ceab4f1959298b90487cee5df46fcbc2
---

## 文件结构映射

```
src/
├── styles/
│   ├── variables.scss              # 修改：添加触控、动画变量
│   └── mixins.scss                 # 修改：添加 touch-target mixin
├── shared/
│   ├── components/
│   │   ├── Skeleton/
│   │   │   ├── index.tsx           # 修改：扩展骨架屏变体
│   │   │   └── index.scss          # 修改：添加新变体样式
│   │   ├── Empty/
│   │   │   ├── index.tsx           # 修改：扩展空状态变体
│   │   │   └── index.scss          # 修改：添加新变体样式
│   │   └── Button/
│   │       ├── index.tsx           # 修改：应用 touch-target
│   │       └── index.scss          # 修改：添加 touch-target 样式
│   ├── hooks/
│   │   ├── useKeyboardAware.ts     # 新建：键盘感知滚动
│   │   ├── useFormValidation.ts    # 新建：表单实时验证
│   │   └── useFormAutosave.ts      # 新建：表单自动保存
│   └── utils/
│       ├── platform.ts             # 修改：扩展平台特性检测
│       └── haptic.ts               # 新建：触觉反馈工具
└── pages/
    └── index/
        └── index.tsx               # 修改：应用新的加载/空状态
```

---

## Task 1: 扩展设计 Token 和 Mixin

**Files:**
- Modify: `src/styles/variables.scss`
- Modify: `src/styles/mixins.scss`

- [ ] **Step 1: 添加触控和动画变量到 variables.scss**

```scss
// 在文件末尾追加
// Touch Targets
$touch-min: 48px;
$touch-comfortable: 56px;

// Animation Durations
$duration-fast: 150ms;
$duration-normal: 300ms;
$duration-slow: 500ms;

// Easing Functions
$ease-out: cubic-bezier(0.16, 1, 0.3, 1);
$ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

- [ ] **Step 2: 添加 touch-target mixin 到 mixins.scss**

```scss
// 在文件末尾追加
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

@mixin transition-base($property: all, $duration: 300ms) {
  transition: $property $duration $ease-out;
}
```

- [ ] **Step 3: 验证编译**

Run: `pnpm build:h5 2>&1 | head -20`
Expected: 编译成功，无错误

- [ ] **Step 4: 提交**

```bash
git add src/styles/variables.scss src/styles/mixins.scss
git commit -m "feat(styles): add touch target and animation tokens"
```

---

## Task 2: 创建触觉反馈工具

**Files:**
- Create: `src/shared/utils/haptic.ts`

- [ ] **Step 1: 创建 haptic.ts**

```typescript
import Taro from '@tarojs/taro'

/**
 * 触觉反馈工具
 * 在支持的平台上提供触觉反馈
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

/**
 * 触发触觉反馈
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  // 微信小程序
  if (Taro.canIUse('vibrateShort')) {
    switch (type) {
      case 'light':
        Taro.vibrateShort({ type: 'light' })
        break
      case 'medium':
        Taro.vibrateShort({ type: 'medium' })
        break
      case 'heavy':
        Taro.vibrateShort({ type: 'heavy' })
        break
      case 'success':
        Taro.vibrateShort({ type: 'light' })
        break
      case 'warning':
        Taro.vibrateShort({ type: 'medium' })
        break
      case 'error':
        Taro.vibrateLong()
        break
    }
  }
}

/**
 * 成功反馈
 */
export function hapticSuccess(): void {
  triggerHaptic('success')
}

/**
 * 错误反馈
 */
export function hapticError(): void {
  triggerHaptic('error')
}

/**
 * 轻触反馈
 */
export function hapticLight(): void {
  triggerHaptic('light')
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `pnpm tsc --noEmit 2>&1 | head -20`
Expected: 无类型错误

- [ ] **Step 3: 提交**

```bash
git add src/shared/utils/haptic.ts
git commit -m "feat(utils): add haptic feedback utility"
```

---

## Task 3: 扩展 Skeleton 组件

**Files:**
- Modify: `src/shared/components/Skeleton/index.tsx`
- Modify: `src/shared/components/Skeleton/index.scss`

- [ ] **Step 1: 读取现有 Skeleton 组件**

Run: `cat src/shared/components/Skeleton/index.tsx`

- [ ] **Step 2: 扩展 Skeleton.tsx 添加新变体**

```typescript
// 在现有代码基础上扩展
import { View } from '@tarojs/components'
import './index.scss'

export interface SkeletonProps {
  variant?: 'card' | 'list' | 'detail' | 'profile' | 'product'
  count?: number
  animated?: boolean
  className?: string
}

export function Skeleton({
  variant = 'card',
  count = 1,
  animated = true,
  className = ''
}: SkeletonProps) {
  const renderCardSkeleton = () => (
    <View className='skeleton-card'>
      <View className='skeleton-card-image' />
      <View className='skeleton-card-content'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-subtitle' />
        <View className='skeleton-card-footer'>
          <View className='skeleton-line skeleton-line-price' />
          <View className='skeleton-line skeleton-line-button' />
        </View>
      </View>
    </View>
  )

  const renderListSkeleton = () => (
    <View className='skeleton-list-item'>
      <View className='skeleton-avatar' />
      <View className='skeleton-list-content'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
    </View>
  )

  const renderDetailSkeleton = () => (
    <View className='skeleton-detail'>
      <View className='skeleton-detail-image' />
      <View className='skeleton-detail-info'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-price' />
        <View className='skeleton-line skeleton-line-subtitle' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
    </View>
  )

  const renderProfileSkeleton = () => (
    <View className='skeleton-profile'>
      <View className='skeleton-avatar-large' />
      <View className='skeleton-profile-info'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
      <View className='skeleton-profile-stats'>
        <View className='skeleton-stat' />
        <View className='skeleton-stat' />
        <View className='skeleton-stat' />
      </View>
    </View>
  )

  const renderProductSkeleton = () => (
    <View className='skeleton-product'>
      <View className='skeleton-product-swiper' />
      <View className='skeleton-product-info'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-price' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
    </View>
  )

  const renderers = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    detail: renderDetailSkeleton,
    profile: renderProfileSkeleton,
    product: renderProductSkeleton,
  }

  return (
    <View className={`skeleton ${animated ? 'skeleton-animated' : ''} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className='skeleton-item'>
          {renderers[variant]()}
        </View>
      ))}
    </View>
  )
}

export default Skeleton
```

- [ ] **Step 3: 扩展 Skeleton 样式**

```scss
// src/shared/components/Skeleton/index.scss
@use '../../../styles' as *;

.skeleton {
  width: 100%;
}

.skeleton-animated {
  .skeleton-line,
  .skeleton-card-image,
  .skeleton-avatar,
  .skeleton-avatar-large,
  .skeleton-list-item,
  .skeleton-detail-image,
  .skeleton-product-swiper,
  .skeleton-stat {
    background: linear-gradient(
      90deg,
      $color-bg 25%,
      $color-bg-light 50%,
      $color-bg 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-line {
  height: 28px;
  border-radius: $radius-sm;
  margin-bottom: $spacing-sm;
}

.skeleton-line-title {
  width: 60%;
  height: 32px;
}

.skeleton-line-subtitle {
  width: 80%;
  height: 24px;
}

.skeleton-line-price {
  width: 40%;
  height: 36px;
}

.skeleton-line-button {
  width: 20%;
  height: 40px;
  border-radius: $radius-md;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  flex-shrink: 0;
}

// Card variant
.skeleton-card {
  background: $color-white;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.skeleton-card-image {
  width: 100%;
  height: 300px;
}

.skeleton-card-content {
  padding: $spacing-md;
}

.skeleton-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-md;
}

// List variant
.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  gap: $spacing-md;
  background: $color-white;
}

.skeleton-list-content {
  flex: 1;
}

// Detail variant
.skeleton-detail {
  background: $color-white;
}

.skeleton-detail-image {
  width: 100%;
  height: 600px;
}

.skeleton-detail-info {
  padding: $spacing-lg;
}

// Profile variant
.skeleton-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
  background: $color-white;
}

.skeleton-profile-info {
  margin-top: $spacing-lg;
  text-align: center;
}

.skeleton-profile-stats {
  display: flex;
  gap: $spacing-xl;
  margin-top: $spacing-lg;
}

.skeleton-stat {
  width: 100px;
  height: 60px;
  border-radius: $radius-sm;
}

// Product variant
.skeleton-product {
  background: $color-white;
}

.skeleton-product-swiper {
  width: 100%;
  height: 600px;
}

.skeleton-product-info {
  padding: $spacing-lg;
}
```

- [ ] **Step 4: 验证组件渲染**

Run: `pnpm build:h5 2>&1 | head -20`
Expected: 编译成功

- [ ] **Step 5: 提交**

```bash
git add src/shared/components/Skeleton/
git commit -m "feat(components): extend Skeleton with profile and product variants"
```

---

## Task 4: 扩展 Empty 组件

**Files:**
- Modify: `src/shared/components/Empty/index.tsx`
- Modify: `src/shared/components/Empty/index.scss`

- [ ] **Step 1: 扩展 Empty.tsx 添加场景化变体**

```typescript
import { View, Text } from '@tarojs/components'
import './index.scss'

export interface EmptyProps {
  variant?: 'no-data' | 'no-orders' | 'no-favorites' | 'no-results' | 'no-chat' | 'no-posts'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultConfig = {
  'no-data': {
    icon: '📭',
    title: '暂无数据',
    description: '这里什么都没有',
  },
  'no-orders': {
    icon: '📦',
    title: '暂无订单',
    description: '快去发现心仪的商品吧',
  },
  'no-favorites': {
    icon: '⭐',
    title: '暂无收藏',
    description: '收藏喜欢的商品，方便随时查看',
  },
  'no-results': {
    icon: '🔍',
    title: '未找到结果',
    description: '换个关键词试试',
  },
  'no-chat': {
    icon: '💬',
    title: '暂无消息',
    description: '去社区看看大家在聊什么',
  },
  'no-posts': {
    icon: '📝',
    title: '暂无动态',
    description: '分享你的第一篇动态吧',
  },
}

export function Empty({
  variant = 'no-data',
  title,
  description,
  action,
  className = ''
}: EmptyProps) {
  const config = defaultConfig[variant]

  return (
    <View className={`empty ${className}`}>
      <Text className='empty-icon'>{config.icon}</Text>
      <Text className='empty-title'>{title || config.title}</Text>
      <Text className='empty-description'>{description || config.description}</Text>
      {action && (
        <View className='empty-action' onClick={action.onClick}>
          <Text className='empty-action-text'>{action.label}</Text>
        </View>
      )}
    </View>
  )
}

export default Empty
```

- [ ] **Step 2: 扩展 Empty 样式**

```scss
// src/shared/components/Empty/index.scss
@use '../../../styles' as *;

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl $spacing-lg;
  min-height: 400px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: $spacing-lg;
}

.empty-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $color-text;
  margin-bottom: $spacing-sm;
  text-align: center;
}

.empty-description {
  font-size: $font-sm;
  color: $color-text-secondary;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
}

.empty-action {
  margin-top: $spacing-xl;
  padding: $spacing-md $spacing-xl;
  background: $color-primary;
  border-radius: $radius-md;
  @include touch-target;
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.empty-action-text {
  color: $color-white;
  font-size: $font-md;
  font-weight: 500;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/Empty/
git commit -m "feat(components): extend Empty with scenario-based variants"
```

---

## Task 5: 创建表单 Hooks

**Files:**
- Create: `src/shared/hooks/useFormValidation.ts`
- Create: `src/shared/hooks/useFormAutosave.ts`
- Create: `src/shared/hooks/useKeyboardAware.ts`

- [ ] **Step 1: 创建 useFormValidation.ts**

```typescript
import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
  validate?: (value: any) => boolean | string
}

export interface ValidationRules {
  [field: string]: ValidationRule
}

export interface ValidationErrors {
  [field: string]: string
}

export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules,
  initialValues?: T
) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback(
    (field: string, value: any): string | null => {
      const rule = rules[field]
      if (!rule) return null

      // Required check
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rule.message || `${field} 是必填项`
      }

      // Min length
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return rule.message || `至少需要 ${rule.minLength} 个字符`
      }

      // Max length
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return rule.message || `最多 ${rule.maxLength} 个字符`
      }

      // Pattern
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message || '格式不正确'
      }

      // Custom validate
      if (rule.validate) {
        const result = rule.validate(value)
        if (result === false) {
          return rule.message || '验证失败'
        }
        if (typeof result === 'string') {
          return result
        }
      }

      return null
    },
    [rules]
  )

  const validate = useCallback(
    (field: string, value: any): boolean => {
      const error = validateField(field, value)
      setErrors((prev) => {
        const next = { ...prev }
        if (error) {
          next[field] = error
        } else {
          delete next[field]
        }
        return next
      })
      return !error
    },
    [validateField]
  )

  const validateAll = useCallback(
    (values: T): boolean => {
      const newErrors: ValidationErrors = {}
      let isValid = true

      Object.keys(rules).forEach((field) => {
        const error = validateField(field, values[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })

      setErrors(newErrors)
      return isValid
    },
    [rules, validateField]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return {
    errors,
    validate,
    validateAll,
    clearErrors,
    clearFieldError,
  }
}

export default useFormValidation
```

- [ ] **Step 2: 创建 useFormAutosave.ts**

```typescript
import { useEffect, useRef, useCallback } from 'react'

export interface UseFormAutosaveOptions {
  key: string
  delay?: number
  enabled?: boolean
}

export function useFormAutosave<T>(
  data: T,
  options: UseFormAutosaveOptions
) {
  const { key, delay = 1000, enabled = true } = options
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  // Load saved data on mount
  const loadSavedData = useCallback((): T | null => {
    try {
      const saved = Taro.getStorageSync(key)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [key])

  // Save data
  const save = useCallback(
    (dataToSave: T) => {
      try {
        Taro.setStorageSync(key, JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    },
    [key]
  )

  // Clear saved data
  const clear = useCallback(() => {
    try {
      Taro.removeStorageSync(key)
    } catch (error) {
      console.error('Autosave clear failed:', error)
    }
  }, [key])

  // Debounced save
  useEffect(() => {
    if (!enabled) return

    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      save(data)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [data, delay, enabled, save])

  return {
    loadSavedData,
    save,
    clear,
  }
}

// 需要导入 Taro
import Taro from '@tarojs/taro'

export default useFormAutosave
```

- [ ] **Step 3: 创建 useKeyboardAware.ts**

```typescript
import { useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'

export interface UseKeyboardAwareOptions {
  offset?: number
  animation?: boolean
}

export function useKeyboardAware(
  containerRef: React.RefObject<any>,
  options: UseKeyboardAwareOptions = {}
) {
  const { offset = 80, animation = true } = options

  useEffect(() => {
    // 监听键盘高度变化
    const handleKeyboardChange = (res: any) => {
      if (res.height > 0) {
        // 键盘弹起
        const query = Taro.createSelectorQuery()
        query
          .select('.taro-textarea:focus, .taro-input:focus')
          .boundingClientRect((rect) => {
            if (rect && containerRef.current) {
              const scrollTop = containerRef.current.scrollTop || 0
              const elementTop = rect.top + scrollTop
              const viewportHeight = Taro.getSystemInfoSync().windowHeight

              // 如果输入框被键盘遮挡，滚动到可见位置
              if (elementTop + rect.height + offset > viewportHeight) {
                const scrollTo = elementTop - viewportHeight + rect.height + offset
                containerRef.current.scrollTo({
                  top: scrollTo,
                  animated: animation,
                })
              }
            }
          })
          .exec()
      }
    }

    // 监听键盘事件
    Taro.onKeyboardHeightChange(handleKeyboardChange)

    return () => {
      Taro.offKeyboardHeightChange(handleKeyboardChange)
    }
  }, [containerRef, offset, animation])
}

export default useKeyboardAware
```

- [ ] **Step 4: 验证 TypeScript 编译**

Run: `pnpm tsc --noEmit 2>&1 | head -20`
Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add src/shared/hooks/useFormValidation.ts src/shared/hooks/useFormAutosave.ts src/shared/hooks/useKeyboardAware.ts
git commit -m "feat(hooks): add form validation, autosave, and keyboard awareness hooks"
```

---

## Task 6: 扩展平台特性检测

**Files:**
- Modify: `src/shared/utils/platform.ts`

- [ ] **Step 1: 读取现有 platform.ts**

Run: `cat src/shared/utils/platform.ts`

- [ ] **Step 2: 添加平台特性检测**

```typescript
// 在现有代码基础上追加
export interface PlatformFeatures {
  share: {
    shareCard: boolean
    shareImage: boolean
    shareTimeline: boolean
  }
  favorite: {
    addCard: boolean
    addFavorite: boolean
  }
  subscription: {
    templateMessage: boolean
    subscribeMessage: boolean
  }
  payment: {
    wechatPay: boolean
    alipay: boolean
  }
  social: {
    lifeAccount: boolean
    creditScore: boolean
  }
  distributed: {
    serviceWidget: boolean
    distributedData: boolean
  }
}

export function getPlatformFeatures(): PlatformFeatures {
  const platform = Taro.getSystemInfoSync().platform

  // 微信小程序
  if (process.env.TARO_ENV === 'weapp') {
    return {
      share: {
        shareCard: true,
        shareImage: true,
        shareTimeline: true,
      },
      favorite: {
        addCard: true,
        addFavorite: true,
      },
      subscription: {
        templateMessage: true,
        subscribeMessage: true,
      },
      payment: {
        wechatPay: true,
        alipay: false,
      },
      social: {
        lifeAccount: false,
        creditScore: false,
      },
      distributed: {
        serviceWidget: false,
        distributedData: false,
      },
    }
  }

  // 支付宝
  if (process.env.TARO_ENV === 'alipay') {
    return {
      share: {
        shareCard: true,
        shareImage: true,
        shareTimeline: false,
      },
      favorite: {
        addCard: false,
        addFavorite: true,
      },
      subscription: {
        templateMessage: false,
        subscribeMessage: false,
      },
      payment: {
        wechatPay: false,
        alipay: true,
      },
      social: {
        lifeAccount: true,
        creditScore: true,
      },
      distributed: {
        serviceWidget: false,
        distributedData: false,
      },
    }
  }

  // 鸿蒙
  if (process.env.TARO_ENV === 'harmony-hybrid') {
    return {
      share: {
        shareCard: true,
        shareImage: true,
        shareTimeline: false,
      },
      favorite: {
        addCard: false,
        addFavorite: true,
      },
      subscription: {
        templateMessage: false,
        subscribeMessage: false,
      },
      payment: {
        wechatPay: false,
        alipay: false,
      },
      social: {
        lifeAccount: false,
        creditScore: false,
      },
      distributed: {
        serviceWidget: true,
        distributedData: true,
      },
    }
  }

  // H5/其他
  return {
    share: {
      shareCard: false,
      shareImage: true,
      shareTimeline: false,
    },
    favorite: {
      addCard: false,
      addFavorite: true,
    },
    subscription: {
      templateMessage: false,
      subscribeMessage: false,
    },
    payment: {
      wechatPay: false,
      alipay: false,
    },
    social: {
      lifeAccount: false,
      creditScore: false,
    },
    distributed: {
      serviceWidget: false,
      distributedData: false,
    },
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/utils/platform.ts
git commit -m "feat(utils): extend platform features detection"
```

---

## Task 7: 更新首页应用新组件

**Files:**
- Modify: `src/pages/index/index.tsx`
- Modify: `src/pages/index/index.scss`

- [ ] **Step 1: 读取现有首页**

Run: `cat src/pages/index/index.tsx`

- [ ] **Step 2: 更新首页使用新的 Skeleton 和 Empty**

```typescript
// 在现有代码基础上更新导入
import { Skeleton } from '@/shared/components/Skeleton'
import { Empty } from '@/shared/components/Empty'
import { triggerHaptic } from '@/shared/utils/haptic'

// 在商品列表加载时使用 Skeleton
// 替换现有的 Loading 组件为 Skeleton
{loading ? (
  <Skeleton variant='card' count={4} />
) : products.length === 0 ? (
  <Empty
    variant='no-data'
    action={{
      label: '刷新',
      onClick: () => {
        triggerHaptic('light')
        refresh()
      },
    }}
  />
) : (
  // 现有的商品列表
  <ProductGrid products={products} />
)}
```

- [ ] **Step 3: 更新样式确保 48px 触控目标**

```scss
// src/pages/index/index.scss
@use '../../styles' as *;

// 更新 Tab 栏确保 48px 触控
.tab-item {
  @include touch-target;
  padding: 0 $spacing-md;
}

// 更新搜索框确保 48px 触控
.search-bar {
  @include touch-target-comfortable;
}
```

- [ ] **Step 4: 提交**

```bash
git add src/pages/index/
git commit -m "feat(pages): update home page with new Skeleton and Empty components"
```

---

## Task 8: 应用触控目标到全局按钮

**Files:**
- Modify: `src/app.scss`

- [ ] **Step 1: 添加全局触控目标样式**

```scss
// 在 app.scss 末尾追加
// Global touch target styles
button,
.taro-button,
.taro-tabbar__item,
.taro-view--hover {
  @include touch-target;
}

// 确保所有可点击元素有最小 48px
[role='button'],
[onclick],
.clickable {
  @include touch-target;
}

// 列表项触控区域
.list-item,
.cell-item {
  min-height: $touch-min;
  display: flex;
  align-items: center;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app.scss
git commit -m "feat(styles): add global touch target styles"
```

---

## 验证步骤

完成所有任务后，运行以下验证：

- [ ] **Step 1: 构建验证**

Run: `pnpm build:h5`
Expected: 构建成功

- [ ] **Step 2: 类型检查**

Run: `pnpm tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 代码检查**

Run: `pnpm eslint src/`
Expected: 无严重错误

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: complete miniprogram UX optimization implementation"
```

---

## 成功标准

- [x] 所有可交互元素 ≥ 48px
- [x] Skeleton 组件支持 5 种变体
- [x] Empty 组件支持 6 种场景
- [x] 触觉反馈工具可用
- [x] 表单验证 hook 可用
- [x] 表单自动保存 hook 可用
- [x] 键盘感知 hook 可用
- [x] 平台特性检测扩展
- [x] 首页应用新组件
- [x] 全局触控目标样式
