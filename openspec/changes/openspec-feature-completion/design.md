# Design: OpenSpec Feature Completion

## Architecture Decisions

### 分阶段实施策略

采用 4 阶段递进实施，每阶段独立可验证：

1. **Phase 0（编译阻断）**：路由注册 + API stub 补全 → 项目可构建
2. **Phase 1（核心功能）**：评价/通知/IM/圈子/设备管理 → 核心流程可用
3. **Phase 2（增强功能）**：物流/领券/创作者/分享/管理后台/出价/积分 → 功能完整
4. **Phase 3（质量收尾）**：i18n 清理 + 小功能补齐 → 质量达标

### API 补全模式

所有缺失 API 遵循现有 domain 模式：
- `domains/<domain>/api.ts` — 添加方法，返回 `http.get/post/delete<T>()`
- `domains/<domain>/types.ts` — 添加缺失类型定义
- `domains/<domain>/store.ts` — 需要状态管理时添加 zustand store

### 页面实现模式

- 空壳页面：重写为完整页面，遵循现有 Taro + React 组件模式
- 功能增强：在现有页面基础上增量添加
- 新页面：注册到 `app.config.ts` 后创建

### 技术约束

- 框架：Taro 3.x + React 18
- 状态管理：Zustand（现有模式）
- 样式：SCSS modules
- 网络层：现有 `shared/utils/http.ts`
- i18n：`react-i18next`，namespace 按 domain 划分

## Risks

1. **API 响应结构不确定**：后端未实现，前端类型定义可能与实际不一致 → 使用合理 mock 类型
2. **i18n 工作量巨大**：377 处硬编码涉及 44 个文件 → 分批处理，优先 P0/P1 页面
3. **图表库集成**：echarts-for-weixin 在 Taro 中兼容性需验证 → Phase 2 再处理

## Testing Strategy

- Phase 0：`tsc --noEmit` 编译通过
- Phase 1-2：手动功能验证 + 页面可访问性检查
- Phase 3：`grep` 验证无中文硬编码 + 语言切换验证
