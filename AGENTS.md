# AGENTS.md

**Generated:** 2026-06-19
**Commit:** 4cc4df5
**Branch:** master

## RTK Token Optimization

所有通过 bash 工具执行的 CLI 命令必须使用 `rtk` 前缀，节省 60-90% token 消耗。

| 原始命令 | RTK 等效命令 |
|---------|-------------|
| `git status` / `git log` / `git diff` | `rtk git status` |
| `grep "pattern" src/` | `rtk grep "pattern" src/` |
| `ls src/` | `rtk ls src/` |
| `find "*.rs" .` | `rtk find "*.rs" .` |
| `tsc --noEmit` | `rtk tsc --noEmit` |
| `pnpm test` / `npm test` | `rtk pnpm test` |
| `cargo test` | `rtk cargo test` |
| `docker ps` | `rtk docker ps` |
| `eslint src/` | `rtk lint src/` |
| 大文件 `cat` -> `read_file` 工具（已原生优化，无需 rtk） |

### 强制规则

```
WRONG: bash: "git status"
RIGHT: bash: "rtk git status"
WRONG: bash: "grep 'export' src/"
RIGHT: bash: "rtk grep 'export' src/"
WRONG: bash: "tsc --noEmit"
RIGHT: bash: "rtk tsc --noEmit"
```

### 例外（不需要 rtk 前缀）

- `read_file` / `grep` / `glob` / `edit_file` / `write_file` 工具（已原生优化）
- git 提交操作
- `web_fetch` / `web_search`

---

## OVERVIEW

REMX -- Taro 4.2 + React 18 + TypeScript 跨端电商小程序，DDD 分层架构，14 领域模块，31 页面目录，10 平台（微信/支付宝/百度/头条/QQ/京东/H5/RN/鸿蒙元服务/鸿蒙混合）。共 841 文件，18.5k TS/JS 代码行。

## STRUCTURE

