# Phase 2: 社区营销闭环 设计文档

> 创建时间: 2026-06-07
> 基于审计文档: docs/superpowers/reviews/2026-06-07-miniapp-implementation-audit.md
> 实现范围: 社区 Feed、帖子详情、发帖页、签到、积分中心/商城、优惠券、通知中心

---

## 1. 整体架构

### 1.1 功能域划分

采用**按功能域组织**的架构，将 Phase 2 的 7 个任务分为三个功能域：

| 功能域 | 包含功能 | 核心目标 |
|--------|----------|----------|
| **社区域** | 社区 Feed、帖子详情、发帖页 | 构建社区内容生态 |
| **营销域** | 签到、积分中心/商城、优惠券 | 用户激励与留存 |
| **通知域** | 通知中心 | 用户触达与活跃 |

### 1.2 技术栈

- **UI 框架**: NutUI + Taro Components
- **状态管理**: Zustand (全量)
- **API 模式**: 遵循现有 `domains/*/api.ts` 模式
- **组件复用**: 复用现有 PostCard、ProductCard 等组件

### 1.3 目录结构

```
src/
├── domains/
│   ├── community/
│   │   ├── api.ts          # 社区 API
│   │   ├── store.ts        # 社区 Zustand Store
│   │   └── types.ts        # 社区类型定义
│   ├── marketing/
│   │   ├── api.ts          # 营销 API (签到/积分/优惠券)
│   │   ├── store.ts        # 营销 Zustand Store
│   │   └── types.ts        # 营销类型定义
│   └── notification/
│       ├── api.ts          # 通知 API
│       ├── store.ts        # 通知 Zustand Store
│       └── types.ts        # 通知类型定义
├── pages/
│   ├── community/
│   │   ├── feed/index.tsx      # 社区 Feed
│   │   ├── post/index.tsx      # 帖子详情
│   │   └── create/index.tsx    # 发帖页
│   ├── checkin/
│   │   └── index/index.tsx     # 签到
│   ├── points/
│   │   ├── index/index.tsx     # 积分中心
│   │   └── shop/index.tsx      # 积分商城
│   ├── coupon/
│   │   └── list/index.tsx      # 优惠券列表
│   └── notification/
│       └── index/index.tsx     # 通知中心
└── shared/components/
    ├── community/
    │   ├── PostCard/index.tsx       # 帖子卡片 (已存在，需增强)
    │   ├── CommentList/index.tsx    # 评论列表 (新增)
    │   ├── ImagePreview/index.tsx   # 图片预览 (新增)
    │   └── ProductEmbed/index.tsx   # 商品嵌入 (新增)
    ├── marketing/
    │   ├── CheckinCalendar/index.tsx # 签到日历 (新增)
    │   ├── PointsFlow/index.tsx      # 积分流水 (新增)
    │   └── CouponCard/index.tsx      # 优惠券卡片 (新增)
    └── notification/
        └── NotificationItem/index.tsx # 通知项 (新增)
```

---

## 2. 社区域设计

### 2.1 社区 Feed (`pages/community/feed/index.tsx`)

**功能增强**:
- 复用现有 `PostCard` 组件
- 添加下拉刷新和上拉加载更多
- Tab 切换（推荐/热门/关注）
- 帖子卡片增强：互动栏、图片预览、商品卡片

**数据流**:
```
用户操作 → Feed Store → API 调用 → 更新 Store → 重新渲染
```

**关键实现**:
```typescript
// Zustand Store
interface FeedStore {
  posts: Post[]
  activeTab: 'recommended' | 'trending' | 'following'
  loading: boolean
  hasMore: boolean
  page: number
  loadPosts: (tab: string, refresh?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}
```

### 2.2 帖子详情 (`pages/community/post/index.tsx`)

**功能增强**:
- 完整内容展示（富文本）
- 图片预览（点击放大）
- 商品卡片嵌入
- 评论列表（二级回复）
- 互动栏（点赞、收藏、评论、分享）

**数据流**:
```
帖子详情 → PostStore → API 调用 → 更新 Store → 重新渲染
评论操作 → CommentStore → API 调用 → 更新 Store → 重新渲染
```

**关键实现**:
```typescript
// 帖子 Store
interface PostStore {
  post: Post | null
  comments: Comment[]
  loading: boolean
  loadPost: (id: string) => Promise<void>
  loadComments: (postId: string) => Promise<void>
  addComment: (postId: string, content: string) => Promise<void>
  likePost: (postId: string) => Promise<void>
  collectPost: (postId: string) => Promise<void>
}

// 评论 Store
interface CommentStore {
  comments: Comment[]
  loading: boolean
  loadComments: (postId: string) => Promise<void>
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>
  likeComment: (commentId: string) => Promise<void>
}
```

### 2.3 发帖页 (`pages/community/create/index.tsx`)

