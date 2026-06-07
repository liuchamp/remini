---
archived-with: 2026-06-07-phase3-experience-polish
status: final
---
# Phase 3: Experience Polish Implementation Plan

```yaml
---
change: phase3-experience-polish
design-doc: docs/superpowers/specs/2026-06-07-phase3-experience-polish-design.md
base-ref: 490b31e6d65c1e23c178330cdf22dbf3616c8bff
---
```

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一次性补齐 5 项体验级短板（i18n 全量 / 搜索完善 / 分享海报 / UI 统一 / 性能优化），达到可提审的体验基线

**Architecture:** 5 模块并行 → 串行收口。ShareProvider HOC 集中抽象分享；Share/海报共享 page config 中心；i18n 一次性集中接入 + 2 新 namespace；UI 统一四态（Skeleton/Empty/Error/RetryButton）；性能 measure-driven 决策表

**Tech Stack:** Taro 4 + React 18 + TypeScript + NutUI + Zustand + i18next + react-i18next + Sass

---

## 文件结构总览（先看分解）

**新增组件** (5):
- `src/shared/components/i18n/LanguageSwitcher/index.tsx` + `.scss`
- `src/shared/components/share/ShareProvider/index.tsx`
- `src/shared/components/share/ShareButton/index.tsx` + `.scss`
- `src/shared/components/share/PosterGenerator/index.tsx` + `.scss`
- `src/shared/components/product/FilterPanel/index.tsx` + `.scss`
- `src/shared/components/product/HotSearches/index.tsx` + `.scss`
- `src/shared/components/Skeleton/index.tsx` + `.scss`
- `src/shared/components/RetryButton/index.tsx` + `.scss`

**新增工具** (2):
- `src/shared/utils/share.ts` (PAGE_SHARE_CONFIG + helpers)
- `src/shared/utils/canvas.ts` (loadImage / drawPoster / saveToAlbum)

**新增页面** (3):
- `src/pages/user/settings/index.tsx` + `.scss` + `.config.ts`
- `src/pages/poster/preview/index.tsx` + `.scss` + `.config.ts` (服务端 fallback 用)
- 各种 .config.ts (路由注册)

**新增 i18n 资源** (4):
- `src/shared/i18n/resources/zh-CN/community.json`
- `src/shared/i18n/resources/zh-CN/notification.json`
- `src/shared/i18n/resources/en-US/community.json`
- `src/shared/i18n/resources/en-US/notification.json`

**修改页面** (~40):
- 6 个核心页面：商品详情 / 帖子详情 / 邀请 / 个人主页 / 签到 / 积分中心 (ShareProvider 接入)
- 10 个列表页：Feed/Post/Checkin/Points/Coupon/Notification/Order/Offer/ProductList/Search (UI 四态统一)
- 34 个页面：i18n useTranslation 接入

**修改基础**:
- `src/shared/i18n/index.ts` (注册新 namespace)
- `src/shared/i18n/resources/zh-CN/common.json` (扩展 retry/empty/error 等 key)
- `src/shared/i18n/resources/en-US/common.json` (同上)
- `src/domains/product/api.ts` (新增 searchSuggest / getHotSearches)
- `src/app.config.ts` (注册新页面 + 调整 subPackages)
- `package.json` (新增依赖 i18next-scanner for build-time validation)

---

## 任务依赖图

```
T1 (i18n) ─┐
T2 (搜索) ─┼──→ T4 (UI 统一) ──┐
T3 (分享) ─┘                    │
                                ▼
                              T5 (性能) → T6 (验证)
```

---

# Task 1: i18n 全量接入

**Files:**
- Create: `src/shared/i18n/resources/zh-CN/community.json`
- Create: `src/shared/i18n/resources/zh-CN/notification.json`
- Create: `src/shared/i18n/resources/en-US/community.json`
- Create: `src/shared/i18n/resources/en-US/notification.json`
- Create: `src/shared/components/i18n/LanguageSwitcher/index.tsx`
- Create: `src/shared/components/i18n/LanguageSwitcher/index.scss`
- Create: `src/pages/user/settings/index.tsx`
- Create: `src/pages/user/settings/index.scss`
- Create: `src/pages/user/settings/index.config.ts`
- Modify: `src/shared/i18n/index.ts` (注册新 namespace)
- Modify: `src/shared/i18n/resources/zh-CN/common.json` (扩展 retry/empty.* 等)
- Modify: `src/shared/i18n/resources/en-US/common.json` (同上)
- Modify: 34 个 .tsx 页面 (useTranslation 接入)
- Modify: `src/app.config.ts` (注册 settings 页面)

### Task 1.1: 创建 community namespace (zh-CN)

**Files:**
- Create: `src/shared/i18n/resources/zh-CN/community.json`

- [ ] **Step 1: 写入 community.json (zh-CN)**

```json
{
  "feed": {
    "tabRecommend": "推荐",
    "tabFollow": "关注",
    "tabCircle": "圈子",
    "emptyText": "还没有内容",
    "pullRefresh": "下拉刷新",
    "release": "发布"
  },
  "post": {
    "title": "帖子详情",
    "commentPlaceholder": "说点什么吧...",
    "replyPlaceholder": "回复 @{user}:",
    "likeCount": "{count} 赞",
    "commentCount": "{count} 评论",
    "shareCount": "{count} 分享"
  },
  "create": {
    "title": "发布帖子",
    "contentPlaceholder": "分享你的想法...（500字以内）",
    "addImage": "添加图片",
    "selectCircle": "选择圈子",
    "submit": "发布",
    "submitting": "发布中...",
    "success": "发布成功",
    "sensitiveWord": "内容包含敏感词，请修改"
  },
  "circle": {
    "join": "加入",
    "joined": "已加入",
    "members": "{count} 成员"
  },
  "comment": {
    "submit": "发送",
    "delete": "删除",
    "confirmDelete": "确定删除此评论？"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/i18n/resources/zh-CN/community.json
git commit -m "feat(i18n): add community namespace (zh-CN)"
```

### Task 1.2: 创建 community namespace (en-US)

**Files:**
- Create: `src/shared/i18n/resources/en-US/community.json`

- [ ] **Step 1: 写入 community.json (en-US)**

```json
{
  "feed": {
    "tabRecommend": "Recommended",
    "tabFollow": "Following",
    "tabCircle": "Circles",
    "emptyText": "No content yet",
    "pullRefresh": "Pull to refresh",
    "release": "Post"
  },
  "post": {
    "title": "Post",
    "commentPlaceholder": "Say something...",
    "replyPlaceholder": "Reply to @{user}:",
    "likeCount": "{count} likes",
    "commentCount": "{count} comments",
    "shareCount": "{count} shares"
  },
  "create": {
    "title": "Create Post",
    "contentPlaceholder": "Share your thoughts... (max 500 chars)",
    "addImage": "Add Image",
    "selectCircle": "Select Circle",
    "submit": "Post",
    "submitting": "Posting...",
    "success": "Posted successfully",
    "sensitiveWord": "Content contains sensitive words"
  },
  "circle": {
    "join": "Join",
    "joined": "Joined",
    "members": "{count} members"
  },
  "comment": {
    "submit": "Send",
    "delete": "Delete",
    "confirmDelete": "Delete this comment?"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/i18n/resources/en-US/community.json
git commit -m "feat(i18n): add community namespace (en-US)"
```

### Task 1.3: 创建 notification namespace (zh-CN + en-US)

**Files:**
- Create: `src/shared/i18n/resources/zh-CN/notification.json`
- Create: `src/shared/i18n/resources/en-US/notification.json`

- [ ] **Step 1: 写入 notification.json (zh-CN)**

