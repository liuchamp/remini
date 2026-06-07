## ADDED Requirements

### 微信/支付宝一键登录

#### 小程序端获取临时 code
WHEN 用户在小程序内点击「微信一键登录」或「支付宝一键登录」
THEN 前端调用 wx.login()（微信端）/ my.getAuthCode()（支付宝端）获取临时 code，并将 platform 标识（wechat / alipay）与 code 一同发送至后端 /api/auth/code2session 接口

#### 后端 code2session 兑换 JWT
WHEN 后端收到临时 code 和 platform 标识
THEN 后端调用微信/支付宝的 code2session 接口兑换 openId + sessionKey，生成 JWT 令牌对（access_token + refresh_token），并返回给前端；若 code 过期或无效，返回 401 并提示用户重新授权

#### 令牌持久化与自动登录
WHEN 前端收到 JWT 令牌对
THEN 将 access_token 和 refresh_token 写入 Taro.setStorageSync()，并跳转至首页；下次启动时若 storage 中存在有效 token 则跳过登录页，直接进入首页

### 手机号登录

#### 手机号输入与验证码发送
WHEN 用户输入手机号并点击「获取验证码」
THEN 前端校验手机号格式（11 位数字 / +86 等），校验通过后调用后端 /api/auth/send-code 接口；后端生成 6 位数字验证码并下发至对应手机号，前端进入 60 秒倒计时冷却状态，冷却期间禁用发送按钮

#### 设备指纹绑定
WHEN 用户提交手机号 + 验证码进行登录
THEN 前端采集设备指纹信息（设备型号、系统版本、客户端版本、网络类型、屏幕分辨率），与登录请求一同提交至后端 /api/auth/login-by-phone 接口；后端校验验证码正确性，绑定设备指纹至当前用户，返回 JWT 令牌对

#### 验证码错误处理
WHEN 用户提交错误的验证码
THEN 后端返回 403 并提示「验证码错误或已过期」，前端不清除手机号输入内容，允许用户重新获取验证码；连续 5 次错误触发图形验证码校验

### Token 管理

#### 请求头自动注入
WHEN 前端发起任何需要认证的 API 请求
THEN 请求拦截器从 storage 读取当前 access_token，自动附加 Authorization: Bearer <access_token> 请求头；若 storage 中不存在 token，请求正常发起但跳过注入

#### 401 自动刷新机制
WHEN 后端接口返回 401 Unauthorized
THEN 前端响应拦截器拦截该响应，检查 refresh_token 是否存在；若存在，调用 /api/auth/refresh 接口获取新的 access_token，重放原始请求（最多重试 1 次）；若刷新接口也返回 401，则跳转至刷新失败逻辑

#### 刷新失败跳转登录
WHEN refresh_token 过期或无效（刷新接口返回 401）
THEN 前端清除 storage 中所有令牌数据，跳转至登录页并提示「登录已过期，请重新登录」；当前页面路由堆栈保留，登录成功后尝试恢复

### 注册流程

#### 注册信息提交
WHEN 用户填写用户名（4-20 位字母数字组合）、密码（8 位以上含大小写字母+数字）、手机号、图形验证码，并点击注册
THEN 前端校验输入格式合规后，调用后端 /api/auth/register 接口；后端校验账号唯一性、图形验证码是否正确，发送短信验证码至用户手机

#### 邀请码绑定
WHEN 用户输入邀请码（可选字段）并提交注册
THEN 前端将邀请码附加至注册请求体中的 referrer_code 字段；后端在注册成功后将邀请关系写入推广记录表，邀请人获得对应积分奖励（由营销系统处理）

#### 注册成功自动登录
WHEN 注册请求成功（后端返回用户信息）
THEN 后端自动签发 JWT 令牌对并一同返回；前端将令牌写入 storage，跳转至首页；若注册接口因手机号已注册等业务逻辑失败，返回具体错误提示，不清除已填表单

### 登录态保持

#### 小程序启动 Token 校验
WHEN 小程序启动（App.onLaunch / onShow）
THEN 前端从 storage 读取 refresh_token，调用 /api/auth/check 接口校验 token 有效性；若有效，静默续签 access_token 并进入首页；若无效，清除 token 并跳转至登录页

#### 多设备登录管理
WHEN 同一账号在另一台设备上登录
THEN 后端记录本次登录的设备指纹，返回当前账号已登录设备列表；用户可在「设置-账号安全」页面查看已登录设备，并可主动下线指定设备；当已登录设备超过 5 台时，最早登录的设备将被强制下线

#### 退出登录清除本地数据
WHEN 用户点击退出登录
THEN 前端调用 /api/auth/logout 接口通知后端销毁当前 refresh_token，清除 storage 中所有令牌和用户信息，清除购物车和临时缓存数据，跳转至登录页并清空页面路由堆栈
