## MODIFIED Requirements

### 设置页

#### Scenario: 用户进入"我的"→"设置"
WHEN 用户从个人中心进入设置页
THEN 设置页显示以下区块（按顺序）：
- 账号：头像/昵称/手机号（脱敏）
- 关于：当前版本号 v1.0.0 + 检查更新按钮
- 隐私：隐私政策链接 / 用户协议链接
- 语言：嵌入 LanguageSwitcher
- 缓存：当前缓存大小（如 12.3 MB）+ 一键清理按钮
- 退出登录：底部独立按钮

#### Scenario: 用户点击"清理缓存"
WHEN 用户点击"清理缓存"按钮
THEN 二次确认弹窗："确定清理 12.3MB 缓存？"
WHEN 用户确认
THEN 调用 `Taro.clearStorageSync()`（保留 token 与 locale）
AND 刷新显示为 0 MB
AND 提示"清理成功"
