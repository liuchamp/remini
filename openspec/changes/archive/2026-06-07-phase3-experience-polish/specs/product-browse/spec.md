## MODIFIED Requirements

### 搜索建议

#### Scenario: 用户在搜索框输入关键词
WHEN 用户在搜索输入框中输入任意字符
THEN 系统以 300ms 防抖调用 `productApi.searchSuggest(keyword)`
AND 返回 5-10 条前缀匹配的关键词建议
AND 建议以浮层形式显示在输入框下方
WHEN 用户点击某条建议
THEN 自动填充到输入框并触发搜索

### 热门搜索

#### Scenario: 用户进入搜索页
WHEN 搜索页 onLoad
THEN 异步请求 `productApi.getHotSearches()`
AND 返回 Top 10 热门关键词
AND 在搜索框下方以横向 chips 展示
AND 同一会话 5 分钟内不重复请求（前端缓存）

### 搜索筛选

#### Scenario: 用户点击搜索结果上方的"筛选"按钮
WHEN 用户点击筛选按钮
THEN 底部弹出 `FilterPanel` 组件
AND 筛选维度：分类（树形选择）/ 价格区间（双滑块）/ 成色（全新/9成新/8成新等）/ 仅议价（开关）/ 排序（综合/价格升/价格降/最新/距离）
WHEN 用户确认筛选
THEN 关闭弹窗，更新 query 并重新请求搜索
AND 已选筛选条件以 chip 形式显示在结果上方，可单独移除

### 多维排序

#### Scenario: 用户切换排序方式为"价格升序"
WHEN 用户在排序 Tab 选择"价格 ↑"
THEN 重新请求 `productApi.search({ sort: 'price_asc' })`
AND 当前排序 Tab 高亮
AND 列表更新并保持滚动位置
