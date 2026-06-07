# Comet Design Handoff

- Change: phase3-experience-polish
- Phase: design
- Mode: compact
- Context hash: d3fa33c0b191d2afbf9000ce800844bc8e5c198050a7a1a731a8193681d94afd

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/phase3-experience-polish/proposal.md

- Source: openspec/changes/phase3-experience-polish/proposal.md
- Lines: 1-33
- SHA256: b6b8f4bbcb5dd652d28bb7541f9979fe7695343c1505909a2d632c8c205cf7f9

```md
## Why

Phase 1+2 已完成核心交易链路、社区营销闭环的实现，但仍有 5 项体验级短板阻碍上线：i18n 仅 24/58 页面接入、搜索页缺少建议/热门/筛选、零分享实现、UI 反馈组件不齐（无 Skeleton/RetryButton）、主包/分包性能未验证。本 change 一次性补齐这 5 项，达到可提审的体验基线。

## What Changes

- **新增** `share-poster` capability：所有页面 `onShareAppMessage` + 关键页面 `onShareTimeline`；商品/帖子/邀请三类 Canvas 海报
- **新增** `ui-feedback` capability：`Skeleton` 骨架屏 + `RetryButton` 错误重试按钮；统一列表页加载/空态/错误三态
- **扩展** `i18n-multi-lang` spec：补齐 `community` / `notification` 两个 namespace 资源；剩余 34 个未接入 `useTranslation` 的页面补齐
- **扩展** `product-browse` spec：搜索建议（防抖 300ms）+ 热门词 + 历史持久化（已有）+ 筛选面板（价格/分类/成色/距离/仅议价）+ 多维排序
- **新增** 性能优化 pass：主包 <2MB 验证、分包按需加载、CDN 外置大资源、图片懒加载
- **新增** `Settings/About/Privacy/ClearCache` 设置页补全（i18n 切换持久化前置）
- **新增** `LanguageSwitcher` 组件，挂载到 `user/settings` 与首次启动引导

## Capabilities

### New Capabilities
- `share-poster`: 微信分享/朋友圈分享 + 商品/帖子/邀请海报生成
- `ui-feedback`: 列表页统一 Skeleton/Empty/Error/Retry 反馈模式

### Modified Capabilities
- `i18n-multi-lang`: 补齐 2 个 namespace（community, notification），完成剩余 34 个页面的 useTranslation 接入，语言切换持久化
- `product-browse`: 搜索页增强——建议/热门/筛选面板/多维排序
- `user-profile`: 设置页补全——关于/隐私/语言切换/清理缓存/退出登录

## Impact

- **新增/修改文件**：~40-50 个（5 个新组件、5+ 页面改造、2 个 namespace json、多个页面 i18n 接入）
- **i18n json 资源**：新增 `community.json` / `notification.json` 2 个 namespace × 2 语言
- **依赖**：无新增（Canvas 使用 Taro.createCanvasContext）
- **性能**：主包需重新测量；分包结构 `app.config.ts` 可能微调
- **回归风险**：i18n 替换硬编码字符串需逐页验证；分享/海报涉及平台 API 需真机测试
- **不修改**：后端 API（共享 Web 端）；核心交易链路（Phase 1）已稳定不动
```

## openspec/changes/phase3-experience-polish/design.md

- Source: openspec/changes/phase3-experience-polish/design.md
- Lines: 1-214
- SHA256: c5a5ea4fe28cd1c8a5b089f61f8ac75d5dc2b10127cc01dcc935460bd9b328ef

[TRUNCATED]

```md
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
```

Full source: openspec/changes/phase3-experience-polish/design.md

## openspec/changes/phase3-experience-polish/tasks.md

- Source: openspec/changes/phase3-experience-polish/tasks.md
- Lines: 1-97
- SHA256: 9bca16165d0f206c93874b8016f4f742fd3ce90806245c9c9bf48a22e49c94a2