**功能增强**:
- 富文本编辑器（500字限制）
- 图片上传（最多9张）
- 关联商品搜索
- 圈子选择
- DFA 敏感词过滤

**数据流**:
```
用户输入 → CreateStore → API 调用 → 发布成功 → 跳转详情页
```

**关键实现**:
```typescript
// 发帖 Store
interface CreateStore {
  content: string
  images: string[]
  productId?: string
  circleId?: string
  submitting: boolean
  setContent: (content: string) => void
  addImage: (url: string) => void
  removeImage: (index: number) => void
  setProduct: (productId: string) => void
  setCircle: (circleId: string) => void
  submit: () => Promise<void>
}
```

---

## 3. 营销域设计

### 3.1 签到 (`pages/checkin/index/index.tsx`)

**功能增强**:
- 日历签到组件
- 连续天数显示
- 签到奖励动画
- 基础 + 连续奖励
- 乐观锁（防止重复签到）

**数据流**:
```
签到操作 → CheckinStore → API 调用 → 更新 Store → 显示奖励
```

**关键实现**:
```typescript
// 签到 Store
interface CheckinStore {
  checkinDays: number[]
  continuousDays: number
  todayChecked: boolean
  loading: boolean
  loadCheckinData: () => Promise<void>
  checkin: () => Promise<void>
}
```

### 3.2 积分中心/商城 (`pages/points/index.tsx`, `pages/points/shop/index.tsx`)

**功能增强**:
- 积分流水分类筛选
- 积分兑换优惠券
- 扣减积分领取券

**数据流**:
```
积分操作 → PointsStore → API 调用 → 更新 Store → 重新渲染
```

**关键实现**:
```typescript
// 积分 Store
interface PointsStore {
  totalPoints: number
  records: PointsRecord[]
  loading: boolean
  loadPointsData: () => Promise<void>
  loadRecords: (category?: string) => Promise<void>
  exchangeCoupon: (couponId: string) => Promise<void>
}
```

### 3.3 优惠券 (`pages/coupon/list/index.tsx`)

**功能增强**:
- Tab 切换（可用/已用/过期）
- 优惠券卡片（类型、金额、门槛、有效期、状态）
- 跳转适用商品

**数据流**:
```
优惠券操作 → CouponStore → API 调用 → 更新 Store → 重新渲染
```

**关键实现**:
```typescript
// 优惠券 Store
interface CouponStore {
  coupons: Coupon[]
  activeTab: 'active' | 'used' | 'expired'
  loading: boolean
  loadCoupons: (tab: string) => Promise<void>
  useCoupon: (couponId: string) => Promise<void>
}
```

---

## 4. 通知域设计

### 4.1 通知中心 (`pages/notification/index/index.tsx`)

**功能增强**:
- Tab 切换（系统/交易/营销）
- 通知列表
- 未读标记
- 单条/批量已读
- TabBar 角标
- 轮询降级（30s/60s）

**数据流**:
```
轮询触发 → NotificationStore → API 调用 → 更新 Store → 更新角标
```

**关键实现**:
```typescript
// 通知 Store
interface NotificationStore {
  notifications: Notification[]
  activeTab: 'system' | 'transaction' | 'marketing'
  unreadCount: number
  loading: boolean
  polling: boolean
  loadNotifications: (tab: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}
```

---

## 5. 组件设计

### 5.1 社区域组件

**PostCard 增强**:
- 添加互动栏（点赞、评论、分享）
- 添加图片预览（点击放大）
- 添加商品卡片嵌入

**CommentList 组件**:
- 二级回复支持
- 评论点赞
- 评论输入框

**ImagePreview 组件**:
- 图片放大预览
- 左右滑动切换
- 保存图片

**ProductEmbed 组件**:
- 商品卡片展示
- 点击跳转商品详情

### 5.2 营销域组件

**CheckinCalendar 组件**:
- 月历展示
- 签到标记
- 连续天数

**PointsFlow 组件**:
- 积分流水列表
- 分类筛选
- 金额显示

**CouponCard 组件**:
- 优惠券信息
- 使用状态
- 操作按钮

### 5.3 通知域组件

**NotificationItem 组件**:
- 通知内容
- 未读标记
- 时间显示
- 操作按钮

---

## 6. API 设计

### 6.1 社区 API

```typescript
// domains/community/api.ts
export const communityApi = {
  getFeed: (tab: string, page?: number) => Promise<ApiResponse<Post[]>>,
  getPostDetail: (id: string) => Promise<ApiResponse<Post>>,
  createPost: (data: CreatePostData) => Promise<ApiResponse<Post>>,
  likePost: (id: string) => Promise<ApiResponse<void>>,
  collectPost: (id: string) => Promise<ApiResponse<void>>,
  getComments: (postId: string, page?: number) => Promise<ApiResponse<Comment[]>>,
  addComment: (postId: string, content: string, parentId?: string) => Promise<ApiResponse<Comment>>,
  likeComment: (id: string) => Promise<ApiResponse<void>>,
}
```

