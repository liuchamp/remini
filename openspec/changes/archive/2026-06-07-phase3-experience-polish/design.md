# Phase 3: Experience Polish — Design

> 高层架构决策，与 proposal.md 的 Capabilities 一一对应

## 1. 整体架构

```
┌────────────────────────────────────────────────────────────┐
│                     Phase 3 五条流                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  i18n 全量 ──┐                                             │
│  搜索完善 ───┼──→ 主线（任务 1-3）→ UI 统一（任务 4）       │
│  分享海报 ───┘                                ↓             │
│                                            性能（任务 5）  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**任务依赖**：
- T1 (i18n) + T2 (搜索) + T3 (分享) **可并行**（不同模块）
- T4 (UI 统一) **依赖** T1（i18n keys）+ T2（页面结构）
- T5 (性能) **最后**，依赖 T1-T4 全部完成

## 2. i18n 全量接入（modified `i18n-multi-lang`）

### 2.1 策略：自动化扫描 + 人工补齐

```
┌─────────────┐   scan   ┌──────────────┐   manual   ┌────────────┐
│ 58 .tsx     │ ────────→│  硬编码中文字  │ ─────────→│  useTranslation│
│ 页面文件    │   grep   │  段定位       │  replace  │  替换         │
└─────────────┘          └──────────────┘           └────────────┘
```

**新增 namespace**：
- `community.json`（zh-CN + en-US）：覆盖 11 个社区/营销/通知页面的所有文案
- `notification.json`（zh-CN + en-US）：通知 Tab/列表/标记已读等

**接入策略**：
- 所有页面统一 `const { t } = useTranslation(['namespace', 'common'])`
- 公共按钮/状态文案走 `common` namespace
- 页面专属文案走对应 namespace
- 缺翻译回退到 `zh-CN`（fallbackLng）

### 2.2 LanguageSwitcher 组件

```typescript
// src/shared/components/i18n/LanguageSwitcher/index.tsx
interface Props {
  type?: 'list-item' | 'modal'  // 设置页内嵌 vs 弹窗
  onChange?: (lang: 'zh-CN' | 'en-US') => void
}
```

- 复用 `src/shared/i18n/index.ts` 的 `changeLanguage`
- 设置页入口 + 首次启动引导
- 持久化 `@remx/locale` 已有 storage key

## 3. 搜索页完善（modified `product-browse`）

### 3.1 页面结构

```
┌──────────────────────────────┐
│ 🔍 [搜索框    ] [取消]        │
├──────────────────────────────┤
│  热门搜索 (chips)              │
├──────────────────────────────┤
│  搜索历史 [×清空]              │
│  [tag] [tag] [tag]            │
├──────────────────────────────┤
│  筛选面板 (点击展开)            │
│  [分类] [价格] [成色] [排序]   │
├──────────────────────────────┤
│  结果列表 (现有 ProductCard)    │
└──────────────────────────────┘
```

### 3.2 关键实现

- **搜索建议**：300ms 防抖 + `productApi.searchSuggest(keyword)`
- **热门搜索**：进入页面时拉取 `productApi.getHotSearches()`，本地缓存 5min
- **筛选面板**：底部弹起 `FilterPanel` 组件，复用 `category` domain
- **多维排序**：综合/价格升序/价格降序/最新/距离最近

### 3.3 历史记录

- 已有 storage key `searchHistory` + MAX_HISTORY=10
- 增加：tap 搜索历史自动填充 input（已有）；增加"清空"按钮（已有）

## 4. 分享与海报（new `share-poster`）

### 4.1 分享 API 抽象

```typescript
// src/shared/utils/share.ts
export interface ShareConfig {
  title: string
  path: string
  imageUrl?: string  // 缩略图
}