[TRUNCATED]

```md
# Phase 3: Experience Polish — Tasks

> 5 大模块拆分为 5 个主任务 + 验证任务；T1-T3 可并行，T4 依赖 T1/T2，T5 依赖 T1-T4

## 1. i18n 全量接入（T1）

- [ ] 1.1 创建 `community.json` namespace（zh-CN + en-US），覆盖 community/feed/post/create/circle 等 11 个页面文案
- [ ] 1.2 创建 `notification.json` namespace（zh-CN + en-US），覆盖 notification 页面
- [ ] 1.3 创建 `LanguageSwitcher` 组件 (`src/shared/components/i18n/LanguageSwitcher/`)
- [ ] 1.4 创建 `src/pages/user/settings/index.tsx` 设置页（关于/隐私/语言/缓存/退出）
- [ ] 1.5 接入 useTranslation：剩余 ~34 个页面（按 domain 批量：product × 8, trade × 6, kyc × 4, wallet × 4, message × 3, offer × 3, my × 4, admin × 2）
- [ ] 1.6 验证：构建时 i18next-scanner 扫描；开发模式缺失 key 控制台告警
- [ ] 1.7 验证：语言切换 → 刷新页面 → 持久化生效
- [ ] 1.8 提交：1 个 commit "feat(i18n): phase3 full i18n integration with community+notification namespaces"

## 2. 搜索页完善（T2）

- [ ] 2.1 扩展 `domains/product/api.ts`：新增 `searchSuggest(keyword)` + `getHotSearches()` 方法
- [ ] 2.2 创建 `src/shared/components/product/FilterPanel/index.tsx` 筛选面板（分类/价格区间/成色/仅议价/排序）
- [ ] 2.3 创建 `src/shared/components/product/HotSearches/index.tsx` 热门搜索 chips
- [ ] 2.4 重写 `src/pages/product/search/index.tsx`：
  - 顶部热门词横向 chips
  - 输入时 300ms 防抖触发 searchSuggest
  - 搜索建议下拉浮层
  - 搜索结果下方筛选按钮
  - 筛选结果更新 query
  - 多维排序 tab（综合/价格升降/最新/距离）
- [ ] 2.5 验证：搜索 → 建议 → 点击 → 详情全链路
- [ ] 2.6 提交：1 个 commit "feat(search): suggestions + hot searches + filter panel + sort"

## 3. 分享与海报（T3）

- [ ] 3.1 创建 `src/shared/utils/share.ts`：`configurePageShare(config)` + `onShareAppMessage/onShareTimeline` 默认实现
- [ ] 3.2 创建 `src/shared/utils/canvas.ts`：图片加载 + 绘制 + toTempFilePath 工具函数
- [ ] 3.3 创建 `src/shared/components/share/ShareButton/index.tsx` 分享按钮
- [ ] 3.4 创建 `src/shared/components/share/PosterGenerator/index.tsx` 海报生成弹窗（商品/帖子/邀请三类模板）
- [ ] 3.5 接入 6 个核心页面：
  - `pages/product/detail/index.tsx` 商品海报
  - `pages/community/post/index.tsx` 帖子海报
  - `pages/invite/index.tsx` 邀请海报
  - `pages/user/profile/index.tsx` 个人主页分享
  - `pages/checkin/index/index.tsx` 签到分享
  - `pages/points/index/index.tsx` 积分中心分享
- [ ] 3.6 所有页面增加 `onShareAppMessage` 默认（title=页面名, path=当前 URL）
- [ ] 3.7 验证：微信开发者工具分享回调正常；海报图片保存到相册
- [ ] 3.8 提交：1 个 commit "feat(share): page share + canvas poster generator"

## 4. 统一 UI 组件（T4 — 依赖 T1+T2）

- [ ] 4.1 创建 `src/shared/components/Skeleton/index.tsx` + `.scss` 骨架屏组件（rows + type: card/list/detail）
- [ ] 4.2 创建 `src/shared/components/RetryButton/index.tsx` + `.scss` 错误重试按钮
- [ ] 4.3 接入至少 10 个高频列表页统一四态：Feed / Post / Checkin / Points / Coupon / Notification / Order / Offer / ProductList / Search
- [ ] 4.4 统一空态文案（i18n `common.empty.*`）
- [ ] 4.5 验证：所有列表页 loading/error/empty/data 四态切换正确
- [ ] 4.6 提交：1 个 commit "feat(ui): unified skeleton + retry + 4-state list pattern"

## 5. 性能优化（T5 — 依赖 T1-T4）

- [ ] 5.1 运行 `taro build --type weapp --analyze`，测量主包体积
- [ ] 5.2 主包 > 2MB 时：tree-shaking 调整、移除未使用依赖、CDN 外置大字体/图标
- [ ] 5.3 分包结构微调：把 community/marketing/notification 移入子包
- [ ] 5.4 图片懒加载：列表长图用 `Image lazyLoad` + IntersectionObserver
- [ ] 5.5 动态 import：低频页面（admin/kyc/address）用 import() 懒加载
- [ ] 5.6 验证：再次测量主包 < 2MB
- [ ] 5.7 提交：1 个 commit "perf: main bundle <2MB + subpackage + lazy image"

## 6. 最终验证（T6 — 全任务后）

- [ ] 6.1 运行 `tsc --noEmit`，零错误
- [ ] 6.2 运行 `eslint src/`，零 error
- [ ] 6.3 微信开发者工具真机预览：5 个核心流程跑通（搜索/分享/语言切换/列表/海报）
- [ ] 6.4 性能：首次加载 < 3s，长列表滚动 60fps
- [ ] 6.5 i18n 完整性：所有页面 0 个硬编码中文（grep 验证）
- [ ] 6.6 提交：1 个 commit "chore: phase3 ready for review"

## 任务依赖图

```
T1 (i18n) ─┐
T2 (搜索) ─┼──→ T4 (UI 统一) ──┐
```

Full source: openspec/changes/phase3-experience-polish/tasks.md

## openspec/changes/phase3-experience-polish/specs/i18n-multi-lang/spec.md

- Source: openspec/changes/phase3-experience-polish/specs/i18n-multi-lang/spec.md
- Lines: 1-44
- SHA256: 2f66f71b99e3e6661e863e0fc21fdd0fc48a91e8ca3396e8f73fb36dcb9c7d45

```md
## ADDED Requirements

