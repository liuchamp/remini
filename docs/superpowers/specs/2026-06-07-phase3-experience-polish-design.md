---
comet_change: phase3-experience-polish
role: technical-design
canonical_spec: openspec
---

# Phase 3: Experience Polish — Design Doc

> 技术设计 — OpenSpec delta spec 是上游事实源，本文聚焦实现方案、技术风险、测试策略、边界条件

## 0. 上下文回顾

OpenSpec 已固化:
- 5 个 capabilities（2 new: `share-poster`, `ui-feedback`；3 modified: `i18n-multi-lang`, `product-browse`, `user-profile`）
- 6 个 tasks（T1 i18n / T2 搜索 / T3 分享 / T4 UI / T5 性能 / T6 验证）
- 工期 4.5-6 天

本文为 5 个 capability 提供**实现技术细节**。

## 1. 整体架构

```
T1 (i18n) ─┐                Phase 3 Five Streams
T2 (搜索) ─┼──→ T4 (UI 统一) ──┐
T3 (分享) ─┘                    │
                                ▼
                              T5 (性能) → T6 (验证)
```

**执行模式**: Subagent-Driven Development
- T1+T2+T3 可并行（不同模块、零共享状态）
- T4 依赖 T1（i18n keys 必须在）+ T2（页面结构）
- T5 依赖 T1-T4
- 每个 subagent 完成后做 spec compliance review

**关键技术选型**（用户已确认）:
1. **Share 抽象**: 集中 HOC/Provider (ShareProvider) + Page Config Map
2. **Canvas 海报**: 客户端 Canvas 主路径 + 服务端 `/api/poster/generate` fallback
3. **i18n 接入**: 一次性集中接入（34 个页面 + 2 个新 namespace）
4. **性能优化**: Measure-driven（Taro analyze 基准测量 → 决策表 → 行动）

## 2. 分享能力 — ShareProvider 架构

### 2.1 配置中心

`src/shared/utils/share.ts` 集中维护 `PAGE_SHARE_CONFIG`:

```typescript
import type { ShareConfig } from '@/shared/utils/share'

export const PAGE_SHARE_CONFIG: Record<string, ShareConfig> = {
  '/pages/product/detail/index': {
    title: '{{product.title}}',
    path: '/pages/product/detail/index?id={{product.id}}',
    imageUrl: '{{product.coverImage}}'
  },
  '/pages/community/post/index': {
    title: '{{post.title}}',
    path: '/pages/community/post/index?id={{post.id}}',
    imageUrl: '{{post.coverImage}}'
  },
  '/pages/invite/index/index': {
    title: '加入 REMX 二手市场',
    path: '/pages/invite/index/index?code={{user.inviteCode}}',
    imageUrl: '/static/share/invite-default.png'
  }
  // ... 其他核心页面
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  title: 'REMX 二手市场',
  path: '',  // 由 ShareProvider 自动填充当前路径
  imageUrl: '/static/share/default.png'
}
```

### 2.2 ShareProvider HOC

```typescript
// src/shared/components/share/ShareProvider/index.tsx
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect } from 'react'
import { PAGE_SHARE_CONFIG, DEFAULT_SHARE_CONFIG } from '@/shared/utils/share'
import type { ShareConfig } from '@/shared/utils/share'

export function ShareProvider<P extends object>(
  Component: React.ComponentType<P>,
  overrides?: Partial<ShareConfig>
) {
  return function WrappedPage(props: P) {
    const router = useRouter()
    const path = router.path
    const baseConfig = PAGE_SHARE_CONFIG[path] || DEFAULT_SHARE_CONFIG

    useEffect(() => {
      // 注册 onShareAppMessage
      Taro.useShareAppMessage?.(mergeConfig(baseConfig, overrides))
      // 启用 onShareTimeline
      Taro.showShareMenu?.({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    }, [path])

    return <Component {...props} />
  }
}
```

### 2.3 模板变量解析

`baseConfig` 中的 `{{product.id}}` 等占位符，由页面通过 `overrides` 注入运行时数据：

```typescript
// pages/product/detail/index.tsx
export default ShareProvider(ProductDetail, ({ product }) => ({
  title: product.title,
  path: `/pages/product/detail/index?id=${product.id}`,
  imageUrl: product.coverImage
}))
```