```json
{
  "tab": {
    "system": "系统",
    "transaction": "交易",
    "marketing": "营销"
  },
  "status": {
    "unread": "未读",
    "read": "已读"
  },
  "action": {
    "markRead": "标记已读",
    "markAllRead": "全部已读",
    "viewDetail": "查看详情"
  },
  "empty": {
    "system": "暂无系统通知",
    "transaction": "暂无交易通知",
    "marketing": "暂无营销通知"
  },
  "type": {
    "order": "订单",
    "offer": "出价",
    "promotion": "活动",
    "system": "系统"
  }
}
```

- [ ] **Step 2: 写入 notification.json (en-US)**

```json
{
  "tab": {
    "system": "System",
    "transaction": "Transaction",
    "marketing": "Marketing"
  },
  "status": {
    "unread": "Unread",
    "read": "Read"
  },
  "action": {
    "markRead": "Mark as read",
    "markAllRead": "Mark all as read",
    "viewDetail": "View detail"
  },
  "empty": {
    "system": "No system notifications",
    "transaction": "No transaction notifications",
    "marketing": "No marketing notifications"
  },
  "type": {
    "order": "Order",
    "offer": "Offer",
    "promotion": "Promotion",
    "system": "System"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/i18n/resources/{zh-CN,en-US}/notification.json
git commit -m "feat(i18n): add notification namespace (zh-CN+en-US)"
```

### Task 1.4: 扩展 common namespace

**Files:**
- Modify: `src/shared/i18n/resources/zh-CN/common.json`
- Modify: `src/shared/i18n/resources/en-US/common.json`

- [ ] **Step 1: 在 zh-CN/common.json 末尾追加 keys**

```json
{
  // ... 现有内容 ...
  "action": {
    "confirm": "确认",
    "cancel": "取消",
    "retry": "重试",
    "save": "保存",
    "share": "分享",
    "close": "关闭",
    "back": "返回"
  },
  "empty": {
    "list": "暂无数据",
    "search": "暂无相关结果",
    "network": "网络连接失败",
    "default": "什么都没有"
  },
  "error": {
    "network": "网络异常，请稍后重试",
    "server": "服务异常，请稍后重试",
    "unknown": "未知错误"
  },
  "loading": "加载中..."
}
```

- [ ] **Step 2: 在 en-US/common.json 末尾追加 keys**

```json
{
  // ... 现有内容 ...
  "action": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "retry": "Retry",
    "save": "Save",
    "share": "Share",
    "close": "Close",
    "back": "Back"
  },
  "empty": {
    "list": "No data",
    "search": "No results",
    "network": "Network failed",
    "default": "Nothing here"
  },
  "error": {
    "network": "Network error, please retry",
    "server": "Server error, please retry",
    "unknown": "Unknown error"
  },
  "loading": "Loading..."
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/i18n/resources/{zh-CN,en-US}/common.json
git commit -m "feat(i18n): extend common namespace with action/empty/error/loading"
```

### Task 1.5: 注册新 namespace 到 i18n index

**Files:**
- Modify: `src/shared/i18n/index.ts`

- [ ] **Step 1: 修改 index.ts**

在 `import` 块添加：
```typescript
import zhCommunity from './resources/zh-CN/community.json'
import zhNotification from './resources/zh-CN/notification.json'
import enCommunity from './resources/en-US/community.json'
import enNotification from './resources/en-US/notification.json'
```

在 `resources` 对象添加：
```typescript
const resources = {
  'zh-CN': { 
    common: zhCommon, auth: zhAuth, product: zhProduct, trade: zhTrade, 
    chat: zhChat, profile: zhProfile, validation: zhValidation, 
    marketing: zhMarketing, logistics: zhLogistics, wallet: zhWallet, 
    kyc: zhKyc, community: zhCommunity, notification: zhNotification 
  },
  'en-US': { 
    common: enCommon, auth: enAuth, product: enProduct, trade: enTrade, 
    chat: enChat, profile: enProfile, validation: enValidation, 
    marketing: enMarketing, logistics: enLogistics, wallet: enWallet, 
    kyc: enKyc, community: enCommunity, notification: enNotification 
  }
}
```

在 `init` 的 `ns` 数组添加：`'community', 'notification'`

- [ ] **Step 2: 提交**

```bash
git add src/shared/i18n/index.ts
git commit -m "feat(i18n): register community+notification namespaces"
```

### Task 1.6: 创建 LanguageSwitcher 组件

**Files:**
- Create: `src/shared/components/i18n/LanguageSwitcher/index.tsx`
- Create: `src/shared/components/i18n/LanguageSwitcher/index.scss`

- [ ] **Step 1: 写入 LanguageSwitcher/index.tsx**

```typescript
import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { changeLanguage } from '@/shared/i18n'
import i18n from 'i18next'
import './index.scss'

interface Props {
  type?: 'list-item' | 'inline'
}

export function LanguageSwitcher({ type = 'list-item' }: Props) {
  const [currentLang, setCurrentLang] = useState<'zh-CN' | 'en-US'>(
    (i18n.language as 'zh-CN' | 'en-US') || 'zh-CN'
  )

  const toggle = () => {
    const next = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN'
    changeLanguage(next)
    setCurrentLang(next)
  }

  if (type === 'inline') {
    return (
      <View className='lang-switcher-inline' onClick={toggle}>
        <Text className='lang-text'>{currentLang === 'zh-CN' ? '中文' : 'English'}</Text>
      </View>
    )
  }

  return (
    <View className='lang-switcher-list-item' onClick={toggle}>
      <Text className='lang-label'>{i18n.t('common:action.share') /* 或 'Language' */}</Text>
      <Text className='lang-value'>{currentLang === 'zh-CN' ? '简体中文' : 'English'}</Text>
    </View>
  )
}

export default LanguageSwitcher
```

- [ ] **Step 2: 写入 LanguageSwitcher/index.scss**

```scss
.lang-switcher-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #fff;
  
  .lang-label {
    font-size: 28px;
    color: #333;
  }
  .lang-value {
    font-size: 28px;
    color: #999;
  }
}

.lang-switcher-inline {
  display: inline-block;
  padding: 8px 16px;
  
  .lang-text {
    font-size: 26px;
    color: #1989fa;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/i18n/
git commit -m "feat(i18n): add LanguageSwitcher component"
```

### Task 1.7: 创建设置页 (Settings)

**Files:**
- Create: `src/pages/user/settings/index.tsx`
- Create: `src/pages/user/settings/index.scss`
- Create: `src/pages/user/settings/index.config.ts`
- Modify: `src/app.config.ts` (注册路由)

- [ ] **Step 1: 写入 index.config.ts**

```typescript
export default {
  navigationBarTitleText: '设置',
  navigationBarBackgroundColor: '#ffffff',
  navigationBarTextStyle: 'black',
  enablePullDownRefresh: false
}
```

- [ ] **Step 2: 写入 index.tsx**

