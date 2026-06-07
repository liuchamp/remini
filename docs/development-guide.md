# 开发指南

## 环境准备

```bash
# 安装依赖
pnpm install

# 安装 Husky Git hooks
pnpm prepare
```

## 开发命令

### 本地开发（带热更新）

```bash
# 微信小程序
pnpm dev:weapp

# 支付宝小程序
pnpm dev:alipay

# H5
pnpm dev:h5

# 鸿蒙元服务 (ASCf)
pnpm dev:ascf

# 其他平台
pnpm dev:swan    # 百度
pnpm dev:tt      # 头条
pnpm dev:qq      # QQ
pnpm dev:jd      # 京东
pnpm dev:rn      # React Native
pnpm dev:harmony-hybrid  # 鸿蒙混合
```

### 生产构建

```bash
# 微信小程序
pnpm build:weapp

# H5
pnpm build:h5

# 鸿蒙元服务
pnpm build:ascf
```

### ASCf 鸿蒙特有命令

```bash
# 监听编译
pnpm watch:ascf

# 安装运行到设备
pnpm run:ascf

# Debug 编译
pnpm debug:ascf

# Release 编译
pnpm release:ascf
```

## 创建新页面

1. 在 `src/pages/{module}/{page}/` 下创建三个文件：

```
pages/{module}/{page}/
├── index.tsx           # 页面组件
├── index.config.ts     # Taro 配置
└── index.scss          # 样式
```

2. 在 `src/app.config.ts` 中注册路由（主包或分包）
3. 如需要领域逻辑，在 `src/domains/` 中添加对应 API/Store

### 页面模板

```tsx
// index.tsx
import { View } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Page() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return <View className="page-container">Hello</View>
}
```

```typescript
// index.config.ts
export default definePageConfig({
  navigationBarTitleText: '页面标题',
})
```

## 代码规范

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件 | PascalCase | `ProductCard` |
| 文件/目录 | kebab-case | `product-card.tsx` |
| 函数/变量 | camelCase | `fetchProductList()` |
| 类型/接口 | PascalCase | `ProductDetail` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS 类名 | kebab-case | `.product-card` |
| Store | camelCase | `useProductStore` |

### 目录结构约定

```
src/
├── domains/{module}/    → 领域模块（API + Store + Types）
├── pages/{module}/      → 页面（按功能模块分组）
├── shared/              → 公共代码
│   ├── components/      → 公共组件（按组件名分目录）
│   └── hooks/           → 自定义 hooks
```

### 状态管理约定

- 使用 Zustand 管理全局状态
- Store 按领域拆分，放在 `domains/{module}/store.ts`
- 页面级别的局部状态使用 React useState/useReducer
- 避免在 Store 中存储 UI 状态

### API 调用约定

- 所有 HTTP 请求通过 `shared/api/request.ts` 的 `http` 实例
- 领域 API 统一放在 `domains/{module}/api.ts`
- 遵循 RESTful 风格

## Git 工作流

### 分支策略

- `main` — 稳定分支，仅合入 feature 分支
- `feat/*` — 功能开发分支
- `fix/*` — 修复分支

### 提交规范

使用 Conventional Commits：

```
<type>(<scope>): <description>

feat(auth): 添加手机号登录功能
fix(order): 修复订单列表加载更多问题
refactor(product): 重构商品详情页数据流
docs: 更新 API 文档
```

**type 可选值：** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**scope 可选值：** auth, product, order, trade, offer, chat, community, kyc, marketing, wallet, seller, admin, user, address, shipping, notification, settings

### 提交前检查

Husky + lint-staged 自动执行：

1. **commit-msg**: Commitlint 检查提交信息格式
2. **pre-commit**: lint-staged 对暂存文件运行 ESLint + Stylelint

## CSS 规范

- 默认使用 **Sass (SCSS)**
- 主题色通过 `src/styles/variables.scss` 的 CSS 变量控制
- NutUI 组件覆盖写在 `src/styles/nutui-override.scss`
- 页面样式遵循 BEM 命名风格

## 环境变量

| 文件 | 用途 |
|------|------|
| `.env.development` | 开发环境配置 |
| `.env.production` | 生产环境配置 |
| `.env.test` | 测试环境配置 |

通过 `process.env.TARO_ENV` 获取当前编译平台。