### 2.4 边界条件

| 场景 | 行为 |
|------|------|
| 页面未在 PAGE_SHARE_CONFIG 注册 | 使用 DEFAULT_SHARE_CONFIG（页面名 + 当前路径） |
| 模板变量未注入 | 降级为空字符串 + 警告日志 |
| 微信小程序不支持 onShareAppMessage | 静默跳过，不影响页面渲染 |
| 用户拒绝授权相册 | 走 Taro.openSetting 引导 |

## 3. 海报生成 — Client Canvas + Server Fallback

### 3.1 PosterGenerator 组件

```typescript
// src/shared/components/share/PosterGenerator/index.tsx
interface Props {
  type: 'product' | 'post' | 'invite'
  data: Product | Post | Invite
  visible: boolean
  onClose: () => void
}

interface State {
  phase: 'idle' | 'drawing' | 'ready' | 'error'
  imagePath?: string
  errorMessage?: string
}
```

### 3.2 客户端绘制流程

```
┌─────────────────────────────────────────────────────────────┐
│ Taro.createCanvasContext('posterCanvas')                      │
│   ↓                                                           │
│ 加载主图（Taro.getImageInfo 远程 URL → 本地临时路径）         │
│   ↓                                                           │
│ 加载二维码（getUnlimitedQRCode / wxacode.get）                │
│   ↓                                                           │
│ drawImage 主图 → fillText 标题/价格 → drawImage 二维码        │
│   ↓                                                           │
│ Taro.canvasToTempFilePath({ canvasId: 'posterCanvas' })       │
│   ↓                                                           │
│ 失败 → catch 异常 → fallback 到服务端                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 工具函数

`src/shared/utils/canvas.ts` 暴露:

```typescript
export async function loadImage(url: string): Promise<string>  // 远程 URL → 本地临时路径
export async function drawPoster(template: PosterTemplate, ctx: CanvasContext): Promise<void>
export async function canvasToTempFile(canvasId: string): Promise<string>  // 输出图片临时路径
export async function saveToAlbum(tempPath: string): Promise<void>  // 保存到相册
```

### 3.4 三类海报模板

| Type | 布局 | 二维码内容 | Canvas 尺寸 |
|------|------|------------|------------|
| `product` | 主图 750×600 + 标题 + 价格（红色突出）+ 平台 Logo | `pages/product/detail?id=xxx` | 750×1200 |
| `post` | 作者头像 80×80 + 昵称 + 内容摘要 + 图片 750×400 | `pages/community/post?id=xxx` | 750×1200 |
| `invite` | 背景图 750×1200 + 邀请码 + 平台 Logo + 二维码 | `pages/invite/index?code=xxx` | 750×1200 |

### 3.5 服务端 Fallback

```typescript
// 客户端失败时
async function fallbackToServer(type, data) {
  const res = await http.post('/api/poster/generate', { type, data })
  if (res.code === 0) {
    return res.data.imageUrl  // 远程 URL
  }
  throw new Error('Server poster generation failed')
}
```

跳转专门的预览页 `pages/poster/preview/index.tsx`，长按图片保存。

### 3.6 边界条件

| 场景 | 行为 |
|------|------|
| 主图加载失败 | 使用默认占位图 + 重试按钮 |
| canvasToTempFilePath 抛出 | 自动 fallback 到服务端 |
| 用户未授权相册 | 引导 Taro.openSetting |
| 服务端也失败 | 提示"海报生成失败，请稍后重试" |
| iOS / Android 字体差异 | 显式指定 font-family: 'PingFang SC' / 'Microsoft YaHei' |

## 4. 搜索页增强

### 4.1 页面结构

```
┌──────────────────────────────┐
│ 🔍 [搜索框    ] [取消]        │
├──────────────────────────────┤
│  热门搜索 (横向 chips 滚动)   │
├──────────────────────────────┤
│  搜索历史 [×清空]              │
│  [tag] [tag] [tag]            │
├──────────────────────────────┤
│  📌 筛选 (点击展开面板)        │
│  [分类] [价格] [成色] [排序]   │
├──────────────────────────────┤
│  综合 | 价格↑ | 价格↓ | 最新   │  ← 排序 Tab
├──────────────────────────────┤
│  搜索结果 ProductCard 列表     │
└──────────────────────────────┘
```

### 4.2 防抖 + 建议

`src/shared/hooks/useDebounce.ts` 已有。`useDebounce(keyword, 300)` 后触发 `searchSuggest`。

```typescript
const debouncedKeyword = useDebounce(keyword, 300)
useEffect(() => {
  if (debouncedKeyword.trim()) {
    fetchSuggest(debouncedKeyword)
  }
}, [debouncedKeyword])
```

### 4.3 FilterPanel 组件

```typescript
// src/shared/components/product/FilterPanel/index.tsx
interface FilterState {
  categoryId?: string
  priceMin?: number
  priceMax?: number
  condition?: 'new' | 'like-new' | 'good' | 'fair'
  negotiableOnly?: boolean
  sort?: 'default' | 'price_asc' | 'price_desc' | 'newest' | 'distance'
}

