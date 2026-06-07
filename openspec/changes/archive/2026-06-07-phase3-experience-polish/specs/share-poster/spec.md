## ADDED Requirements

### 页面分享配置

所有页面需支持微信小程序原生分享到朋友/朋友圈

#### Scenario: 用户点击右上角"..."选择"分享给朋友"
WHEN 用户在任意页面点击右上角菜单选择"分享给朋友"
THEN 系统调用 `onShareAppMessage` 回调
AND 返回 `{ title, path, imageUrl }` 三元组
AND title 默认使用当前页面 H1 文案
AND path 默认使用当前页面 URL（含 query 参数）
AND imageUrl 缺省时使用平台默认缩略图

#### Scenario: 用户点击右上角"..."选择"分享到朋友圈"
WHEN 用户在任意页面点击右上角菜单选择"分享到朋友圈"
THEN 系统调用 `onShareTimeline` 回调
AND 返回 `{ title, query }` 二元组
AND query 需包含 `from=share_timeline` 标识
AND 进入页面时若 query 包含该标识，记录一次分享回流

### 海报生成

关键页面（商品/帖子/邀请）支持一键生成 Canvas 海报并保存到相册

#### Scenario: 用户在商品详情页点击"生成分享海报"
WHEN 用户点击商品详情页的"分享海报"按钮
THEN 系统弹出 `PosterGenerator` 弹窗
AND 弹窗内异步绘制：商品主图 + 标题 + 价格 + 二维码 + 平台 Logo
AND 绘制完成后显示"保存到相册"按钮
WHEN 用户点击"保存到相册"
THEN 调用 `Taro.saveImageToPhotosAlbum` 保存图片
AND 成功后提示"已保存到相册"
AND 失败时根据 `authSetting['scope.writePhotosAlbum']` 引导用户授权

#### Scenario: Canvas 绘制失败降级
WHEN `Taro.canvasToTempFilePath` 抛出异常
THEN 系统捕获异常
AND 提示"海报生成失败，正在尝试服务端方案"
AND 调用后端 `/api/poster/generate` 接口获取预渲染图片 URL
AND 跳转图片预览页让用户长按保存
