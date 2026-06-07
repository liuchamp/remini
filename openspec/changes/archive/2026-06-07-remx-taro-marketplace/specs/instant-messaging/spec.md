## ADDED Requirements

### WebSocket 连接管理 - 建立/重连/心跳/关闭(小程序 wx.connectSocket)

#### Scenario: 用户登录后建立 WebSocket 连接
WHEN 用户完成登录认证
THEN 自动调用 wx.connectSocket 建立 WebSocket 连接
AND 连接成功后发送身份认证消息（含 Token）
AND 连接状态更新为「在线」

#### Scenario: WebSocket 断线自动重连
WHEN WebSocket 连接因网络原因断开（onClose 触发）
THEN 启动指数退避重连策略（1s → 2s → 4s → 8s → 最大 30s）
AND 重连成功后重新发送身份认证
AND 未读消息在重连后自动拉取

#### Scenario: WebSocket 心跳保活
WHEN WebSocket 连接已建立
THEN 每 30 秒发送心跳 ping 消息
AND 服务端回复 pong 确认
AND 连续 3 次心跳无响应则主动断开并触发重连

#### Scenario: 用户退出登录关闭连接
WHEN 用户退出登录或 Token 过期
THEN 主动调用 wx.closeSocket 关闭 WebSocket 连接
AND 清除心跳定时器
AND 连接状态更新为「离线」

### 会话列表 - 最后消息+未读数+商品信息

#### Scenario: 会话列表展示
WHEN 用户进入消息页
THEN 展示所有活跃会话列表，按最后消息时间倒序排列
AND 每个会话项展示对方头像、昵称、最后一条消息预览
AND 展示未读消息数红点（超过 99 显示 99+）
AND 展示最后消息的时间戳

#### Scenario: 会话中的商品信息展示
WHEN 会话中包含商品卡片消息
THEN 会话列表项额外展示商品缩略图
AND 展示商品标题和价格摘要

#### Scenario: 删除/置顶会话
WHEN 用户在会话列表左滑某会话
THEN 显示「删除」和「置顶」操作按钮
AND 置顶的会话固定在列表顶部（带置顶标识）
AND 删除会话后清空本地聊天记录

### 聊天 - 文字+图片(wx.chooseMedia)+商品卡片+订单卡片

#### Scenario: 用户发送文字消息
WHEN 用户在聊天输入框输入文字并点击发送
THEN 消息实时显示在聊天区域（先展示发送中状态）
AND 消息通过 WebSocket 推送给对方
AND 发送成功后状态变为「已发送」

#### Scenario: 用户发送图片消息
WHEN 用户点击图片按钮调用 wx.chooseMedia
THEN 选择图片后上传至文件服务
AND 图片缩略图在聊天中展示（先展示上传进度）
AND 上传完成后发送图片消息

#### Scenario: 用户发送商品卡片
WHEN 用户在聊天中点击「发商品」按钮
THEN 弹出用户已发布的商品列表供选择
AND 选择后发送商品卡片（含缩略图、标题、价格）
AND 对方点击卡片跳转商品详情页

#### Scenario: 用户发送订单卡片
WHEN 用户在聊天中点击「发订单」按钮
THEN 弹出相关订单列表供选择
AND 选择后发送订单卡片（含订单号、商品信息、订单状态）
AND 对方点击卡片跳转订单详情页

### 消息已读 - 已读回执+时间戳

#### Scenario: 发送方查看已读状态
WHEN 发送方查看聊天中的消息
THEN 已送达的消息显示「已送达」标识
AND 对方已阅读的消息显示「已读」标识及阅读时间
AND 群发或批量消息显示「N 人已读」

#### Scenario: 接收方阅读消息触发已读回执
WHEN 接收方打开聊天页面且消息进入可见区域
THEN 自动发送已读回执（含消息 ID + 时间戳）
AND 已读状态在发送方实时更新

### 屏蔽用户 - 阻止消息+屏蔽状态

#### Scenario: 用户屏蔽他人
WHEN 用户在聊天设置页点击「屏蔽用户」
THEN 确认后该用户被加入屏蔽列表
AND 被屏蔽用户发送的消息不再推送给当前用户
AND 会话列表中该会话显示「已屏蔽」角标

#### Scenario: 屏蔽/取消屏蔽
WHEN 用户进入屏蔽列表管理页
THEN 展示所有已屏蔽用户列表
AND 支持单个「取消屏蔽」
AND 取消屏蔽后恢复正常消息接收
AND 屏蔽期间错过的消息不补发

### WebSocket 降级轮询 - 连接失败时切到轮询

#### Scenario: WebSocket 连接失败自动降级
WHEN wx.connectSocket 连续 3 次连接失败
THEN 自动切换为 HTTP 长轮询模式（每 5 秒拉取一次新消息）
AND 页面顶部展示「实时连接已断开」提示条
AND 保留重试 WebSocket 的机制（每 60 秒尝试重连一次）

#### Scenario: 轮询恢复为 WebSocket
WHEN 降级轮询期间 WebSocket 重连成功
THEN 关闭轮询定时器
AND 关闭顶部提示条
AND 拉取轮询期间遗漏的消息

#### Scenario: 用户手动切换连接模式
WHEN 用户在设置页面查看连接状态
THEN 展示当前连接模式（WebSocket/轮询）
AND 支持手动「重新连接」触发 WebSocket 重连
AND 展示连接质量统计（延迟、丢包率）
