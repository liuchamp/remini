# REMX 项目概述

> Taro 4.2 + React 18 + TypeScript 跨端电商小程序

## 项目信息

| 属性 | 值 |
|------|-----|
| 项目名 | myApp (inisvp) |
| 框架 | Taro 4.2.0 |
| UI 框架 | React 18 |
| 语言 | TypeScript 5.4 |
| 包管理器 | pnpm |
| 脚手架 | Taro CLI 4.2.0 |

## 技术栈

### 核心依赖

| 类别 | 技术 | 版本 |
|------|------|------|
| UI 组件 | NutUI React Taro | 3.1.0-beta.1 |
| 图标 | @nutui/icons-react-taro | 3.0.2 |
| 状态管理 | Zustand | 5.x |
| HTTP 请求 | Axios + 自封装 HttpClient | ^1.17.0 |
| 国际化 | i18next + react-i18next | ^26.x / ^17.x |
| CSS 变量主题 | CSS Variables + Sass | — |
| 日期处理 | dayjs | ^1.11.21 |
| 实时通信 | WebSocket (自封装 Manager) | - |

### 开发工具

| 类别 | 工具 |
|------|------|
| 构建 | Vite 4.x + SWC |
| 代码检查 | ESLint 8.x (taro 规则) |
| 样式检查 | Stylelint 16.x |
| 格式化 | EditorConfig |
| 提交规范 | Commitlint (conventional) + Husky v9 + lint-staged |
| CSS 预处理器 | Sass / sass-embedded |

## 支持平台

| 平台 | 构建命令 |
|------|----------|
| 微信小程序 | `pnpm build:weapp` |
| 支付宝小程序 | `pnpm build:alipay` |
| 百度小程序 | `pnpm build:swan` |
| 头条小程序 | `pnpm build:tt` |
| H5 | `pnpm build:h5` |
| React Native | `pnpm build:rn` |
| QQ 小程序 | `pnpm build:qq` |
| 京东小程序 | `pnpm build:jd` |
| 鸿蒙元服务 (ASCf) | `pnpm build:ascf` |
| 鸿蒙混合模式 | `pnpm build:harmony-hybrid` |

## 功能模块

| 模块 | 页面数 | 说明 |
|------|--------|------|
| 🏠 首页 | 1 | 推荐商品流 |
| 📂 分类 | 1 | 商品分类浏览 |
| 📦 商品 | 3 | 详情/搜索/编辑 |
| 🛒 订单 | 4 | 列表/详情/创建/支付 |
| 💰 出价/议价 | 2 | 出价列表/详情 |
| 📍 地址 | 2 | 地址列表/编辑 |
| 🚚 物流 | 1 | 物流追踪 |
| 💳 钱包 | 2 | 钱包首页/提现 |
| 💬 聊天 | 2 | 会话列表/聊天详情 |
| 👥 社区 | 3 | Feed/帖子详情/发帖 |
| 🏪 卖家中心 | 3 | 卖家首页/出价管理/商品管理 |
| 👑 管理后台 | 5 | 管理首页/用户管理/评价管理/纠纷/营销审核 |
| 🔐 认证 | 3 | 登录/注册/安全验证 |
| 🎯 营销 | 5 | 签到/积分/优惠券/积分商城/邀请 |
| 👤 用户 | 7+ | 个人中心/收藏/关注/列表/编辑/设置/他人主页 |
| 🔔 通知 | 1 | 通知中心 |
| ⭐ 评价 | 1 | 评价管理 |
| ⚙️ 设置 | 1 | 系统设置 |

**总计：50 个页面**（路由注册），分布在主包（8 页）和 21 个分包（42 页）中。

## 项目规模

```
src/
├── domains/     → 14 个领域模块
│   ├── address/ admin/ auth/ chat/ community/
│   ├── kyc/ marketing/ notification/ product/
│   ├── seller/ shipping/ trade/ user/ wallet/
├── pages/       → 50+ 页面实现
├── shared/      → 公共组件/工具/API/i18n/类型
├── styles/      → 全局样式（variables, mixins, reset, nutui-override）
├── assets/      → 静态资源（tab 图标）
└── app.config   → 页面路由配置
```