interface Props {
  visible: boolean
  value: FilterState
  onApply: (filters: FilterState) => void
  onClose: () => void
}
```

### 4.4 边界条件

| 场景 | 行为 |
|------|------|
| 建议接口失败 | 静默失败，不影响输入 |
| 热门搜索接口失败 | 显示骨架占位 + 重试 |
| 筛选无结果 | Empty 组件 "无符合筛选条件的商品" |
| 距离排序但未授权位置 | 隐藏距离 tab |

## 5. UI 统一组件

### 5.1 Skeleton 组件

```typescript
// src/shared/components/Skeleton/index.tsx
interface Props {
  type?: 'card' | 'list' | 'detail'
  rows?: number
  avatar?: boolean
  paragraph?: boolean  // type=detail 时启用
}
```

**实现**: 纯 SCSS + 占位 div，灰阶背景色 `--color-bg-elevated`，无图片资源。匹配各类型页面布局（card 120px 高、list 88px 高、detail 200px 高）。

### 5.2 RetryButton 组件

```typescript
interface Props {
  onRetry: () => void
  text?: string
  loading?: boolean
}
```

**实现**: 全屏居中按钮 + 错误图标 + 加载态。错误文案走 i18n `common.retry` key。

### 5.3 统一四态模式

```tsx
// 推荐的列表页结构
function ListPage() {
  const { data, loading, error, refresh } = useFetch()
  
  return (
    <View>
      {loading && <Skeleton type="list" rows={5} />}
      {error && <RetryButton onRetry={refresh} />}
      {!loading && !error && data.length === 0 && <Empty text={t('common.empty.list')} />}
      {!loading && !error && data.length > 0 && <List data={data} />}
    </View>
  )
}
```

### 5.4 接入范围

至少 10 个高频列表页: Feed / Post / Checkin / Points / Coupon / Notification / Order / Offer / ProductList / Search

不强制改造所有列表页（避免回归），优先新页面/列表页。

## 6. i18n 全量接入

### 6.1 Namespace 设计

**新增**:
- `community.json` (zh-CN + en-US) — 社区、营销页面 ~30 keys
- `notification.json` (zh-CN + en-US) — 通知中心 ~15 keys

**扩展**:
- `common.json` — 新增 `action.retry` / `empty.*` / `error.network` 等基础 keys

### 6.2 Key 命名规范

**扁平化** (避免深嵌套):
```
{namespace}.{section}.{key}
```

例:
- `community.feed.tabRecommend`
- `community.feed.emptyText`
- `notification.tab.transaction`
- `notification.action.markAllRead`
- `common.action.retry`
- `common.empty.list`

### 6.3 接入方法

每个页面统一:
```typescript
import { useTranslation } from 'react-i18next'