### community namespace

新增 i18n 资源 namespace `community`，覆盖社区/营销域页面文案

#### Scenario: 社区 Feed 页面渲染
WHEN Feed 页面调用 `useTranslation(['community', 'common'])`
THEN i18n 加载 `zh-CN/community.json` + `en-US/community.json`
AND 中文/英文均提供完整 key 覆盖（tab 标题、空态、按钮、错误提示）
AND 缺失 key 时回退到 `zh-CN` 翻译
AND 开发模式控制台输出 `i18next::translator: missingKey` 警告

### notification namespace

新增 i18n 资源 namespace `notification`，覆盖通知中心页面文案

#### Scenario: 通知中心 Tab 切换
WHEN 用户点击"交易通知" Tab
THEN 显示 i18n key `notification.tab.transaction` 对应文案
AND 列表项"已读/未读"状态文案走 `notification.status.*`
AND "标记全部已读"按钮走 `notification.action.markAllRead`
AND 空态文案走 `notification.empty.*`

## MODIFIED Requirements

### 语言切换持久化

#### Scenario: 用户在设置页切换语言为 English
WHEN 用户在设置页选择 English
THEN 系统调用 `i18n.changeLanguage('en-US')`
AND 所有 UI 文本立即切换为英文
AND 语言偏好写入 `Taro.setStorageSync('@remx/locale', 'en-US')`
WHEN 用户杀掉小程序后重新打开
THEN 启动时读取 `@remx/locale` 优先于系统语言
AND 直接应用保存的 'en-US'，不再走系统语言检测