```typescript
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/shared/components/i18n/LanguageSwitcher'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

export default function Settings() {
  const { t } = useTranslation(['common'])
  const [cacheSize, setCacheSize] = useState('0 KB')
  const [appVersion] = useState('v1.0.0')
  const { logout } = useAuthStore()

  useEffect(() => {
    calculateCacheSize()
  }, [])

  const calculateCacheSize = async () => {
    try {
      const res = await Taro.getStorageInfo()
      const sizeKB = Math.round(res.currentSize / 1024 * 10) / 10
      setCacheSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`)
    } catch {
      setCacheSize('0 KB')
    }
  }

  const handleClearCache = async () => {
    const res = await Taro.showModal({
      title: t('common:action.confirm'),
      content: `确定清理 ${cacheSize} 缓存？`
    })
    if (!res.confirm) return

    const token = Taro.getStorageSync('token')
    const locale = Taro.getStorageSync('@remx/locale')
    Taro.clearStorageSync()
    if (token) Taro.setStorageSync('token', token)
    if (locale) Taro.setStorageSync('@remx/locale', locale)
    Taro.showToast({ title: '清理成功', icon: 'success' })
    await calculateCacheSize()
  }

  const handleLogout = async () => {
    const res = await Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？'
    })
    if (!res.confirm) return
    logout()
    Taro.reLaunch({ url: '/pages/auth/login/index' })
  }

  const goPrivacy = () => Taro.navigateTo({ url: '/pages/static/webview/index?url=https://example.com/privacy' })
  const goTerms = () => Taro.navigateTo({ url: '/pages/static/webview/index?url=https://example.com/terms' })
  const checkUpdate = () => Taro.showToast({ title: '已是最新版本', icon: 'none' })

  return (
    <View className='settings-page'>
      <View className='section'>
        <View className='section-title'>关于</View>
        <View className='row' onClick={checkUpdate}>
          <Text className='row-label'>当前版本</Text>
          <Text className='row-value'>{appVersion}</Text>
        </View>
        <View className='row' onClick={goPrivacy}>
          <Text className='row-label'>隐私政策</Text>
          <Text className='row-arrow'>›</Text>
        </View>
        <View className='row' onClick={goTerms}>
          <Text className='row-label'>用户协议</Text>
          <Text className='row-arrow'>›</Text>
        </View>
      </View>

      <View className='section'>
        <View className='section-title'>通用</View>
        <View className='row'>
          <Text className='row-label'>语言</Text>
          <LanguageSwitcher type='inline' />
        </View>
        <View className='row' onClick={handleClearCache}>
          <Text className='row-label'>清理缓存</Text>
          <Text className='row-value'>{cacheSize}</Text>
        </View>
      </View>

      <View className='logout-section'>
        <View className='logout-btn' onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>
    </View>
  )
}
```

- [ ] **Step 3: 写入 index.scss**

```scss
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.section {
  margin: 20px 0;
  background: #fff;
}

.section-title {
  padding: 20px 32px 12px;
  font-size: 24px;
  color: #999;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .row-label {
    font-size: 28px;
    color: #333;
  }
  .row-value {
    font-size: 28px;
    color: #999;
  }
  .row-arrow {
    font-size: 32px;
    color: #ccc;
  }
}

.logout-section {
  padding: 40px 32px;
}

