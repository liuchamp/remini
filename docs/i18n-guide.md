# 国际化指南 (i18n)

> 基于 i18next + react-i18next，支持中英双语。

## 配置位置

- 初始化：`src/shared/i18n/index.ts`
- 中文资源：`src/shared/i18n/resources/zh-CN/`
- 英文资源：`src/shared/i18n/resources/en-US/`

## 当前支持语言

| 语言代码 | 语言 | 文件名前缀 |
|----------|------|-----------|
| `zh-CN` | 简体中文 | `zh-CN/*.json` |
| `en-US` | 英文 | `en-US/*.json` |

## 命名空间

资源按领域划分为 **13 个命名空间**（namespace）：

| 命名空间 | 包含内容 |
|----------|----------|
| `common` | 通用文本（按钮、提示、错误等） |
| `auth` | 认证相关（登录/注册/密码） |
| `product` | 商品相关（详情/搜索/发布） |
| `trade` | 交易相关（订单/支付/出价） |
| `chat` | 聊天相关 |
| `profile` | 个人中心相关 |
| `validation` | 表单验证提示 |
| `marketing` | 营销相关（签到/积分/优惠券） |
| `logistics` | 物流相关 |
| `wallet` | 钱包/财务相关 |
| `kyc` | 实名认证相关 |
| `community` | 社区社交相关 |
| `notification` | 通知相关 |

## 使用方法

### 在组件中使用

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('product')

  return <Text>{t('detail.title')}</Text>
  // 从 common 命名空间取：t('common:loading')
}
```

### 在非组件代码中使用

```typescript
import i18n from './shared/i18n'

const text = i18n.t('common:confirm')
```

### 切换语言

```typescript
import { changeLanguage } from '@/shared/i18n'

// 切换到英文
changeLanguage('en-US')

// 切换到中文
changeLanguage('zh-CN')
```

语言选择会持久化到 `Taro.getStorageSync('@remx/locale')`。

## 资源文件格式

### JSON 资源示例

```json
// zh-CN/product.json
{
  "detail": {
    "title": "商品详情",
    "price": "价格",
    "description": "商品描述"
  },
  "search": {
    "placeholder": "搜索商品",
    "noResults": "未找到相关商品"
  }
}
```

### 使用变量插值

```json
{
  "welcome": "你好，{{name}}",
  "itemsCount": "共 {{count}} 件商品"
}
```

```tsx
t('common:welcome', { name: userName })
t('common:itemsCount', { count: items.length })
```

## 语言检测机制

1. 优先读取 `Taro.getStorageSync('@remx/locale')` 中用户手动选择的语言
2. 若无用户选择，通过 `Taro.getSystemInfoSync().language` 获取系统语言
3. 系统语言以 `zh` 开头 → zh-CN，以 `en` 开头 → en-US，否则默认 zh-CN
4. 默认 fallback 语言为 `zh-CN`

## 新增语言

1. 在 `src/shared/i18n/resources/` 下新建目录，如 `ja-JP/`
2. 复制所有 json 文件并翻译内容
3. 在 `src/shared/i18n/index.ts` 中引入并注册

```typescript
import jaCommon from './resources/ja-JP/common.json'
import jaAuth from './resources/ja-JP/auth.json'
import jaProduct from './resources/ja-JP/product.json'
import jaTrade from './resources/ja-JP/trade.json'
import jaChat from './resources/ja-JP/chat.json'
import jaProfile from './resources/ja-JP/profile.json'
import jaValidation from './resources/ja-JP/validation.json'
import jaMarketing from './resources/ja-JP/marketing.json'
import jaLogistics from './resources/ja-JP/logistics.json'
import jaWallet from './resources/ja-JP/wallet.json'
import jaKyc from './resources/ja-JP/kyc.json'
import jaCommunity from './resources/ja-JP/community.json'
import jaNotification from './resources/ja-JP/notification.json'

const resources = {
  'zh-CN': { /* ... */ },
  'en-US': { /* ... */ },
  'ja-JP': {
    common: jaCommon, auth: jaAuth, product: jaProduct,
    trade: jaTrade, chat: jaChat, profile: jaProfile,
    validation: jaValidation, marketing: jaMarketing,
    logistics: jaLogistics, wallet: jaWallet, kyc: jaKyc,
    community: jaCommunity, notification: jaNotification,
  }
}
```