### 全量 useTranslation 接入

#### Scenario: 改造硬编码字符串
WHEN 任意 .tsx 页面存在 4+ 连续中文字符串硬编码
THEN 重构为 `useTranslation()` hook + t('key') 调用
AND 公共文案走 `common` namespace，页面专属文案走对应 namespace
AND 提交前 grep 验证 `pages/**/*.tsx` 中无剩余硬编码中文段落
```

## openspec/changes/phase3-experience-polish/specs/product-browse/spec.md

- Source: openspec/changes/phase3-experience-polish/specs/product-browse/spec.md
- Lines: 1-38
- SHA256: 94f5de4db96b7f63d824654da6c0459ea442464d291feac8ac3702f0b69457e2

```md
## MODIFIED Requirements

### 搜索建议

#### Scenario: 用户在搜索框输入关键词
WHEN 用户在搜索输入框中输入任意字符
THEN 系统以 300ms 防抖调用 `productApi.searchSuggest(keyword)`
AND 返回 5-10 条前缀匹配的关键词建议
AND 建议以浮层形式显示在输入框下方
WHEN 用户点击某条建议
THEN 自动填充到输入框并触发搜索

### 热门搜索

#### Scenario: 用户进入搜索页
WHEN 搜索页 onLoad
THEN 异步请求 `productApi.getHotSearches()`
AND 返回 Top 10 热门关键词
AND 在搜索框下方以横向 chips 展示
AND 同一会话 5 分钟内不重复请求（前端缓存）

### 搜索筛选

#### Scenario: 用户点击搜索结果上方的"筛选"按钮
WHEN 用户点击筛选按钮
THEN 底部弹出 `FilterPanel` 组件
AND 筛选维度：分类（树形选择）/ 价格区间（双滑块）/ 成色（全新/9成新/8成新等）/ 仅议价（开关）/ 排序（综合/价格升/价格降/最新/距离）
WHEN 用户确认筛选
THEN 关闭弹窗，更新 query 并重新请求搜索
AND 已选筛选条件以 chip 形式显示在结果上方，可单独移除

### 多维排序

#### Scenario: 用户切换排序方式为"价格升序"
WHEN 用户在排序 Tab 选择"价格 ↑"
THEN 重新请求 `productApi.search({ sort: 'price_asc' })`
AND 当前排序 Tab 高亮
AND 列表更新并保持滚动位置
```

## openspec/changes/phase3-experience-polish/specs/share-poster/spec.md

- Source: openspec/changes/phase3-experience-polish/specs/share-poster/spec.md
- Lines: 1-41
- SHA256: ea3ef03b3db4312b5c0c1dd70e4a5064bfcf6b4618504bd0712e8617d9a543b7

```md
## ADDED Requirements

### 页面分享配置

所有页面需支持微信小程序原生分享到朋友/朋友圈

#### Scenario: 用户点击右上角"..."选择"分享给朋友"
WHEN 用户在任意页面点击右上角菜单选择"分享给朋友"
THEN 系统调用 `onShareAppMessage` 回调
AND 返回 `{ title, path, imageUrl }` 三元组
AND title 默认使用当前页面 H1 文案
AND path 默认使用当前页面 URL（含 query 参数）
AND imageUrl 缺省时使用平台默认缩略图

#### Scenario: 用户点击右上角"..."选择"分享到朋友圈"
WHEN 用户在任意页面点击右上角菜单选择"分享到朋友圈"
THEN 系统调用 `onShareTimeline` 回调
AND 返回 `{ title, query }` 二元组
AND query 需包含 `from=share_timeline` 标识
AND 进入页面时若 query 包含该标识，记录一次分享回流

### 海报生成

关键页面（商品/帖子/邀请）支持一键生成 Canvas 海报并保存到相册

