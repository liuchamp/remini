## ADDED Requirements

### 语言切换
中文 / 英文切换 + 跟随系统

#### Scenario: 用户在设置页切换语言
WHEN 用户进入设置页的"语言"选项
THEN 展示语言选择列表：简体中文 / English
AND 当前语言以选中态标记
WHEN 用户选择 English
THEN 系统调用 i18n.changeLanguage('en')
AND 所有 UI 文本切换为英文
AND 语言偏好写入 storage（持久化保存）

#### Scenario: 小程序启动时自动识别语言
WHEN 小程序启动
THEN 系统优先读取 storage 中用户设置的语言偏好
WHEN storage 中存在语言设置
THEN 直接应用该语言
WHEN storage 中不存在语言设置
THEN 获取系统语言（Taro.getSystemInfoSync().language）
AND 根据系统语言自动匹配中文或英文
AND 若系统语言不在支持列表中则默认中文

### 国际化文本
所有 UI 文本使用 i18n key

#### Scenario: 组件使用国际化文本
WHEN 渲染任何 UI 组件
THEN 文本内容通过 i18n.t() 或 useTranslation() hook 获取
AND 不使用硬编码字符串
WHEN 缺少对应语言的翻译 key
THEN 回退显示默认语言（中文）的文本
AND 开发模式下控制台输出警告日志

#### Scenario: 动态内容中的国际化文本
WHEN 文本包含动态参数（如用户名、数字、时间）
THEN 使用 i18n 插值语法：t('welcome', { name: userName })
AND 支持复数形式（英文单复数差异）
WHEN 文本包含 HTML 标签或 Rich Text
THEN 使用 Trans 组件或 t() 的 context 参数处理

### 平台适配
微信中文 / 英文 + 支付宝中文

#### Scenario: 不同平台显示对应支持的语言
WHEN 小程序运行在微信平台
THEN 支持中文和英文切换
AND 语言选择列表显示"简体中文"和"English"
WHEN 小程序运行在支付宝平台
THEN 仅支持中文
AND 语言设置页不展示英文选项
AND 即使 storage 中存储了英文偏好也强制使用中文

#### Scenario: 平台间语言设置隔离
WHEN 用户在微信端切换为英文
THEN 语言偏好存储在微信 storage 中
WHEN 同一账户在支付宝端登录
THEN 读取支付宝 storage 中的语言设置（独立隔离）
AND 不受微信端语言设置影响

### 日期 / 数字格式化
本地化格式

#### Scenario: 日期格式按语言本地化
WHEN 系统展示日期和时间
THEN 中文环境下显示"2026 年 6 月 7 日"或"06-07"
AND 英文环境下显示"June 7, 2026"或"06/07"
WHEN 展示相对时间
THEN 中文显示"3 分钟前"、"昨天"、"本周一"
AND 英文显示"3 minutes ago"、"Yesterday"、"This Monday"

#### Scenario: 数字和货币格式本地化
WHEN 系统展示数字或货币金额
THEN 中文环境使用千分位分隔：¥12,345.00
AND 英文环境保持相同货币格式但使用英文货币标识：CNY 12,345.00
WHEN 展示百分比和分数
THEN 格式根据语言区域自动适配
AND 小数位精度统一为两位