export default function MyPage() {
  const { t } = useTranslation(['myNamespace', 'common'])
  return <View>{t('myNamespace:section.key')}</View>
}
```

### 6.4 一次性接入策略

**Subagent 任务**: 单个 subagent 一次性接入 34 个页面 + 2 个新 namespace
- 输入: 现有 24 个已接入页面作为模式参考
- 输出: 34 个 .tsx 修改 + 4 个 .json 文件
- Review: 抽样 10 个页面验证 + grep 验证 0 硬编码中文

**Subagent prompt 关键点**:
- 复用 `useTranslation(['namespace', 'common'])` 模式
- 公共文案走 `common`，页面专属走对应 namespace
- 缺翻译回退到 `zh-CN`
- 提交前 grep 验证 0 硬编码

### 6.5 LanguageSwitcher 组件

```typescript
// src/shared/components/i18n/LanguageSwitcher/index.tsx
import { changeLanguage } from '@/shared/i18n'
import { useState, useEffect } from 'react'
import i18n from 'i18next'

interface Props {
  type?: 'list-item' | 'modal'
}

export function LanguageSwitcher({ type = 'list-item' }: Props) {
  const [currentLang, setCurrentLang] = useState(i18n.language)

  const handleChange = (lang: 'zh-CN' | 'en-US') => {
    changeLanguage(lang)
    setCurrentLang(lang)
  }

  if (type === 'modal') {
    return <Modal onSelect={handleChange} currentLang={currentLang} />
  }

  return <ListItem onTap={...} currentLang={currentLang} />
}
```

### 6.6 边界条件

| 场景 | 行为 |
|------|------|
| 启动时无 locale 存储 | Taro.getSystemInfoSync().language 探测 → 默认 zh-CN |
| 切换语言时页面未刷新 | i18n.changeLanguage 即时生效，状态管理 re-render |
| 用户中途修改系统语言 | 启动时检测，下次启动生效（不强制热切换） |
| 翻译 key 缺失 | fallbackLng=zh-CN，开发模式 console.warn |

## 7. 性能优化 — Measure-driven

### 7.1 测量命令

```bash
npx taro build --type weapp --analyze
# 输出 dist/ 下 main package + 各 subpackage 体积
```

### 7.2 决策表

| 主包 | 行动 | 预估耗时 |
|------|------|---------|
| < 1MB | 仅生成报告 | 0.5h |
| 1-2MB | 启用 `optimizeMainPackage`、按需 import、移除未使用依赖、CDN 外置字体 | 2-3h |
| > 2MB | 分包重构：community/marketing/notification → subpackage；admin/kyc/address 改 `import()` | 0.5-1 day |

### 7.3 分包结构调整

`src/app.config.ts` 当前已有 `subPackages` 配置（auth/admin/kyc 已在子包）。扩展:
```typescript
subPackages: [
  { root: 'pages/auth', pages: [...] },
  { root: 'pages/admin', pages: [...] },
  { root: 'pages/kyc', pages: [...] },
  { root: 'pages/community', pages: ['feed/index', 'post/index', 'create/index', 'circle/...'] },  // 新增
  { root: 'pages/marketing', pages: ['checkin/index', 'points/index', 'points/shop', 'coupon/list'] },  // 新增
  { root: 'pages/notification', pages: ['index/index'] }  // 新增
]
```

### 7.4 图片懒加载

NutUI `<Image lazyLoad />` 已有，但当前未启用。统一改造:
- `ProductCard`, `PostCard`, `NotificationItem`, `CouponCard` 等列表卡片 → `lazyLoad={true}`
- 长列表场景：IntersectionObserver 手动控制可见性

### 7.5 动态 import

```typescript
// 旧: import Admin from '@/pages/admin/dashboard'
// 新:
const Admin = lazy(() => import('@/pages/admin/dashboard'))
```

**优先级**:
1. admin/* (运营后台，普通用户 90% 不会进入)
2. kyc/* (实名认证，仅未认证用户)
3. address/* (收货地址，按需)

### 7.6 CDN 外置

字体文件: `src/assets/fonts/*` → 改外链 `<link href="https://cdn.example.com/font.woff2">`
图标 SVG: 走 NutUI Icons 库（已按需加载）

## 8. 设置页

### 8.1 区块设计

```
┌──────────────────────────────┐
│ ← 设置                        │
├──────────────────────────────┤
│ [头像] 用户昵称 [脱敏手机号]   │  ← 账号
├──────────────────────────────┤
│ 关于 REMX        v1.0.0  >    │  ← 关于
│ 隐私政策                >     │
│ 用户协议                >     │
├──────────────────────────────┤
│ 语言              中文  >     │  ← 嵌入 LanguageSwitcher
│ 缓存              12.3 MB  > │  ← 一键清理
├──────────────────────────────┤
│        [ 退出登录 ]           │
└──────────────────────────────┘
```

### 8.2 缓存清理实现

```typescript
async function clearCache() {
  const { confirm } = await Taro.showModal({ title: '清理缓存', content: `确定清理 ${cacheSize}MB 缓存？` })
  if (!confirm) return
  // 保留 token + locale
  const token = Taro.getStorageSync('token')
  const locale = Taro.getStorageSync('@remx/locale')
  Taro.clearStorageSync()
  Taro.setStorageSync('token', token)
  Taro.setStorageSync('@remx/locale', locale)
  Taro.showToast({ title: '清理成功', icon: 'success' })
  await calculateCacheSize()
}
```

## 9. 风险与测试策略

### 9.1 风险矩阵

| 风险 | 概率 | 影响 | 缓解 | 检测 |
|------|------|------|------|------|
| i18n 遗漏 key | 中 | 中 | i18next-scanner + dev warn | grep 验证 |
| Canvas 真机性能差 | 高 | 中 | 服务端 fallback | 真机 preview |
| 分享回调失败 | 低 | 低 | DEFAULT_SHARE_CONFIG 兜底 | 微信开发者工具 |
| 主包超 2MB | 中 | 高 | 分包按需加载 | analyze 报告 |
| 海报图加载失败 | 中 | 低 | 默认图 + 重试 | 单测 + 真机 |
| 动态 import 引入 bug | 低 | 中 | 灰度发布 + feature flag | 回归测试 |

### 9.2 测试策略

**单元测试** (vitest):
- `share.ts`: 模板变量解析、mergeConfig、default fallback
- `canvas.ts`: 工具函数（mock canvas API）
- `FilterPanel`: 状态机转换

**集成测试** (Taro 模拟器):
- 5 核心流程跑通:
  1. 搜索（输入 → 建议 → 筛选 → 排序）
  2. 分享（详情 → 右上角 → 分享给朋友）
  3. 语言切换（设置 → 切换 → 刷新 → 持久化）
  4. 列表四态（loading → empty → error → data）
  5. 海报（点击 → 绘制 → 保存到相册）

**兼容性测试**:
- 微信开发者工具模拟器 + 至少 1 个真机
- iOS / Android 各一
- 支付宝小程序（如时间允许）

**性能测试**:
- Lighthouse / Taro analyze 输出主包体积
- 长列表滚动 FPS 监控（开发者工具 Performance 面板）
- 首次加载 < 3s（4G 网络模拟）

### 9.3 回归测试重点

1. **i18n 切换** 不会破坏已接入页面的渲染
2. **ShareProvider** 不会影响页面 props 透传
3. **Skeleton** 切换到真实数据时无闪烁
4. **FilterPanel** 关闭后状态正确重置
5. **语言切换** 后图片/数字等本地化也跟随（如货币、日期）

## 10. 实施顺序

```
Day 1-2: T1 (i18n) — 1 个 subagent 一次性接入 34 页面 + 2 ns
Day 2-3: T2 (搜索) — 1 个 subagent
Day 3-4: T3 (分享 + 海报) — 1 个 subagent (依赖 T1 i18n keys)
Day 4:   T4 (UI 统一) — 1 个 subagent (依赖 T1+T2)
Day 5:   T5 (性能) — 1 个 subagent (依赖 T1-T4)
Day 5:   T6 (验证) — review + 回归
```

**Subagent 调度**: T1 / T2 / T3 真正并行启动，T4 在 T1+T2+T3 全部完成后启动，T5 在 T4 完成后启动。

## 11. Spec Patch（回写到 OpenSpec delta spec）

本次设计未发现需要回写的 Spec Patch。所有验收场景已完整。

## 12. 开放问题（决策前已知，未在 OpenSpec 范围）

- 邀请海报是否需要支持 A/B 模板（不同活动用不同背景图）？— **本期不做**
- 海报图是否需要支持水印（用户昵称）？— **本期不做**
- 性能测量是否需要在 CI 中跑（自动报告）？— **本期手动跑**
- i18n 是否需要支持繁体中文（zh-TW）？— **本期只做 zh-CN + en-US**
