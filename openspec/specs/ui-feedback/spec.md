## ADDED Requirements

### 骨架屏

列表页加载时显示骨架占位，避免布局抖动

#### Scenario: Feed 页面初次加载
WHEN 用户进入 Feed 页面
AND 数据未返回（loading=true）
THEN 页面渲染 `Skeleton type="list"` 组件
AND 骨架占位数量 = 5 行
AND 高度与真实列表项高度一致
WHEN 数据返回成功后
THEN 骨架屏消失，显示真实列表（无闪烁）

### 错误重试

列表页请求失败时显示重试入口

#### Scenario: 网络错误导致列表加载失败
WHEN Feed 页面初次请求数据
AND 网络中断或 5xx 错误
THEN 页面渲染 `RetryButton` 组件
AND 按钮文案："加载失败，点击重试"（i18n key: `common.retry`）
WHEN 用户点击重试按钮
THEN 重新调用 `loadNotifications` / `getFeed` 等方法
AND 按钮显示 loading 状态防重复点击
AND 成功后恢复列表展示

### 统一空态

无数据时显示空态提示，支持可选 CTA

#### Scenario: 用户搜索一个无结果关键词
WHEN 用户搜索"abcdef123456"
AND 后端返回空结果
THEN 页面渲染 `Empty` 组件
AND 默认文案："暂无相关商品"（i18n key: `common.empty.search`）
AND 不显示 action 按钮（无意义操作）
