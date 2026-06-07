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
T3 (分享) ─┘                    │
                                ▼
                              T5 (性能)
                                │
                                ▼
                              T6 (验证)
```

## 总工时预估

- T1: 1-1.5 天（34 个页面批量接入）
- T2: 1 天
- T3: 1-1.5 天
- T4: 0.5-1 天
- T5: 0.5-1 天
- T6: 0.5 天
- **合计 4.5-6 天**
