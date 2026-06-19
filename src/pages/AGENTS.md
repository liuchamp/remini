# src/pages/AGENTS.md

## OVERVIEW

47 个注册页面（5 tabBar + 21 分包 42 页）+ 17 页面子组件，共 26 页面目录。每个页面独立目录。

## STRUCTURE

```
pages/
├── index/         # 首页（推荐商品流）
├── category/      # 分类浏览
├── publish/       # 发布商品
├── message/       # 消息中心
├── profile/       # 个人中心 + 列表/收藏/关注
├── auth/          # 登录/注册/安全验证
├── product/       # 商品详情/搜索/编辑
├── order/         # 订单列表/详情/创建/支付
├── offer/         # 出价列表/详情
├── address/       # 地址列表/编辑
├── logistics/     # 物流追踪
├── wallet/        # 钱包/提现/交易记录/绑卡
├── community/     # Feed/帖子/发帖/圈子/创作者
├── coupon/        # 优惠券列表
├── points/        # 积分/积分商城
├── checkin/       # 签到
├── referral/      # 邀请
├── kyc/           # 实名认证（手机/身份证/活体）
├── review/        # 评价管理
├── notification/  # 通知列表/详情/设置
├── seller/        # 卖家首页/出价管理/商品管理
├── admin/         # 管理后台（用户/评价/纠纷/提现/营销）
├── user/          # 用户资料/设置/设备
├── settings/      # 系统设置
├── chat/          # 会话列表
└── users/         # 他人主页（动态路由 $id）
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 新增页面 | `pages/{module}/{page}/index.tsx` | 同步更新 `app.config.ts` 路由表 |
| 修改 TabBar 页 | `pages/{index,category,publish,message,profile}/` | 5 个主包页面 |
| 修改分包页 | `pages/{module}/{page}/` | 需在 `app.config.ts` subPackages 注册 |
| 新增动态路由 | `pages/users/$id/index.tsx` | `$id` 为 Taro 动态参数语法 |

## CONVENTIONS

- **页面结构**：`index.tsx`（组件）+ `index.config.ts`（Taro 配置）+ `index.scss`（样式）
- **路由注册**：主包页在 `app.config.ts` pages 数组，分包页在 subPackages
- **预加载**：首页/分类→商品分包，消息→聊天分包，我的→订单+用户分包
- **页面配置**：`index.config.ts` 导出 `definePageConfig({ navigationBarTitleText: '...' })`

## ANTI-PATTERNS

- ❌ 禁止在页面中直接调用 `Taro.request()`，必须通过 domain api
- ❌ 禁止在页面中直接修改其他 domain 的 store
- ❌ 禁止在页面样式中使用内联样式替代 CSS Modules
- ❌ 禁止在 `pages/` 下放置复用组件（如 `pages/admin/components/TrendChart` 应移至 `shared/components/`）
- ⚠️ `src/pages/order/detail/index.tsx` 505 行，需拆分