#### Scenario: 用户在商品详情页点击"生成分享海报"
WHEN 用户点击商品详情页的"分享海报"按钮
THEN 系统弹出 `PosterGenerator` 弹窗
AND 弹窗内异步绘制：商品主图 + 标题 + 价格 + 二维码 + 平台 Logo
AND 绘制完成后显示"保存到相册"按钮
WHEN 用户点击"保存到相册"
THEN 调用 `Taro.saveImageToPhotosAlbum` 保存图片
AND 成功后提示"已保存到相册"
AND 失败时根据 `authSetting['scope.writePhotosAlbum']` 引导用户授权

#### Scenario: Canvas 绘制失败降级
WHEN `Taro.canvasToTempFilePath` 抛出异常
THEN 系统捕获异常
AND 提示"海报生成失败，正在尝试服务端方案"
AND 调用后端 `/api/poster/generate` 接口获取预渲染图片 URL
AND 跳转图片预览页让用户长按保存
```

## openspec/changes/phase3-experience-polish/specs/ui-feedback/spec.md

- Source: openspec/changes/phase3-experience-polish/specs/ui-feedback/spec.md
- Lines: 1-39
- SHA256: a845f821ac2666acb212674f7d9e9f6db2850762ab67990ad850eadb69fa277d

```md
## ADDED Requirements

### 骨架屏

列表页加载时显示骨架占位，避免布局抖动

#### Scenario: Feed 页面初次加载
WHEN 用户进入 Feed 页面
AND 数据未返回（loading=true）
THEN 页面渲染 `Skeleton type="list"` 组件
AND 骨架占位数量 = 5 行
AND 高度与真实列表项高度一致
WHEN 数据返回成功后
THEN 骨架屏消失，显示真实列表（无闪烁）

### 错误重试

列表页请求失败时显示重试入口

#### Scenario: 网络错误导致列表加载失败
WHEN Feed 页面初次请求数据
AND 网络中断或 5xx 错误
THEN 页面渲染 `RetryButton` 组件
AND 按钮文案："加载失败，点击重试"（i18n key: `common.retry`）
WHEN 用户点击重试按钮
THEN 重新调用 `loadNotifications` / `getFeed` 等方法
AND 按钮显示 loading 状态防重复点击
AND 成功后恢复列表展示

### 统一空态

无数据时显示空态提示，支持可选 CTA

#### Scenario: 用户搜索一个无结果关键词
WHEN 用户搜索"abcdef123456"
AND 后端返回空结果
THEN 页面渲染 `Empty` 组件
AND 默认文案："暂无相关商品"（i18n key: `common.empty.search`）
AND 不显示 action 按钮（无意义操作）
```

## openspec/changes/phase3-experience-polish/specs/user-profile/spec.md

- Source: openspec/changes/phase3-experience-polish/specs/user-profile/spec.md
- Lines: 1-21
- SHA256: 0c632729f91e6437241daf07c0e9dedc68687d49ae1da1d8c77d81a4d6072b19

```md
## MODIFIED Requirements

### 设置页

#### Scenario: 用户进入"我的"→"设置"
WHEN 用户从个人中心进入设置页
THEN 设置页显示以下区块（按顺序）：
- 账号：头像/昵称/手机号（脱敏）
- 关于：当前版本号 v1.0.0 + 检查更新按钮
- 隐私：隐私政策链接 / 用户协议链接
- 语言：嵌入 LanguageSwitcher
- 缓存：当前缓存大小（如 12.3 MB）+ 一键清理按钮
- 退出登录：底部独立按钮

#### Scenario: 用户点击"清理缓存"
WHEN 用户点击"清理缓存"按钮
THEN 二次确认弹窗："确定清理 12.3MB 缓存？"
WHEN 用户确认
THEN 调用 `Taro.clearStorageSync()`（保留 token 与 locale）
AND 刷新显示为 0 MB
AND 提示"清理成功"
```