```
remini/
├── src/
│   ├── app.ts              # React 入口，ErrorBoundary + ShareConfigProvider
│   ├── app.config.ts       # 路由表：5 tabBar + 21 分包（47 页面）
│   ├── domains/            # 14 DDD 领域模块（auth, product, trade, ...）
│   ├── pages/              # 31 页面目录（126 TS/TSX 文件）
│   ├── shared/             # 共享层（components, hooks, utils, api, i18n, types）
│   ├── styles/             # 全局 SCSS（variables, mixins, reset, nutui-override）
│   ├── assets/             # 静态资源（tab 图标）
│   └── server/             # 服务端海报生成路由
├── config/                 # Taro 构建配置（dev.ts, prod.ts, index.ts）
├── ascf-project/           # 鸿蒙元服务项目模板（ArkTS + hvigor）
├── docs/                   # 架构文档、计划、评审
├── openspec/               # OpenSpec 变更管理
└── types/                  # 全局 TS 声明
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 新增页面 | `src/pages/{module}/{page}/index.tsx` | 需同步更新 `app.config.ts` 路由表 |
| 新增领域 | `src/domains/{module}/` | 遵循 api.ts + store.ts + types.ts 模式 |
| 修改全局样式 | `src/styles/variables.scss` | 8 类型设计令牌（color/spacing/font/radius/shadow/animation） |
| 修改 API 拦截器 | `src/shared/api/request.ts` | Token 注入/平台签名/Token 刷新/Risk 拦截器 |
| 修改 WebSocket | `src/shared/api/websocket.ts` | 自动重连/心跳/降级轮询/事件订阅 |
| 修改 i18n | `src/shared/i18n/resources/{zh-CN,en-US}/` | 8 命名空间（common, auth, product, ...） |
| 修改支付逻辑 | `src/domains/trade/payment/` | 策略模式：按平台隔离（weapp/alipay/h5） |
| 修改 TabBar | `src/app.config.ts` tabBar 部分 | 5 Tab：首页/分类/发布/消息/我的 |
| 修改认证逻辑 | `src/domains/auth/store.ts` | useAuthStore：isLoggedIn/user/token/checkAuth |
| 构建配置 | `config/index.ts` | Vite 编译器、双 designWidth 375/750 |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `App` | Function | `app.ts:17` | React root: ErrorBoundary + ShareConfigProvider, auth init on launch |
| `useAuthStore` | Store | `domains/auth/store.ts:29` | Auth state (user/token/isLoggedIn), zustand+persist |
| `tradeApi` | Module | `domains/trade/api.ts:21` | Order/offer/payment/review API, 10 methods |
| `communityApi` | Module | `domains/community/api.ts:6` | Feed/posts/comments/circles API, 14 methods |
| `adminApi` | Module | `domains/admin/api.ts:3` | Dashboard/users/disputes/withdrawals API |
| `marketingApi` | Module | `domains/marketing/api.ts:5` | Checkin/points/coupons/referral/commission API |
| `http` | Instance | `shared/api/request.ts` | Axios-based: token injection -> platform sign -> refresh -> error normalize |
| `wsManager` | Instance | `shared/api/websocket.ts` | WebSocket: auto-reconnect, heartbeat, polling fallback, event subscribe |
| `ShareConfigProvider` | Component | `shared/utils/share.tsx:56` | Context provider for share message config |

## CONVENTIONS

- **DDD 分层**：Pages -> Domains -> Shared -> Taro Framework，禁止反向依赖
- **领域模块独立**：每个 domain 自包含 api/store/types，不直接引用其他 domain 的 store
- **Shared 层无领域依赖**：`shared/` 不 import `domains/`（当前 10 处违规，见 ANTI-PATTERNS）
- **CSS Modules**：页面/组件样式使用 `[name]__[local]___[hash:base64:5]` 命名
- **SCSS 全局注入**：`@use "src/styles" as *;` 自动注入 variables/mixins
- **Zustand 状态管理**：每个 domain store 使用 `create()` 创建，导出 `use*Store` hook
- **Conventional Commits**：`feat/fix/chore/docs` 前缀 + scope（如 `feat(components): add Empty`）
- **TypeScript Strict**：`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`
- **Design tokens**：8 类型 (color/status/spacing/font/radius/shadow/animation) in `variables.scss`
- **API 基础**：所有 domain api.ts 基于 `shared/api/request.ts` 的 `http` 实例
- **Babel + Vite**：`@babel/preset-env` + `@tarojs/vite-runner: 4.2.0`

## ANTI-PATTERNS (THIS PROJECT)

- ❌ **禁止** domain 之间直接 import store
- ❌ **禁止** shared 层引用 domains（当前 10 处违规：OfferPanel, NotificationItem, PostCard, useAuth 等）
- ❌ **禁止** 在页面中直接调用 `Taro.request()`，必须通过 domain api -> shared HttpClient
- ❌ **禁止** 使用 `any` 类型（当前 15 处 `as any` + 3 处 `any` 类型注解）
- ❌ **禁止** 忽略 `noUnusedLocals` / `noUnusedParameters`（tsconfig 已启用）
- ❌ **禁止** `console.log` 遗留生产代码（当前 39 处分布在 24 文件）
- ❌ **禁止** 内联样式替代 CSS Modules
- ⚠️ **注意** `src/pages/order/detail/index.tsx` 505 行，需拆分
- ⚠️ **注意** 无测试基础设施（0 测试文件、0 测试依赖）
- ⚠️ **注意** 无 CI/CD pipeline（无 .github/workflows）
- ⚠️ **注意** `package.json` name="myApp" vs `project.config.json` projectname="remx-marketplace"
- ⚠️ **注意** `src/server/` 混合客户端代码在 `src/` 内

## UNIQUE STYLES

- **支付策略模式**：`trade/payment/` 按平台隔离支付实现，运行时自动选择
- **预加载规则**：首页/分类--商品分包，消息--聊天分包，我的--订单+用户分包
- **NutUI 组件库**：使用 `@nutui/nutui-react-taro` beta 版，designWidth 375（与其他页面 750 不同）
- **华为 ASCF**：`ascf-project/` 嵌入完整鸿蒙项目模板，构建输出到 `ascf-project/ascf/ascf_src`
- **双 DesignWidth**：动态 375（NutUI）/ 750（其他），sass-embedded 编译
- **Mock 优先**：`shared/api/mock-interceptor.ts` + 8 mock 文件，开发环境 MOCK_ENABLED

## COMMANDS

```bash
# 开发
pnpm dev:weapp          # 微信小程序开发模式
pnpm dev:ascf           # 鸿蒙元服务开发模式
pnpm dev:h5             # H5 开发模式

# 构建
pnpm build:weapp        # 微信小程序生产构建
pnpm build:ascf         # 鸿蒙元服务构建
pnpm build:h5           # H5 构建
pnpm build:rn           # React Native 构建
pnpm build:harmony-hybrid # HarmonyOS 混合构建

# ASCF 专用
pnpm watch:ascf         # 监听编译
pnpm run:ascf           # 编译并安装 HAP
pnpm debug:ascf         # 调试模式编译
pnpm release:ascf       # 发布编译

# 代码检查
pnpm lint               # ESLint 检查
pnpm stylelint          # Stylelint 检查

# Git Hooks
commit-msg              # commitlint --config-conventional
pre-commit              # husky dispatch（无 lint-staged）
```

## NOTES

- **无测试基础设施**：无 Jest/Vitest，无 `__tests__/` 目录，无测试脚本
- **无 CI/CD**：无 .github/workflows，手动部署
- **`shared/constants/` 缺失**：`docs/architecture.md` 提及但目录不存在
- **包名不一致**：`package.json` name="myApp" vs `project.config.json` projectname="remx-marketplace"
- **多 AI 配置目录**：`.agent/`, `.agents/`, `.opencode/`, `.omo/`, `.superpowers/` 共存
- **server 代码在 src/ 内**：`src/server/routes/poster/` 混合了客户端代码
- **All 14 domains**: auth, user, product, trade, address, shipping, wallet, chat, community, notification, marketing, kyc, seller, admin
- **Navigation**: 53 `Taro.navigateTo`, 5 `Taro.reLaunch`, 3 `Taro.redirectTo`, 2 `Taro.switchTab`
- **Anti-pattern cleanup priority**: `as any` > `console.log` > shared-domain violations > large file splitting