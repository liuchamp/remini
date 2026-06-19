# REMX 项目功能完整性与基建补全设计

**Date**: 2026-06-20
**Topic**: Project Completeness, DDD Architecture Normalization, and Infrastructure Setup

## 1. 背景与目标 (Context & Goals)
在初步的项目完整性扫描中发现，虽然页面路由 (`app.config.ts` 中的 61 个页面) 已经全部就绪，但领域模块 (DDD)、项目目录边界及测试、CI/CD 等工程化基础设施仍有缺失。
本设计的目的是补齐这些缺失，提升项目的可维护性和工程化水平，使得代码架构完全对齐初始架构文档的规划。

## 2. 详细设计 (Design Details)

### 2.1 业务架构规范补齐 (DDD 架构对齐)
- **类型定义补全 (`types.ts`)**
  - **模块**: `admin`, `chat`, `shipping`, `wallet`, `address`
  - 提取当前分散在 `api.ts` 等文件中的内联类型定义，迁移到各自领域的 `types.ts` 中。确保模块间的数据契约清晰。
- **状态管理补全 (`store.ts`)**
  - **模块**: `admin`, `shipping`
  - 引入基于 `zustand` 的基础 store 定义，保证所有 `src/domains/*` 结构的一致性，方便后续的业务扩充和统一状态监控。
- **共享常量池建立 (`shared/constants/`)**
  - 在 `src/shared/` 目录下创建 `constants` 目录。
  - 规划以下分类常量：
    - `storage.ts`: 所有的本地存储键名 (Local Storage Keys)
    - `config.ts`: 全局业务配置参数 (如分页默认大小、默认请求超时时间)
    - `events.ts`: 全局事件总线的枚举类型 (EventBus Keys)

### 2.2 工程边界清理 (Server 代码剥离)
当前项目中 `src/server/`（如海报生成路由等 Node 代码）混杂在客户端代码目录，存在被前端构建工具误打包的风险。
- **操作方案**:
  1. 移动 `src/server/` 文件夹至根目录 `/server/`。
  2. 检查并更新 Taro 的配置文件 (`config/index.ts`) 和 TS 配置 (`tsconfig.json`)，在 `exclude` 数组中添加 `/server/`。
  3. (可选) 为 `/server` 目录下配置独立的 `package.json`，声明后端服务的执行命令。

### 2.3 工程化基建 (测试与 CI/CD)
缺乏测试和自动化流程会导致项目长期维护质量下降。
- **单元测试/组件测试选型 (Vitest)**
  - 利用 Taro 4.2 基于 Vite 构建的优势，引入 **Vitest + React Testing Library**。
  - 创建 `vitest.config.ts`，共享 Vite 配置。
  - 在项目中提供 1-2 个基础用例模板以确保环境可用（例如 `src/shared/utils/format.test.ts`）。
- **持续集成流水线 (GitHub Actions)**
  - 创建 `.github/workflows/ci.yml`。
  - **触发时机**: 推送代码至 `master`，或发起 Pull Request 时触发。
  - **执行步骤**: 
    1. 环境初始化 (Setup Node.js, install pnpm)
    2. Lint 检查 (`pnpm lint`)
    3. 类型检查 (`tsc --noEmit`)
    4. 测试运行 (`pnpm test`)
    5. 小程序构建验证 (`pnpm build:weapp`)

## 3. 验收标准 (Success Criteria)
- 所有的 domain 目录下均包含 `api.ts`, `store.ts`, `types.ts`。
- `src/server/` 不复存在，已安全迁移至根目录并确保 Taro 依然能成功编译。
- 可以在本地成功执行 `pnpm test` 并通过模板用例。
- `.github/workflows/ci.yml` 配置文件存在且语法正确。