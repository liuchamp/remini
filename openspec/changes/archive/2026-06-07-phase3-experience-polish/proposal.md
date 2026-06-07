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
