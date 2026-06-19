# src/shared/AGENTS.md

## OVERVIEW

共享层：22 组件、12 hooks、12 utils、API 客户端、i18n、类型定义。无领域依赖。

## STRUCTURE

```
shared/
├── api/           # HttpClient(request.ts) + WebSocket(websocket.ts) + Mock
├── components/    # 20 复用组件（Avatar, Empty, Loading, Toast, Skeleton, ...）
├── hooks/         # 10 自定义 Hooks（useAuth, useCountDown, useFormValidation, ...）
├── i18n/          # i18next 配置 + zh-CN/en-US 资源（8 命名空间）
├── types/         # 全局类型（api.d.ts, index.ts）
└── utils/         # 12 工具（format, platform, storage, validate, navigation, ...）
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 修改 HTTP 拦截器 | `shared/api/request.ts` | Token 注入→平台签名→Token 刷新→错误标准化 |
| 修改 WebSocket | `shared/api/websocket.ts` | 自动重连/心跳/降级轮询/事件订阅 |
| 新增公共组件 | `shared/components/{Name}/` | index.tsx + index.scss 结构 |
| 新增 Hook | `shared/hooks/use{Name}.ts` | 无 index.ts，直接导出 |
| 新增工具函数 | `shared/utils/{name}.ts` | 按功能命名 |
| 修改 i18n 资源 | `shared/i18n/resources/{zh-CN,en-US}/` | 8 命名空间 JSON 文件 |
| 新增类型 | `shared/types/` | api.d.ts 为 API 类型，index.ts 为通用类型 |

## CONVENTIONS

- **组件结构**：`shared/components/{Name}/index.tsx` + `index.scss`
- **Hook 命名**：`use{Function}` 前缀（如 `useAuth`、`useDebounce`）
- **Mock 策略**：`shared/api/mock-interceptor.ts` + `mocks/` 目录，开发环境启用
- **i18n 命名空间**：common, auth, product, trade, community, notification, marketing, kyc
- **平台检测**：`utils/platform.ts` 提供 `isWeapp()`、`isH5()`、`isAscF()` 等

## ANTI-PATTERNS

- ❌ 禁止 shared 层 import `domains/` 下任何模块
- ❌ 禁止在 shared 组件中硬编码业务逻辑（应通过 props 或 hooks 注入）
- ❌ 禁止在 utils 中使用副作用（应保持纯函数）