### 6.2 营销 API

```typescript
// domains/marketing/api.ts
export const marketingApi = {
  getCheckinData: () => Promise<ApiResponse<CheckinData>>,
  checkin: () => Promise<ApiResponse<CheckinResult>>,
  getPointsData: () => Promise<ApiResponse<PointsData>>,
  getPointsRecords: (category?: string, page?: number) => Promise<ApiResponse<PointsRecord[]>>,
  getCoupons: (tab: string, page?: number) => Promise<ApiResponse<Coupon[]>>,
  useCoupon: (id: string) => Promise<ApiResponse<void>>,
  exchangeCoupon: (couponId: string) => Promise<ApiResponse<void>>,
}
```

### 6.3 通知 API

```typescript
// domains/notification/api.ts
export const notificationApi = {
  getNotifications: (tab: string, page?: number) => Promise<ApiResponse<Notification[]>>,
  getUnreadCount: () => Promise<ApiResponse<number>>,
  markAsRead: (id: string) => Promise<ApiResponse<void>>,
  markAllAsRead: () => Promise<ApiResponse<void>>,
}
```

---

## 7. 状态管理

### 7.1 Zustand Store 结构

```typescript
// 每个功能域一个 Store
// 社区域
useFeedStore      // Feed 列表
usePostStore      // 帖子详情
useCommentStore   // 评论
useCreateStore    // 发帖

// 营销域
useCheckinStore   // 签到
usePointsStore    // 积分
useCouponStore    // 优惠券

// 通知域
useNotificationStore  // 通知
```

### 7.2 Store 设计原则

- **单一职责**: 每个 Store 只管理一个功能模块
- **扁平结构**: 避免嵌套 Store
- **派生状态**: 使用 selectors 派生计算属性
- **持久化**: 关键数据（如用户信息）使用 persist 中间件

---

## 8. 错误处理

### 8.1 API 错误处理

```typescript
// 统一错误处理
const handleApiError = (error: any) => {
  if (error.code === 401) {
    // 跳转登录页
    Taro.navigateTo({ url: '/pages/login/index' })
  } else if (error.code === 403) {
    // 权限不足
    Toast.show({ content: '权限不足' })
  } else {
    // 通用错误
    Toast.show({ content: error.message || '请求失败' })
  }
}
```

### 8.2 网络错误处理

```typescript
// 网络错误重试
const retryRequest = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

## 9. 性能优化

### 9.1 列表优化

- **虚拟列表**: 长列表使用 Taro 的 VirtualList
- **图片懒加载**: 使用 `lazy-load` 属性
- **分页加载**: 上拉加载更多，每页 20 条

### 9.2 状态优化

- ** selectors**: 使用 Zustand selectors 避免不必要的渲染
- **批量更新**: 使用 Zustand 的 `set` 批量更新状态
- **持久化缓存**: 关键数据使用 `persist` 中间件

### 9.3 网络优化

- **请求合并**: 相关请求使用 `Promise.all` 并行
- **缓存策略**: 静态数据（如分类）使用内存缓存
- **轮询优化**: 通知轮询使用 30s 间隔，页面不可见时暂停

---

## 10. 测试策略

### 10.1 单元测试

- **Store 测试**: 测试 Zustand Store 的状态管理逻辑
- **API 测试**: 测试 API 调用和错误处理
- **组件测试**: 测试组件渲染和交互

### 10.2 集成测试

- **页面流程**: 测试完整用户流程
- **数据流**: 测试 Store → API → Store → UI 的数据流

### 10.3 E2E 测试

- **核心功能**: 测试发帖、评论、签到等核心功能
- **异常场景**: 测试网络错误、权限不足等异常场景

---

## 11. 实施计划

### 11.1 任务分解

| 功能域 | 任务 | 预估工时 | 优先级 |
|--------|------|----------|--------|
| 社区域 | 社区 Feed 完整 | 2 天 | P1 |
| 社区域 | 帖子详情 | 2 天 | P1 |
| 社区域 | 发帖页 | 2 天 | P1 |
| 营销域 | 签到 | 1 天 | P1 |
| 营销域 | 积分中心/商城 | 2 天 | P1 |
| 营销域 | 优惠券 | 1 天 | P1 |
| 通知域 | 通知中心 | 2 天 | P1 |

### 11.2 里程碑

1. **Week 1**: 社区域核心功能完成
2. **Week 2**: 营销域核心功能完成
3. **Week 3**: 通知域核心功能完成，集成测试

---

## 12. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 微信审核不通过 | 上线延迟 | 提前准备测试账号、隐私协议 |
| Canvas 海报性能差 | 生成失败 | 降级为服务端生成 |
| WebSocket 不稳定 | 消息延迟 | 使用轮询降级 |
| 主包超 2MB | 无法上传 | 分包优化、动态 import |

---

*设计完成，待实施*