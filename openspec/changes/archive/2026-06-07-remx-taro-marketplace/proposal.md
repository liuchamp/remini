## Why

将 REMX C2C 二手交易平台从 React Router 7 + SSR 的全栈 Web 应用改造为基于 Taro 4 的跨平台 Mini App（支持微信小程序、支付宝小程序、H5），解决移动端用户体验问题，利用小程序生态获取更多流量和交易转化。当前 Web 应用在移动端存在加载慢、无 Native 能力、分享链路长、用户留存低等痛点。

## What Changes

- **新建** Taro 4 + React 18 + TypeScript 前端项目，复用现有后端 API
- **替换** Web 路由系统为 Taro 路由，引入小程序原生导航能力
- **替换** Web 登录/支付为小程序原生 API（`wx.login` / `wx.requestPayment` / 支付宝对应 API）
- **替换** WebSocket + SSE 实时通信为小程序 WebSocket（含降级轮询）
- **替换** HTML File Upload 为 `chooseMedia` 原生媒体选择
- **替换** LocalStorage 为 Taro Storage API
- **新增** 小程序原生分享、订阅消息、地理位置等 Native 能力
- **新增** 分包加载策略，确保主包 < 2MB
- **替换** Tailwind CSS 为 Sass + NutUI 组件库
- **替换** React Context/Reducer 为 Zustand 全局状态管理
- **保留** 后端 API 不变，仅适配请求签名和平台标识

## Capabilities

### New Capabilities
- `user-auth`: 微信/支付宝一键登录、手机号登录、Token 管理、多平台适配
- `product-browse`: 商品列表、瀑布流、搜索、筛选、排序、附近商品
- `product-publish`: 商品发布、图片上传、定价模式（一口价/可议价）
- `trade-order`: 订单创建、支付、退款、收货、评价全流程
- `offer-negotiation`: 出价、还价、接受/拒绝/撤回
- `shipping-logistics`: 物流追踪、地址管理、运费计算
- `escrow-wallet`: 托管余额、提现、交易明细、银行卡绑定
- `community-feed`: 社区帖子流、发帖、评论、点赞、圈子
- `instant-messaging`: 实时聊天、WebSocket 管理、商品卡片分享
- `notification-center`: 系统通知、交易通知、营销通知
- `kyc-verification`: 手机验证、身份证 OCR、活体检测
- `marketing-tools`: 签到、积分、优惠券、邀请裂变
- `user-profile`: 个人中心、编辑资料、我的发布/收藏/关注
- `seller-dashboard`: 卖家出价管理、商品管理、数据统计
- `admin-panel`: 运营管理后台（分包加载）
- `i18n-multi-lang`: 中英文国际化切换

### Modified Capabilities
- （无现有 spec，项目为全新的 Taro 端）

## Impact

- **前端**: 新建完整 Taro 项目，不修改现有 Web 代码
- **后端 API**: 无需修改，仅需增加 `X-Client-Type: miniapp` 请求头适配
- **认证**: 新增微信/支付宝 code2session 接口适配
- **支付**: 新增小程序支付统一下单接口适配
- **存储**: 图片上传路径兼容小程序临时文件
- **部署**: 发布到微信/支付宝小程序平台 + H5 静态部署
- **监控**: 新增小程序端性能监控和错误追踪