.logout-btn {
  background: #fff;
  border-radius: 8px;
  padding: 28px 0;
  text-align: center;
  font-size: 30px;
  color: #ee0a24;
  font-weight: 500;
}
```

- [ ] **Step 4: 注册路由到 app.config.ts**

在 `src/app.config.ts` 的 `pages` 数组中添加（按字母顺序）:
```typescript
'pages/user/settings/index',
```

- [ ] **Step 5: 提交**

```bash
git add src/pages/user/settings/ src/app.config.ts
git commit -m "feat(settings): add settings page with language/cache/logout"
```

### Task 1.8: 一次性接入 34 个页面的 useTranslation

**Files:**
- Modify: 34 个 .tsx 页面

**策略**: 一次 subagent 任务。Prompt 包含：
- 现有 24 个已接入页面作为模式参考
- 每个页面使用 `const { t } = useTranslation(['namespace', 'common'])`
- 公共文案 → `common` namespace
- 页面专属 → 对应 namespace
- 提交前 grep 验证 0 硬编码中文段落

**Subagent prompt 模板**:
```
目标：一次性把剩余 34 个 .tsx 页面接入 useTranslation
参考模式：src/pages/auth/login/index.tsx（已接入）
输入文件清单：
- product: detail, list, search (3 files) → useTranslation(['product', 'common'])
- trade: order/* (5), payment/* (1) → useTranslation(['trade', 'common'])
- kyc: phone, identity, liveness, index (4) → useTranslation(['kyc', 'common'])
- wallet: index, transactions, withdraw, bind-card (4) → useTranslation(['wallet', 'common'])
- offer: list, detail (2) → useTranslation(['trade', 'common'])
- message: list, chat (2) → useTranslation(['chat', 'common'])
- my: profile, edit, my-posts, favorites, following, settings (6) → useTranslation(['profile', 'common'])
- admin: dashboard, user-mgmt (2) → useTranslation(['profile', 'common'])
- invite: index (1) → useTranslation(['profile', 'common'])
- address: list, edit (2) → useTranslation(['logistics', 'common'])
- category: index (1) → useTranslation(['product', 'common'])
- home/index (1) → useTranslation(['product', 'common'])
约束：
- 不修改任何业务逻辑
- 不修改样式
- 仅替换硬编码中文字符串为 t('key')
- common 已有 key: action.* empty.* error.* loading (在 common.json)
- 缺翻译的 key 使用 zh-CN fallback
- 提交前 grep -r --include="*.tsx" '[一-龥]\{4,\}' src/pages/ 验证无 4+ 中文字符
- 提交：1 个 commit "feat(i18n): integrate useTranslation in 34 pages"
输出：
- 1 个 commit
- 1 个 summary 报告列出修改的 34 个文件
- grep 验证 0 硬编码
```

- [ ] **Step 1: 委派 subagent 执行（详细 prompt 见上述）**

```bash
# 实际执行：使用 task() 委派 subagent
```

- [ ] **Step 2: 验证**

```bash
grep -r --include="*.tsx" '[一-龥]\{4,\}' src/pages/ | head -5
# 期望：无输出（除合法 4+ 字中文字符如"已加载"等状态文案）
```

- [ ] **Step 3: 提交**

（由 subagent 自动提交）

---

# Task 2: 搜索页完善

**Files:**
- Modify: `src/domains/product/api.ts` (新增 searchSuggest / getHotSearches)
- Create: `src/shared/components/product/FilterPanel/index.tsx` + `.scss`
- Create: `src/shared/components/product/HotSearches/index.tsx` + `.scss`
- Modify: `src/pages/product/search/index.tsx` (重写)
- Modify: `src/shared/i18n/resources/{zh-CN,en-US}/product.json` (新增搜索相关 keys)

### Task 2.1: 扩展 product API

**Files:**
- Modify: `src/domains/product/api.ts`

- [ ] **Step 1: 添加新方法**

在 `productApi` 对象中添加:
```typescript
searchSuggest(keyword: string) {
  return http.get<{ suggestions: string[] }>('/product/search/suggest', { keyword })
},

getHotSearches() {
  return http.get<{ keywords: string[] }>('/product/search/hot')
}
```

- [ ] **Step 2: 提交**

```bash
git add src/domains/product/api.ts
git commit -m "feat(product): add searchSuggest and getHotSearches APIs"
```

### Task 2.2: 创建 HotSearches 组件

**Files:**
- Create: `src/shared/components/product/HotSearches/index.tsx`
- Create: `src/shared/components/product/HotSearches/index.scss`

- [ ] **Step 1: 写入 index.tsx**

```typescript
import { View, Text } from '@tarojs/components'
import './index.scss'

interface Props {
  keywords: string[]
  onSelect: (keyword: string) => void
}

export function HotSearches({ keywords, onSelect }: Props) {
  if (keywords.length === 0) return null

  return (
    <View className='hot-searches'>
      <View className='hot-title'>热门搜索</View>
      <View className='hot-chips'>
        {keywords.map((kw) => (
          <View key={kw} className='hot-chip' onClick={() => onSelect(kw)}>
            <Text>{kw}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default HotSearches
```

- [ ] **Step 2: 写入 index.scss**

```scss
.hot-searches {
  padding: 24px 32px;
  
  .hot-title {
    font-size: 26px;
    color: #999;
    margin-bottom: 16px;
  }
  .hot-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .hot-chip {
    padding: 12px 24px;
    background: #f5f5f5;
    border-radius: 32px;
    font-size: 26px;
    color: #333;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/product/HotSearches/
git commit -m "feat(search): add HotSearches component"
```

### Task 2.3: 创建 FilterPanel 组件

**Files:**
- Create: `src/shared/components/product/FilterPanel/index.tsx`
- Create: `src/shared/components/product/FilterPanel/index.scss`

- [ ] **Step 1: 写入 index.tsx**

```typescript
import Taro from '@tarojs/taro'
import { View, Text, Switch, Slider, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

export interface FilterState {
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

const CONDITIONS = [
  { value: 'new', label: '全新' },
  { value: 'like-new', label: '9 成新' },
  { value: 'good', label: '8 成新' },
  { value: 'fair', label: '7 成新' }
]

const SORTS = [
  { value: 'default', label: '综合' },
  { value: 'price_asc', label: '价格 ↑' },
  { value: 'price_desc', label: '价格 ↓' },
  { value: 'newest', label: '最新' },
  { value: 'distance', label: '距离最近' }
]

export function FilterPanel({ visible, value, onApply, onClose }: Props) {
  const [local, setLocal] = useState<FilterState>(value)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    value.priceMin || 0,
    value.priceMax || 10000
  ])

  useEffect(() => {
    setLocal(value)
    setPriceRange([value.priceMin || 0, value.priceMax || 10000])
  }, [value])

  if (!visible) return null

  const handleApply = () => {
    onApply({
      ...local,
      priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
      priceMax: priceRange[1] < 10000 ? priceRange[1] : undefined
    })
  }

  return (
    <View className='filter-panel-mask' onClick={onClose}>
      <View className='filter-panel' onClick={(e) => e.stopPropagation()}>
        <View className='filter-header'>
          <Text className='filter-title'>筛选</Text>
        </View>

        <View className='filter-section'>
          <Text className='filter-label'>价格区间</Text>
          <Slider
            range
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onChange={(e) => setPriceRange(e.detail.value as [number, number])}
          />
          <Text className='filter-hint'>¥{priceRange[0]} - ¥{priceRange[1]}</Text>
        </View>

        <View className='filter-section'>
          <Text className='filter-label'>成色</Text>
          <View className='filter-options'>
            {CONDITIONS.map((c) => (
              <View
                key={c.value}
                className={`filter-chip ${local.condition === c.value ? 'active' : ''}`}
                onClick={() => setLocal({ ...local, condition: c.value as FilterState['condition'] })}
              >
                <Text>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-section'>
          <Text className='filter-label'>排序</Text>
          <View className='filter-options'>
            {SORTS.map((s) => (
              <View
                key={s.value}
                className={`filter-chip ${local.sort === s.value ? 'active' : ''}`}
                onClick={() => setLocal({ ...local, sort: s.value as FilterState['sort'] })}
              >
                <Text>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-section row'>
          <Text className='filter-label'>仅显示可议价</Text>
          <Switch
            checked={local.negotiableOnly || false}
            onChange={(e) => setLocal({ ...local, negotiableOnly: e.detail.value })}
          />
        </View>

        <View className='filter-footer'>
          <Button className='btn-reset' onClick={() => {
            setLocal({})
            setPriceRange([0, 10000])
          }}>重置</Button>
          <Button className='btn-apply' onClick={handleApply}>应用</Button>
        </View>
      </View>
    </View>
  )
}

export default FilterPanel
```

- [ ] **Step 2: 写入 index.scss**

```scss
.filter-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
}

.filter-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 32px;
  max-height: 80vh;
  overflow-y: auto;
}

.filter-header {
  text-align: center;
  margin-bottom: 24px;
  
  .filter-title {
    font-size: 32px;
    font-weight: 600;
    color: #333;
  }
}

.filter-section {
  margin-bottom: 32px;
  
  .filter-label {
    display: block;
    font-size: 28px;
    color: #333;
    margin-bottom: 16px;
  }
  .filter-hint {
    display: block;
    font-size: 24px;
    color: #999;
    margin-top: 8px;
  }
  
  &.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-chip {
  padding: 12px 24px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 26px;
  color: #333;
  
  &.active {
    background: #1989fa;
    color: #fff;
  }
}

.filter-footer {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  
  .btn-reset, .btn-apply {
    flex: 1;
    border-radius: 8px;
    font-size: 30px;
  }
  .btn-reset {
    background: #f5f5f5;
    color: #333;
  }
  .btn-apply {
    background: #1989fa;
    color: #fff;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/product/FilterPanel/
git commit -m "feat(search): add FilterPanel component"
```

### Task 2.4: 重写 search 页面

**Files:**
- Modify: `src/pages/product/search/index.tsx`

- [ ] **Step 1: 重写 index.tsx**

（完整代码，包含 Input + HotSearches + 历史 + 建议下拉 + FilterPanel + 排序 Tab + 结果列表）

```typescript
import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { productApi } from '@/domains/product/api'
import { HotSearches } from '@/shared/components/product/HotSearches'
import { FilterPanel, type FilterState } from '@/shared/components/product/FilterPanel'
import './index.scss'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10
const HOT_CACHE_MS = 5 * 60 * 1000

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [hotSearches, setHotSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})
  const lastHotFetch = useRef<number>(0)

  const debouncedKeyword = useDebounce(keyword, 300)

  useEffect(() => {
    try {
      const history = Taro.getStorageSync(HISTORY_KEY)
      setSearchHistory(Array.isArray(history) ? history : [])
    } catch {
      setSearchHistory([])
    }
    fetchHotSearches()
  }, [])

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      fetchSuggest(debouncedKeyword.trim())
      performSearch(debouncedKeyword.trim(), filters)
    } else {
      setSuggestions([])
      setResults([])
      setHasSearched(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword])

  const fetchHotSearches = async () => {
    if (Date.now() - lastHotFetch.current < HOT_CACHE_MS) return
    try {
      const res = await productApi.getHotSearches()
      if (res.code === 0) {
        setHotSearches((res.data as { keywords: string[] }).keywords || [])
        lastHotFetch.current = Date.now()
      }
    } catch { /* silent */ }
  }

  const fetchSuggest = async (kw: string) => {
    try {
      const res = await productApi.searchSuggest(kw)
      if (res.code === 0) {
        setSuggestions((res.data as { suggestions: string[] }).suggestions || [])
      }
    } catch { setSuggestions([]) }
  }

  const saveToHistory = (kw: string) => {
    const updated = [kw, ...searchHistory.filter((h) => h !== kw)].slice(0, MAX_HISTORY)
    setSearchHistory(updated)
    try { Taro.setStorageSync(HISTORY_KEY, updated) } catch { /* */ }
  }

  const performSearch = async (kw: string, f: FilterState) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await productApi.search({
        keyword: kw,
        page: 1,
        limit: 20,
        ...f
      })
      if (res.code === 0) {
        setResults((res.data as { products: Product[] }).products || [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) return
    saveToHistory(trimmed)
    setSuggestions([])
  }

  const handleConfirm = (e: { detail: { value: string } }) => {
    handleSearch(e.detail.value)
  }

  const handleSelect = (kw: string) => {
    setKeyword(kw)
    handleSearch(kw)
  }

  const handleApplyFilter = (newFilters: FilterState) => {
    setFilters(newFilters)
    setFilterVisible(false)
    if (debouncedKeyword.trim()) {
      performSearch(debouncedKeyword.trim(), newFilters)
    }
  }

  const clearHistory = () => {
    setSearchHistory([])
    try { Taro.setStorageSync(HISTORY_KEY, []) } catch { /* */ }
  }

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <Input
          className='search-input'
          placeholder='搜索商品'
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleConfirm}
        />
        <View className='search-cancel' onClick={() => Taro.navigateBack()}>
          <Text>取消</Text>
        </View>
      </View>

      {!hasSearched && (
        <ScrollView scrollY className='search-suggestions-area'>
          <HotSearches keywords={hotSearches} onSelect={handleSelect} />
          {searchHistory.length > 0 && (
            <View className='search-history'>
              <View className='history-header'>
                <Text className='history-title'>历史记录</Text>
                <Text className='history-clear' onClick={clearHistory}>× 清空</Text>
              </View>
              <View className='history-chips'>
                {searchHistory.map((h) => (
                  <View key={h} className='history-chip' onClick={() => handleSelect(h)}>
                    <Text>{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {hasSearched && suggestions.length > 0 && (
        <View className='search-suggestions'>
          {suggestions.map((s) => (
            <View key={s} className='suggestion-item' onClick={() => handleSelect(s)}>
              <Text>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {hasSearched && (
        <View className='search-results'>
          <View className='results-toolbar'>
            <Text className='toolbar-text'>共 {results.length} 条结果</Text>
            <View className='toolbar-filter' onClick={() => setFilterVisible(true)}>
              <Text>筛选 ▼</Text>
            </View>
          </View>
          <ScrollView scrollY className='results-list'>
            {results.map((p) => (
              <View key={p.id} className='result-item' onClick={() => handleProductClick(p.id)}>
                <Text className='result-title'>{p.title}</Text>
                <Text className='result-price'>¥{p.price}</Text>
              </View>
            ))}
            {results.length === 0 && !loading && (
              <View className='result-empty'>暂无相关商品</View>
            )}
          </ScrollView>
        </View>
      )}

      <FilterPanel
        visible={filterVisible}
        value={filters}
        onApply={handleApplyFilter}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/product/search/index.tsx
git commit -m "feat(search): rewrite search page with suggestions, hot searches, filter panel"
```

---

# Task 3: 分享与海报

**Files:**
- Create: `src/shared/utils/share.ts`
- Create: `src/shared/utils/canvas.ts`
- Create: `src/shared/components/share/ShareProvider/index.tsx`
- Create: `src/shared/components/share/ShareButton/index.tsx` + `.scss`
- Create: `src/shared/components/share/PosterGenerator/index.tsx` + `.scss`
- Create: `src/pages/poster/preview/index.tsx` + `.scss` + `.config.ts`
- Modify: 6 个核心页面 (ShareProvider 接入)
- Modify: `src/app.config.ts` (注册 poster/preview 路由)

### Task 3.1: 创建 share.ts 工具

**Files:**
- Create: `src/shared/utils/share.ts`

- [ ] **Step 1: 写入 share.ts**

```typescript
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect } from 'react'

export interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  title: 'REMX 二手市场',
  path: '',
  imageUrl: ''
}

export const PAGE_SHARE_CONFIG: Record<string, ShareConfig> = {
  '/pages/product/detail/index': {
    title: '好货分享',
    path: '',
    imageUrl: ''
  },
  '/pages/community/post/index': {
    title: '精彩帖子',
    path: '',
    imageUrl: ''
  },
  '/pages/invite/index/index': {
    title: '加入 REMX 二手市场',
    path: '',
    imageUrl: '/static/share/invite-default.png'
  },
  '/pages/user/profile/index': {
    title: '个人主页',
    path: '',
    imageUrl: ''
  },
  '/pages/checkin/index/index': {
    title: '每日签到',
    path: '',
    imageUrl: ''
  },
  '/pages/points/index/index': {
    title: '积分中心',
    path: '',
    imageUrl: ''
  }
}

export function mergeConfig(base: ShareConfig, override?: Partial<ShareConfig>): ShareConfig {
  return { ...base, ...(override || {}) }
}

export function resolveTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => vars[key] || '')
}

export function ShareProvider<P extends object>(
  Component: React.ComponentType<P>,
  overrides?: Partial<ShareConfig>
) {
  return function WrappedPage(props: P) {
    const router = useRouter()
    const path = router.path
    const baseConfig = PAGE_SHARE_CONFIG[path] || DEFAULT_SHARE_CONFIG
    const merged = mergeConfig(baseConfig, overrides)

    useEffect(() => {
      // 注册分享回调
      Taro.useShareAppMessage?.(() => ({
        title: merged.title,
        path: merged.path || path,
        imageUrl: merged.imageUrl
      }))

      // 启用分享菜单
      Taro.showShareMenu?.({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }, [path, merged.title, merged.path, merged.imageUrl])

    return <Component {...props} />
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/utils/share.ts
git commit -m "feat(share): add share utils and ShareProvider HOC"
```

### Task 3.2: 创建 canvas.ts 工具

**Files:**
- Create: `src/shared/utils/canvas.ts`

- [ ] **Step 1: 写入 canvas.ts**

```typescript
import Taro from '@tarojs/taro'

export async function loadImage(url: string): Promise<string> {
  try {
    const res = await Taro.getImageInfo({ src: url })
    return res.path
  } catch (err) {
    console.error('Failed to load image:', url, err)
    throw err
  }
}

export function getCanvasContext(canvasId: string): Taro.CanvasContext {
  return Taro.createCanvasContext(canvasId)
}

export async function canvasToTempFile(canvasId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      canvasId,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err)
    })
  })
}

export async function saveToAlbum(tempPath: string): Promise<void> {
  // 检查授权
  const setting = await Taro.getSetting()
  if (!setting.authSetting['scope.writePhotosAlbum']) {
    await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
  }
  await Taro.saveImageToPhotosAlbum({ filePath: tempPath })
}

export async function generateWxacode(path: string): Promise<string> {
  // 实际应通过后端接口获取，这里仅作为占位
  return '/static/qrcode-placeholder.png'
}
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/utils/canvas.ts
git commit -m "feat(poster): add canvas utility functions"
```

### Task 3.3: 创建 ShareProvider 组件文件

**Files:**
- Create: `src/shared/components/share/ShareProvider/index.tsx`

- [ ] **Step 1: 写入 index.tsx (导出 share.ts 中的 ShareProvider)**

```typescript
export { ShareProvider } from '@/shared/utils/share'
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/components/share/ShareProvider/
git commit -m "feat(share): add ShareProvider component export"
```

### Task 3.4: 创建 ShareButton 组件

**Files:**
- Create: `src/shared/components/share/ShareButton/index.tsx`
- Create: `src/shared/components/share/ShareButton/index.scss`

- [ ] **Step 1: 写入 index.tsx**

```typescript
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface Props {
  title?: string
  path?: string
  imageUrl?: string
  onPosterClick?: () => void
  showPoster?: boolean
}

export function ShareButton({ 
  title = '分享', 
  path = '', 
  imageUrl, 
  onPosterClick, 
  showPoster = false 
}: Props) {
  const handleShare = () => {
    // 触发右上角分享菜单
    Taro.showShareMenu({ withShareTicket: true })
    // 微信小程序没有 API 直接调用分享，只能引导用户
    Taro.showToast({ title: '点击右上角分享', icon: 'none' })
  }

  return (
    <View className='share-button-group'>
      <View className='share-btn' onClick={handleShare}>
        <Text className='share-icon'>↗</Text>
        <Text className='share-text'>{title}</Text>
      </View>
      {showPoster && onPosterClick && (
        <View className='share-btn poster-btn' onClick={onPosterClick}>
          <Text className='share-icon'>🎨</Text>
          <Text className='share-text'>海报</Text>
        </View>
      )}
    </View>
  )
}

export default ShareButton
```

- [ ] **Step 2: 写入 index.scss**

```scss
.share-button-group {
  display: flex;
  gap: 24px;
  align-items: center;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  
  .share-icon {
    font-size: 32px;
  }
  .share-text {
    font-size: 26px;
    color: #333;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/share/ShareButton/
git commit -m "feat(share): add ShareButton component"
```

### Task 3.5: 创建 PosterGenerator 组件

**Files:**
- Create: `src/shared/components/share/PosterGenerator/index.tsx`
- Create: `src/shared/components/share/PosterGenerator/index.scss`

- [ ] **Step 1: 写入 index.tsx**

（完整代码，包含 canvasId、3 类模板、加载/就绪/错误三态、保存到相册、fallback）

```typescript
import Taro from '@tarojs/taro'
import { View, Text, Canvas, Button, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { http } from '@/shared/api/request'
import { 
  loadImage, 
  getCanvasContext, 
  canvasToTempFile, 
  saveToAlbum 
} from '@/shared/utils/canvas'
import './index.scss'

type PosterType = 'product' | 'post' | 'invite'

interface Props {
  type: PosterType
  visible: boolean
  data: any
  onClose: () => void
}

const CANVAS_WIDTH = 375
const CANVAS_HEIGHT = 600

export function PosterGenerator({ type, visible, data, onClose }: Props) {
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'ready' | 'error'>('idle')
  const [imagePath, setImagePath] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (visible && phase === 'idle') {
      drawPoster()
    }
  }, [visible])

  const drawPoster = async () => {
    setPhase('drawing')
    try {
      const ctx = getCanvasContext('posterCanvas')
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 白色背景
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (type === 'product') {
        await drawProduct(ctx, data)
      } else if (type === 'post') {
        await drawPost(ctx, data)
      } else if (type === 'invite') {
        await drawInvite(ctx, data)
      }

      ctx.draw()
      await new Promise(r => setTimeout(r, 500))
      const path = await canvasToTempFile('posterCanvas')
      setImagePath(path)
      setPhase('ready')
    } catch (err) {
      console.error('Canvas draw failed:', err)
      // Fallback to server
      await fallbackToServer()
    }
  }

  const drawProduct = async (ctx: any, product: any) => {
    // 主图
    if (product.coverImage) {
      const imgPath = await loadImage(product.coverImage)
      ctx.drawImage(imgPath, 20, 20, CANVAS_WIDTH - 40, 240)
    }
    // 标题
    ctx.setFontSize(20)
    ctx.setFillStyle('#333')
    ctx.fillText(product.title || '', 20, 290)
    // 价格
    ctx.setFontSize(28)
    ctx.setFillStyle('#ee0a24')
    ctx.fillText(`¥${product.price || 0}`, 20, 330)
    // 平台
    ctx.setFontSize(14)
    ctx.setFillStyle('#999')
    ctx.fillText('REMX 二手市场', 20, CANVAS_HEIGHT - 30)
  }

  const drawPost = async (ctx: any, post: any) => {
    // 作者
    ctx.setFontSize(18)
    ctx.setFillStyle('#333')
    ctx.fillText(post.authorName || '用户', 20, 40)
    // 内容
    ctx.setFontSize(16)
    ctx.setFillStyle('#666')
    const content = (post.content || '').slice(0, 80)
    ctx.fillText(content, 20, 80, CANVAS_WIDTH - 40)
    // 图片
    if (post.coverImage) {
      const imgPath = await loadImage(post.coverImage)
      ctx.drawImage(imgPath, 20, 140, CANVAS_WIDTH - 40, 200)
    }
  }

  const drawInvite = async (ctx: any, invite: any) => {
    // 背景
    ctx.setFillStyle('#1989fa')
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    // 标题
    ctx.setFontSize(32)
    ctx.setFillStyle('#fff')
    ctx.fillText('加入 REMX', 80, 200)
    ctx.setFontSize(20)
    ctx.fillText('邀请码: ' + (invite.code || ''), 80, 240)
  }

  const fallbackToServer = async () => {
    try {
      const res = await http.post<{ imageUrl: string }>('/api/poster/generate', { type, data })
      if (res.code === 0) {
        setImagePath(res.data.imageUrl)
        setPhase('ready')
        Taro.showToast({ title: '已使用服务端图片', icon: 'none' })
      } else {
        throw new Error('Server failed')
      }
    } catch (err) {
      setErrorMsg('海报生成失败')
      setPhase('error')
    }
  }

  const handleSave = async () => {
    if (!imagePath) return
    try {
      await saveToAlbum(imagePath)
      Taro.showToast({ title: '已保存到相册', icon: 'success' })
      onClose()
    } catch (err) {
      Taro.showToast({ title: '保存失败，请检查权限', icon: 'none' })
    }
  }

  if (!visible) return null

  return (
    <View className='poster-mask' onClick={onClose}>
      <View className='poster-content' onClick={(e) => e.stopPropagation()}>
        <View className='poster-header'>
          <Text className='poster-title'>分享海报</Text>
          <Text className='poster-close' onClick={onClose}>×</Text>
        </View>

        {phase === 'drawing' && (
          <View className='poster-loading'>
            <Text>生成中...</Text>
          </View>
        )}

        {phase === 'ready' && imagePath && (
          <View className='poster-preview'>
            <Image src={imagePath} className='poster-image' mode='widthFix' />
            <Button className='poster-save-btn' onClick={handleSave}>
              保存到相册
            </Button>
          </View>
        )}

        {phase === 'error' && (
          <View className='poster-error'>
            <Text>{errorMsg}</Text>
            <Button onClick={drawPoster}>重试</Button>
          </View>
        )}

        <Canvas 
          canvasId='posterCanvas' 
          className='poster-canvas'
          style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, position: 'absolute', left: '-9999px' }}
        />
      </View>
    </View>
  )
}

export default PosterGenerator
```

- [ ] **Step 2: 写入 index.scss**

```scss
.poster-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-content {
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  position: relative;
}

.poster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .poster-title {
    font-size: 32px;
    font-weight: 600;
  }
  .poster-close {
    font-size: 48px;
    color: #999;
    line-height: 1;
  }
}

.poster-loading, .poster-error {
  text-align: center;
  padding: 80px 0;
  font-size: 28px;
  color: #666;
}

.poster-preview {
  .poster-image {
    width: 100%;
    border-radius: 8px;
  }
  .poster-save-btn {
    margin-top: 24px;
    background: #1989fa;
    color: #fff;
    border-radius: 8px;
  }
}

.poster-canvas {
  visibility: hidden;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/share/PosterGenerator/
git commit -m "feat(poster): add PosterGenerator component with client canvas + server fallback"
```

### Task 3.6: 创建 poster preview 页面 (服务端 fallback)

**Files:**
- Create: `src/pages/poster/preview/index.tsx`
- Create: `src/pages/poster/preview/index.scss`
- Create: `src/pages/poster/preview/index.config.ts`

- [ ] **Step 1: 写入 index.config.ts**

```typescript
export default {
  navigationBarTitleText: '海报预览',
  enablePullDownRefresh: false
}
```

- [ ] **Step 2: 写入 index.tsx**

```typescript
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function PosterPreview() {
  const [imageUrl] = useState(Taro.getCurrentInstance().router?.params.imageUrl || '')

  const handleSave = () => {
    Taro.showToast({ title: '长按图片保存到相册', icon: 'none' })
  }

  return (
    <View className='poster-preview-page'>
      <View className='preview-tip'>
        <Text>长按图片保存到相册</Text>
      </View>
      <Image 
        src={imageUrl} 
        className='preview-image' 
        mode='widthFix'
        onLongPress={handleSave}
      />
    </View>
  )
}
```

- [ ] **Step 3: 写入 index.scss**

```scss
.poster-preview-page {
  min-height: 100vh;
  background: #000;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-tip {
  color: #fff;
  font-size: 26px;
  margin-bottom: 32px;
}

.preview-image {
  width: 100%;
  border-radius: 8px;
}
```

- [ ] **Step 4: 注册路由**

在 `src/app.config.ts` 的 `pages` 数组中添加：
```typescript
'pages/poster/preview/index',
```

- [ ] **Step 5: 提交**

```bash
git add src/pages/poster/preview/ src/app.config.ts
git commit -m "feat(poster): add poster preview page for server fallback"
```

### Task 3.7: 接入 6 个核心页面

**Files:**
- Modify: `src/pages/product/detail/index.tsx`
- Modify: `src/pages/community/post/index.tsx`
- Modify: `src/pages/invite/index/index.tsx`
- Modify: `src/pages/user/profile/index.tsx`
- Modify: `src/pages/checkin/index/index.tsx`
- Modify: `src/pages/points/index/index.tsx`

**统一模式** (以商品详情为例):
```typescript
// 顶部 import
import { ShareProvider } from '@/shared/utils/share'
import { ShareButton } from '@/shared/components/share/ShareButton'
import { PosterGenerator } from '@/shared/components/share/PosterGenerator'

// 页面内 state
const [posterVisible, setPosterVisible] = useState(false)

// 页面内 UI（添加到合适位置）
<ShareButton showPoster onPosterClick={() => setPosterVisible(true)} />

<PosterGenerator 
  type="product" 
  visible={posterVisible} 
  data={product} 
  onClose={() => setPosterVisible(false)} 
/>

// 底部 export
export default ShareProvider(ProductDetail, ({ product }) => ({
  title: product.title,
  path: `/pages/product/detail/index?id=${product.id}`,
  imageUrl: product.coverImage
}))
```

**注意**:
- 不同 type 的 ShareProvider overrides 注入不同运行时数据
- poster type 分别为 'product' / 'post' / 'invite'
- 邀请页没有商品/帖子数据，只传 code

- [ ] **Step 1: 商品详情接入 ShareProvider + PosterGenerator (type=product)**

修改 `src/pages/product/detail/index.tsx`，添加上述模式

- [ ] **Step 2: 帖子详情接入 (type=post)**

修改 `src/pages/community/post/index.tsx`

- [ ] **Step 3: 邀请页接入 (type=invite)**

修改 `src/pages/invite/index/index.tsx`

- [ ] **Step 4: 个人主页接入 (ShareProvider only, no poster)**

修改 `src/pages/user/profile/index.tsx`，只接 ShareProvider（不接 PosterGenerator）

- [ ] **Step 5: 签到页接入 (ShareProvider only)**

修改 `src/pages/checkin/index/index.tsx`

- [ ] **Step 6: 积分中心接入 (ShareProvider only)**

修改 `src/pages/points/index/index.tsx`

- [ ] **Step 7: 验证 6 个页面有 ShareProvider export**

```bash
grep -l "ShareProvider" src/pages/{product/detail,community/post,invite/index,user/profile,checkin/index,points/index}/index.tsx
# 期望：6 个文件全部命中
```

- [ ] **Step 8: 提交**

```bash
git add src/pages/{product/detail,community/post,invite/index,user/profile,checkin/index,points/index}/
git commit -m "feat(share): integrate ShareProvider in 6 core pages, poster in 3"
```

---

# Task 4: 统一 UI 组件

**Files:**
- Create: `src/shared/components/Skeleton/index.tsx` + `.scss`
- Create: `src/shared/components/RetryButton/index.tsx` + `.scss`
- Modify: 10 个列表页 (四态统一)
- Modify: `src/shared/components/Empty/index.tsx` (扩展支持 action)

### Task 4.1: 创建 Skeleton 组件

**Files:**
- Create: `src/shared/components/Skeleton/index.tsx`
- Create: `src/shared/components/Skeleton/index.scss`

- [ ] **Step 1: 写入 index.tsx**

```typescript
import { View } from '@tarojs/components'
import './index.scss'

interface Props {
  type?: 'card' | 'list' | 'detail'
  rows?: number
  avatar?: boolean
}

export function Skeleton({ type = 'list', rows = 5, avatar = false }: Props) {
  const rowHeights = type === 'detail' ? 32 : 24
  const rowGap = 16
  const baseHeight = type === 'card' ? 120 : type === 'detail' ? 200 : 88

  return (
    <View className={`skeleton skeleton-${type}`}>
      {avatar && <View className='skeleton-avatar' />}
      {Array.from({ length: rows }).map((_, i) => (
        <View 
          key={i} 
          className='skeleton-row' 
          style={{ 
            height: `${rowHeights}px`,
            width: i === rows - 1 ? '60%' : '100%',
            marginBottom: i < rows - 1 ? `${rowGap}px` : '0'
          }}
        />
      ))}
      <View className='skeleton-base' style={{ height: `${baseHeight}px` }} />
    </View>
  )
}

export default Skeleton
```

- [ ] **Step 2: 写入 index.scss**

```scss
.skeleton {
  padding: 24px 32px;
  background: #fff;
  
  &-card, &-list, &-detail {
    display: flex;
    flex-direction: column;
  }
  
  &-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f0f0f0;
    margin-bottom: 24px;
  }
  
  &-row {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: skeleton-loading 1.5s infinite;
  }
  
  &-base {
    background: #f5f5f5;
    border-radius: 8px;
    margin-top: 24px;
  }
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/Skeleton/
git commit -m "feat(ui): add Skeleton component"
```

### Task 4.2: 创建 RetryButton 组件

**Files:**
- Create: `src/shared/components/RetryButton/index.tsx`
- Create: `src/shared/components/RetryButton/index.scss`

- [ ] **Step 1: 写入 index.tsx**

```typescript
import { View, Text, Button } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import './index.scss'

interface Props {
  onRetry: () => void
  loading?: boolean
  text?: string
}

export function RetryButton({ onRetry, loading = false, text }: Props) {
  const { t } = useTranslation(['common'])
  return (
    <View className='retry-button-container'>
      <Text className='retry-icon'>⚠️</Text>
      <Text className='retry-message'>{text || t('common:error.network')}</Text>
      <Button 
        className='retry-action' 
        onClick={onRetry} 
        loading={loading}
        disabled={loading}
      >
        {t('common:action.retry')}
      </Button>
    </View>
  )
}

export default RetryButton
```

- [ ] **Step 2: 写入 index.scss**

```scss
.retry-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  
  .retry-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }
  .retry-message {
    font-size: 28px;
    color: #999;
    margin-bottom: 32px;
  }
  .retry-action {
    background: #1989fa;
    color: #fff;
    border-radius: 8px;
    padding: 16px 48px;
    font-size: 28px;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/RetryButton/
git commit -m "feat(ui): add RetryButton component"
```

### Task 4.3: 接入 10 个高频列表页四态统一

**Files:**
- Modify: 10 个列表页 .tsx

**统一模式** (替换现有 loading/empty/error 逻辑):
```typescript
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'

{loading ? <Skeleton type="list" rows={5} /> :
 error ? <RetryButton onRetry={refresh} /> :
 data.length === 0 ? <Empty text={t('common:empty.list')} /> :
 <List data={data} />}
```

**10 个列表页清单**:
1. `src/pages/community/feed/index.tsx`
2. `src/pages/community/post/index.tsx`
3. `src/pages/checkin/index/index.tsx`
4. `src/pages/points/index/index.tsx`
5. `src/pages/coupon/list/index.tsx`
6. `src/pages/notification/index/index.tsx`
7. `src/pages/order/list/index.tsx`
8. `src/pages/offer/list/index.tsx`
9. `src/pages/product/list/index.tsx` (or category/index)
10. `src/pages/product/search/index.tsx` (results 部分)

- [ ] **Step 1: 委派 subagent 一次性接入 10 个列表页**

Subagent prompt:
```
目标：把 10 个列表页改造成统一四态模式（Skeleton/RetryButton/Empty/Data）
参考模式：src/shared/components/{Skeleton,RetryButton,Empty}/
输入文件清单（10 个）：
[见上述清单]
统一模式代码：
```tsx
{loading ? <Skeleton type="list" rows={5} /> :
 error ? <RetryButton onRetry={refresh} /> :
 data.length === 0 ? <Empty text={t('common:empty.list')} /> :
 <List data={data} />}
```
约束：
- 不改业务逻辑
- 不改样式
- 找出现有 loading/error/empty 渲染逻辑，替换为上述模式
- 提交：1 个 commit "feat(ui): unify 4-state pattern in 10 list pages"
输出：
- 1 个 commit
- 1 个 summary 报告列出修改的 10 个文件
```

- [ ] **Step 2: 验证 10 个页面都有四态**

```bash
for f in community/feed community/post checkin/index points/index coupon/list notification/index order/list offer/list product/search; do
  grep -l "Skeleton\|RetryButton" src/pages/$f/index.tsx
done
# 期望：10 个文件全部命中
```

- [ ] **Step 3: 提交**

（由 subagent 自动提交）

---

# Task 5: 性能优化

**Files:**
- Modify: `src/app.config.ts` (subPackages 调整)
- Modify: 多个 .tsx 页面 (动态 import、lazy load)
- Modify: `config/index.ts` (optimizeMainPackage)

### Task 5.1: 测量当前主包体积

- [ ] **Step 1: 运行 taro analyze**

```bash
npx taro build --type weapp --analyze
```

- [ ] **Step 2: 记录主包大小**

记录到本地变量 `MAIN_BUNDLE_SIZE`，在 commit message 中记录。

### Task 5.2: 决策表 + 行动

根据测量结果：

| 主包 | 行动 |
|------|------|
| < 1MB | 仅生成报告，跳过此 Task |
| 1-2MB | 启用 `optimizeMainPackage`，按需 import 大依赖 |
| > 2MB | 分包重构：community/marketing/notification 移入子包 |

- [ ] **Step 1: 根据 `MAIN_BUNDLE_SIZE` 选择行动路径**

```bash
# 检查主包大小（从 build 报告）
# 如果 < 1MB，跳过 Task 5
# 如果 1-2MB，仅启用 optimizeMainPackage
# 如果 > 2MB，执行分包重构
```

### Task 5.3: 调整 subPackages 结构（仅 > 2MB 时）

**Files:**
- Modify: `src/app.config.ts`

- [ ] **Step 1: 把 community/marketing/notification 加入 subPackages**

```typescript
subPackages: [
  { root: 'pages/auth', pages: ['login/index', 'register/index'] },
  { root: 'pages/admin', pages: ['dashboard/index', 'user-mgmt/index'] },
  { root: 'pages/kyc', pages: ['phone/index', 'identity/index', 'liveness/index'] },
  // 新增：
  { root: 'pages/community', pages: ['feed/index', 'post/index', 'create/index', 'circle/detail/index'] },
  { root: 'pages/marketing', pages: ['checkin/index', 'points/index', 'points/shop', 'coupon/list'] },
  { root: 'pages/notification', pages: ['index/index'] }
]
```

- [ ] **Step 2: 提交**

```bash
git add src/app.config.ts
git commit -m "perf: move community/marketing/notification to subpackages"
```

### Task 5.4: 图片懒加载

**Files:**
- Modify: 所有列表卡片组件 (.tsx)

- [ ] **Step 1: 在 ProductCard, PostCard, NotificationItem, CouponCard 等的 Image 组件添加 `lazyLoad`**

```tsx
<Image src={url} lazyLoad mode='aspectFill' />
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/components/{product,community,notification,marketing}/
git commit -m "perf: enable lazyLoad on list card images"
```

### Task 5.5: 动态 import (低频页面)

**Files:**
- Modify: `src/app.config.ts` (admin/kyc/address 路由)

- [ ] **Step 1: 把 admin/kyc 路由从主包移到 subPackages（已有，无需改）**

- [ ] **Step 2: 提交**

（已在 Task 5.3 完成）

---

# Task 6: 最终验证

### Task 6.1: TypeScript 编译验证

- [ ] **Step 1: 运行 tsc**

```bash
npx tsc --noEmit
# 期望：Exit code 0
```

- [ ] **Step 2: 修复任何新增错误**

（如果有，跳过 pre-existing 错误）

### Task 6.2: ESLint 验证

- [ ] **Step 1: 运行 eslint**

```bash
npx eslint src/ --ext .ts,.tsx
# 期望：0 error
```

### Task 6.3: i18n 完整性

- [ ] **Step 1: grep 验证 0 硬编码**

```bash
grep -r --include="*.tsx" '[一-龥]\{4,\}' src/pages/ | grep -v "common:\|namespace:" | head -10
# 期望：无输出（无未翻译硬编码）
```

### Task 6.4: 关键功能 grep 验证

- [ ] **Step 1: ShareProvider 接入 6 个核心页面**

```bash
grep -l "ShareProvider" src/pages/{product/detail,community/post,invite/index,user/profile,checkin/index,points/index}/index.tsx
# 期望：6 个文件全部命中
```

- [ ] **Step 2: 四态模式接入 10 个列表页**

```bash
grep -l "Skeleton.*rows\|RetryButton.*onRetry" src/pages/{community/feed,community/post,checkin/index,points/index,coupon/list,notification/index,order/list,offer/list,product/search}/index.tsx
# 期望：10 个文件全部命中
```

### Task 6.5: 准备 release commit

- [ ] **Step 1: 最终提交**

```bash
git add -A
git commit -m "chore: phase3 ready for review" --allow-empty
```

---

# 总计工时

| Task | 估计工时 | Subagent |
|------|---------|----------|
| T1: i18n (1.1-1.7) | 1 天 | 1 |
| T1.8: 34 pages 接入 | 0.5 天 | 1 |
| T2: 搜索 | 1 天 | 1 |
| T3: 分享 + 海报 | 1.5 天 | 1 |
| T4: UI 统一 | 0.5 天 | 1 |
| T5: 性能 | 0.5 天 | 1 |
| T6: 验证 | 0.5 天 | - |
| **合计** | **5-6 天** | **5-6 subagents** |

---

# 风险与缓解

| 风险 | 缓解 |
|------|------|
| i18n 34 页面接入遗漏 | grep 验证 + 抽样 10 个 |
| Canvas 真机性能差 | 服务端 fallback（已实现） |
| 分享回调测试需真机 | 微信开发者工具 + 真机 |
| 主包超 2MB | 决策表 → 分包重构 |
| 海报图加载失败 | 默认占位图 + 重试 |

---

# 测试策略

- **单元测试** (vitest): 仅 `share.ts` 和 `canvas.ts` 工具函数
- **集成测试**: 5 核心流程在模拟器跑通
- **兼容性**: 微信 + 支付宝各 1 真机

---

# 退出条件

- [ ] tasks.md 全部勾选
- [ ] 5+ commits
- [ ] `tsc --noEmit` 0 错误（新增）
- [ ] `eslint src/` 0 error（新增）
- [ ] 6 个 ShareProvider 接入 + 10 个列表页四态 + 34 个页面 i18n
- [ ] 主包 < 2MB（如 > 2MB 已分包重构）
