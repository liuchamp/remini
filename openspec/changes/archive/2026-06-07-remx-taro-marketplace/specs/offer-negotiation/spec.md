# offer-negotiation

## ADDED Requirements

### 买家发起出价
金额（≤ 标价）+ 附言 + 频率限制

#### Scenario: 买家对可议价商品发起出价
WHEN 买家在商品详情页点击"我要出价"
THEN 系统展示出价表单：出价金额输入 + 附言输入
AND 出价金额上限为商品标价
AND 展示提示"出价不得超过标价 ¥xxx"
WHEN 买家输入合理金额和附言后点击"提交出价"
THEN 系统校验金额 ≤ 标价
AND 系统校验频率限制（同一商品 24h 内最多出价 3 次）
WHEN 校验通过
THEN 系统创建出价记录（状态：pending）
AND 发送出价通知给卖家
AND 展示"出价已发出，等待卖家回复"提示

#### Scenario: 买家出价金额校验失败
WHEN 买家输入金额 > 标价
THEN 系统实时提示"出价不能超过商品标价"
AND 提交按钮置灰
WHEN 买家输入金额 ≤ 0 或非数字
THEN 系统实时提示"请输入有效金额"

#### Scenario: 买家超出出价频率限制
WHEN 买家在 24h 内对同一商品发起第 4 次出价
THEN 系统展示提示"您今日已出价 3 次，请明天再来"
AND 出价按钮展示倒计时（剩余 XX 小时 XX 分）
WHEN 频率限制解除
THEN 出价按钮恢复正常状态

### 卖家响应出价
接受/拒绝/还价

#### Scenario: 卖家接受买家出价
WHEN 卖家在出价管理列表查看收到的出价
THEN 每条出价展示买家信息（脱敏昵称）、出价金额、附言、剩余时间
WHEN 卖家点击"接受出价"
THEN 弹出确认弹窗"确认以 ¥xxx 出售该商品？"
WHEN 卖家确认接受
THEN 出价状态更新为"accepted"
AND 自动为买家创建待支付订单
AND 通知买家"卖家已接受您的出价，请尽快支付"

#### Scenario: 卖家拒绝买家出价
WHEN 卖家点击"拒绝"
THEN 弹出原因选择面板（价格太低/已售出/不想卖/其他）
WHEN 卖家选择原因并确认
THEN 出价状态更新为"rejected"
AND 通知买家"卖家拒绝了您的出价"
AND 展示拒绝原因

#### Scenario: 卖家发起还价
WHEN 卖家点击"还价"
THEN 系统展示还价表单：还价金额输入 + 附言输入
AND 还价金额范围：1 分 ~ 标价
WHEN 卖家输入金额并提交
THEN 出价状态更新为"countered"
AND 通知买家"卖家向您还价 ¥xxx"

### 买家响应还价
接受/拒绝/再次出价

#### Scenario: 买家接受卖家还价
WHEN 买家收到还价通知进入出价详情
THEN 展示卖家还价金额和附言
AND 展示"接受"和"拒绝"按钮
WHEN 买家点击"接受"
THEN 出价状态更新为"accepted"
AND 自动创建待支付订单
AND 跳转支付页面

#### Scenario: 买家拒绝卖家还价
WHEN 买家点击"拒绝"
THEN 出价状态更新为"rejected"
AND 通知卖家"买家拒绝了您的还价"
WHEN 买家拒绝后可再次发起出价
THEN 重新计入频率限制

#### Scenario: 买家在还价基础上再次出价
WHEN 买家拒绝还价后点击"再次出价"
THEN 系统展示出价表单
AND 预填卖家还价金额为默认值
AND 金额上限仍为商品标价
WHEN 买家提交新出价
THEN 创建新一轮出价记录
AND 覆盖原出价频率限制计数

### 出价撤回
仅 pending 状态可撤回

#### Scenario: 买家撤回待处理的出价
WHEN 买家在出价列表查看状态为 pending 的出价
THEN 展示"撤回"按钮
WHEN 买家点击"撤回"
THEN 弹出二次确认弹窗"确认撤回该出价？"
WHEN 买家确认
THEN 出价状态更新为"withdrawn"
AND 通知卖家"买家已撤回出价"

#### Scenario: 买家无法撤回非 pending 出价
WHEN 买家查看已被卖家回复的出价（accepted/rejected/countered）
THEN "撤回"按钮隐藏或置灰
AND 展示提示"卖家已处理，无法撤回"
WHEN 买家查看已过期的出价
THEN "撤回"按钮隐藏

#### Scenario: 撤回后重新出价
WHEN 买家撤回出价后
THEN 允许对同一商品重新发起出价
AND 频率限制计数重置
WHEN 买家重新出价
THEN 创建全新出价记录

### 出价自动过期
48h TTL

#### Scenario: 出价自动过期处理
WHEN 出价创建后超过 48 小时卖家未响应
THEN 系统自动将出价状态更新为"expired"
AND 通知买家"您的出价已过期"
AND 通知卖家"出价已过期"
WHEN 买家查看过期出价
THEN 展示"已过期"标签
AND 提供"再次出价"按钮

#### Scenario: 到期前提醒
WHEN 出价距离过期不足 4 小时
THEN 系统发送到期提醒通知给卖家"您有一笔出价即将过期"
WHEN 出价距离过期不足 1 小时
THEN 系统发送加急提醒通知给卖家

#### Scenario: 过期后商品状态
WHEN 出价过期后
THEN 商品库存和状态不受影响
AND 其他买家可正常出价购买
WHEN 原买家点击"再次出价"
THEN 创建新出价记录
AND 重新计算 48h 有效期

### 出价列表
发出的/收到的 + 状态筛选

#### Scenario: 买家查看发出的出价列表
WHEN 买家进入"我的出价"页面
THEN 默认展示"发出的"Tab
AND 展示所有出价记录列表
AND 每项展示商品缩略图/标题/出价金额/状态标签/剩余时间

#### Scenario: 卖家查看收到的出价列表
WHEN 卖家进入"出价管理"页面
THEN 展示"收到的"Tab
AND 展示所有收到出价列表
AND 每项展示买家信息（脱敏）/出价金额/商品标题/状态/剩余时间
WHEN 出价状态为 pending
THEN 展示"接受/拒绝/还价"操作按钮

#### Scenario: 用户按状态筛选出价
WHEN 用户在出价列表页点击筛选按钮
THEN 系统展示状态筛选选项（全部/pending/accepted/rejected/countered/withdrawn/expired）
WHEN 用户选择特定状态
THEN 列表仅展示对应状态的出价
AND 筛选标签展示在列表顶部
WHEN 筛选结果为空
THEN 展示空状态提示