export function configurePageShare(config: ShareConfig): void
```

- 业务页面 `useEffect` 调用 `configurePageShare({...})`
- 统一在 `onShareAppMessage` + `onShareTimeline` 中返回
- 默认值：title = 页面 H1，path = 当前路径 + query

### 4.2 海报生成

- 商品海报：标题/价格/主图/二维码（小程序码）
- 帖子海报：作者/内容摘要/图片/二维码
- 邀请海报：邀请码/二维码/背景图

**实现**：
- `src/shared/utils/canvas.ts` 工具函数：图片加载、绘制、toTempFilePath
- 失败回退：toTempFilePath 失败 → 提示"保存图片失败，请稍后重试"
- 真机性能差时降级：调用后端 `/api/poster/generate` 服务端生成

### 4.3 全页面接入

至少覆盖 6 个核心页面：商品详情、帖子详情、个人主页、邀请页、签到页、积分中心

## 5. 统一 UI 组件（new `ui-feedback`）

### 5.1 组件清单

| 组件 | 用途 | Props |
|------|------|-------|
| `Skeleton` | 加载占位 | `rows?: number`, `type?: 'card'\|'list'\|'detail'` |
| `Empty` | 空态 | `icon?: string`, `text?: string`, `actionText?: string` |
| `Loading` | 下拉/触底加载 | `type?: 'pull'\|'infinite'` |
| `RetryButton` | 错误重试 | `onRetry: () => void`, `text?: string` |
| `ErrorBoundary` | 全局错误捕获 | （已有） |

### 5.2 统一 ListPage 模式

```typescript
// 模式 A: 统一四态
{loading ? <Skeleton type="list" /> :
 error ? <RetryButton onRetry={refresh} /> :
 data.length === 0 ? <Empty text="暂无数据" /> :
 <List data={data} />}
```

### 5.3 接入策略

- 不强制改造所有列表页（避免回归），优先新页面/列表页
- 至少 10 个高频列表页接入：Feed、Post、Checkin、Points、Coupon、Notification、Order、Offer、ProductList、Search

## 6. 性能优化

### 6.1 主包分析

- 命令：`taro build --type weapp --analyze`
- 目标：主包 < 2MB（微信限制）
- 行动：tree-shaking、CDN 外置大字体/图标、移除未使用依赖

### 6.2 分包优化

- 已有 `subPackages` 配置（auth/admin/kyc 已在子包）
- 新增：把 community/marketing/notification 也移入子包（按需加载）

### 6.3 图片懒加载

- NutUI `<Image lazyLoad />` 已支持，复用
- 列表长图：IntersectionObserver（@tarojs/extend 提供）

## 7. 设置页补全（modified `user-profile`）

| 区块 | 内容 |
|------|------|
| 关于 | 版本号 v1.0.0 / 检查更新 |
| 隐私 | 隐私政策链接 / 用户协议 |
| 语言 | LanguageSwitcher |
| 缓存 | 当前缓存大小 / 一键清理 |
| 退出 | 二次确认 + clearToken + back to login |

## 8. 文件结构

```
src/shared/components/
├── i18n/
│   └── LanguageSwitcher/         # 新增
├── share/
│   ├── ShareButton/              # 新增（带分享图标）
│   └── PosterGenerator/          # 新增
├── Skeleton/                     # 新增
├── RetryButton/                  # 新增
└── ...

src/shared/utils/
├── share.ts                      # 新增
└── canvas.ts                     # 新增

src/shared/i18n/resources/
├── zh-CN/community.json          # 新增
├── zh-CN/notification.json       # 新增
├── en-US/community.json          # 新增
└── en-US/notification.json       # 新增

src/pages/user/settings/          # 新增（设置页）
```

## 9. 风险与回滚

| 风险 | 缓解 |
|------|------|
| i18n 遗漏 key 导致线上显示 t('xxx') | 构建时自动扫描未翻译 key（i18next-scanner） |
| Canvas 真机性能差 | 降级为服务端生成 |
| 分享回调失败 | 监听 onShareAppMessage 返回值 |
| 性能优化引入 bug | 任务 5 独立可回滚，使用 feature flag（先关闭再开启） |
