## ADDED Requirements

### community namespace

新增 i18n 资源 namespace `community`，覆盖社区/营销域页面文案

#### Scenario: 社区 Feed 页面渲染
WHEN Feed 页面调用 `useTranslation(['community', 'common'])`
THEN i18n 加载 `zh-CN/community.json` + `en-US/community.json`
AND 中文/英文均提供完整 key 覆盖（tab 标题、空态、按钮、错误提示）
AND 缺失 key 时回退到 `zh-CN` 翻译
AND 开发模式控制台输出 `i18next::translator: missingKey` 警告

### notification namespace

新增 i18n 资源 namespace `notification`，覆盖通知中心页面文案

#### Scenario: 通知中心 Tab 切换
WHEN 用户点击"交易通知" Tab
THEN 显示 i18n key `notification.tab.transaction` 对应文案
AND 列表项"已读/未读"状态文案走 `notification.status.*`
AND "标记全部已读"按钮走 `notification.action.markAllRead`
AND 空态文案走 `notification.empty.*`

## MODIFIED Requirements

### 语言切换持久化

#### Scenario: 用户在设置页切换语言为 English
WHEN 用户在设置页选择 English
THEN 系统调用 `i18n.changeLanguage('en-US')`
AND 所有 UI 文本立即切换为英文
AND 语言偏好写入 `Taro.setStorageSync('@remx/locale', 'en-US')`
WHEN 用户杀掉小程序后重新打开
THEN 启动时读取 `@remx/locale` 优先于系统语言
AND 直接应用保存的 'en-US'，不再走系统语言检测

### 全量 useTranslation 接入

#### Scenario: 改造硬编码字符串
WHEN 任意 .tsx 页面存在 4+ 连续中文字符串硬编码
THEN 重构为 `useTranslation()` hook + t('key') 调用
AND 公共文案走 `common` namespace，页面专属文案走对应 namespace
AND 提交前 grep 验证 `pages/**/*.tsx` 中无剩余硬编码中文段落
