---
change: review-fix-p0-p1
design-doc: docs/superpowers/specs/2026-06-08-review-fix-p0-p1-design.md
base-ref: 1697526eea4c21c8115d9a5b25a8eea09a17bf86
---

# 修复完整性评审报告 P0 & P1 缺口 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 REMX Mini-App 完整性评审报告中的安全合规与核心出价流程缺口，包括提现限额动态化、2FA拦截与重放、出价详情页操作闭环。

**Architecture:** 
1. 提现页接入 KYC 等级限额判断，非 L2/L3 阻断提现并引导升级。
2. axios-like HTTP 拦截器捕获 412/RISK_CHALLENGE，暂存请求，跳转 2FA 页面验证，验证通过后重放请求。
3. 出价详情页增加操作按钮，针对不同出价状态及用户角色渲染接受/拒绝/还价按钮。

**Tech Stack:** Taro 4.2, React 18, TypeScript, Zustand 5

---

### Task 1: 提现限额动态计算与 KYC 引导

**Files:**
- Modify: `src/pages/wallet/withdraw/index.tsx`

- [ ] **Step 1: 引入 KYC 状态与限额表**
  
  在 `src/pages/wallet/withdraw/index.tsx` 中引入 `useAuthStore` 以及 KYC 等级对应的限额表。
  
  代码修改示例：
  ```typescript
  import { useAuthStore } from '@/domains/auth/store'
  
  // KYC 等级限额配置
  const KYC_LIMITS = {
    L0: 0,
    L1: 0,
    L2: 5000,
    L3: 50000
  }
  ```

- [ ] **Step 2: 动态计算 maxWithdraw 及 KYC 等级验证**
  
  替换 `withdraw/index.tsx` 中的硬编码 `5000` 限制。
  
  ```typescript
  const user = useAuthStore((state) => state.user)
  const currentTier = user?.currentKycTier || 'L0'
  const tierLimit = KYC_LIMITS[currentTier] || 0
  const availableBalance = balance?.availableBalance || 0
  const maxWithdraw = Math.min(availableBalance, tierLimit)
  ```

- [ ] **Step 3: 增加限额不足及未达标提示 UI 与 KYC 引导跳转**
  
  如果用户为 L0 或 L1 级（提现额度为0，需要升级至 L2），阻断提现表单并展示升级 KYC 提示引导。
  
  ```typescript
  // 在 render 中添加 KYC 升级引导
  {currentTier !== 'L2' && currentTier !== 'L3' && (
    <View className='kyc-warning-banner'>
      <Text className='warning-text'>提现功能需要实名认证达到 L2 等级，您当前等级为 {currentTier}</Text>
      <Button 
        className='upgrade-btn' 
        onClick={() => Taro.navigateTo({ url: '/pages/kyc/index/index' })}
        size='mini'
        type='warn'
      >
        去认证/升级
      </Button>
    </View>
  )}
  ```

- [ ] **Step 4: 本地构建与验证**
  
  运行：`npm run build:weapp` 或 `npx tsc --noEmit` 验证是否有类型或语法错误。
  
  - [ ] **Step 5: 提交更改**
  
  ```bash
  git add src/pages/wallet/withdraw/index.tsx
  git commit -m "feat: implement dynamic withdraw limit and kyc upgrade prompt"
  ```

---

### Task 2: 2FA 风控拦截、重放拦截器与验证页

**Files:**
- Modify: `src/shared/api/request.ts`
- Modify: `src/app.config.ts`
- Create: `src/pages/auth/challenge/index.tsx`
- Create: `src/pages/auth/challenge/index.config.ts`
- Create: `src/pages/auth/challenge/index.scss`

- [ ] **Step 1: 在 HttpClient 中新增请求暂存与 2FA 重定向重放拦截器**
  
  修改 `src/shared/api/request.ts`，增加暂存请求和重试的机制。
  
  ```typescript
  // 暂存请求的临时变量
  let pendingRequest: {
    config: RequestConfig
    resolve: (value: any) => void
    reject: (reason: any) => void
  } | null = null
  
  export const getPendingRequest = () => pendingRequest
  export const clearPendingRequest = () => { pendingRequest = null }
  export const resolvePendingRequest = (res: any) => {
    if (pendingRequest) {
      pendingRequest.resolve(res)
      clearPendingRequest()
    }
  }
  export const rejectPendingRequest = (err: any) => {
    if (pendingRequest) {
      pendingRequest.reject(err)
      clearPendingRequest()
    }
  }
  ```
  
  在 `HttpClient` 的 `responseInterceptors` 数组中添加 `riskInterceptor`：
  
  ```typescript
  // 构造函数中：
  this.responseInterceptors.push(this.riskInterceptor.bind(this))
  
  // 类中新增方法：
  private async riskInterceptor(response: ApiResponse): Promise<ApiResponse> {
    if (response.code === 412) {
      // 412: 需要进行 2FA 挑战验证
      Taro.showToast({ title: '安全验证', icon: 'none' })
      Taro.navigateTo({ url: '/pages/auth/challenge/index' })
      
      // 返回一个未决的 Promise，在 2FA 成功后再 resolve 它
      return new Promise((resolve, reject) => {
        // 保存原请求信息用于之后重放
        pendingRequest = {
          config: response.config || {}, // 确保保存请求配置，HttpClient request 方法中需将 processedConfig 注入到 response
          resolve,
          reject
        }
      })
    }
    if (response.code === 403) {
      // 403: 风控阻断
      Taro.showModal({
        title: '交易被拦截',
        content: response.message || '由于账户或操作风险，交易已被风控系统拦截。',
        showCancel: false
      })
      throw new Error(response.message || 'Blocked by risk engine')
    }
    return response
  }
  ```
  
  注意：需要在 `HttpClient.request` 中，在 response 对象上注入原 `processedConfig`：
  ```typescript
  let response = res.data as ApiResponse<T>
  ;(response as any).config = processedConfig
  ```

- [ ] **Step 2: 注册二级验证挑战页面路由**
  
  在 `src/app.config.ts` 的 `pages/auth` 分包中注册 `challenge/index` 路由。
  
  ```typescript
  // 在 subPackages 中修改：
  {
    root: 'pages/auth',
    pages: ['login/index', 'register/index', 'challenge/index']
  }
  ```

- [ ] **Step 3: 创建挑战页面 (challenge/index)**
  
  新建 `src/pages/auth/challenge/index.config.ts`：
  ```typescript
  export default definePageConfig({
    navigationBarTitleText: '安全验证'
  })
  ```
  
  新建 `src/pages/auth/challenge/index.tsx`，编写 6 位验证码校验及 TOTP 绑定/输入组件。验证通过后调用 `resolvePendingRequest` 重放，失败调用 `rejectPendingRequest`。
  
  ```typescript
  import { View, Text, Input, Button } from '@tarojs/components'
  import Taro from '@tarojs/taro'
  import { useState } from 'react'
  import { resolvePendingRequest, rejectPendingRequest, http } from '@/shared/api/request'
  import './index.scss'
  
  export default function Challenge() {
    const [code, setCode] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [errorCount, setErrorCount] = useState(0)
  
    const handleVerify = async () => {
      if (code.length !== 6) {
        Taro.showToast({ title: '请输入6位验证码', icon: 'none' })
        return
      }
      setVerifying(true)
      try {
        // 调用验证二次验证接口
        const res = await http.post('/auth/challenge/verify', { code })
        if (res.code === 0) {
          Taro.showToast({ title: '验证成功', icon: 'success' })
          
          // 获取刚才被拦截的请求配置
          const pending = (http as any).pendingRequest || require('@/shared/api/request').getPendingRequest()
          if (pending) {
            // 重放请求
            const replayRes = await http.request(pending.config)
            resolvePendingRequest(replayRes)
          }
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        } else {
          setErrorCount(prev => prev + 1)
          if (errorCount + 1 >= 5) {
            Taro.showModal({
              title: '验证失败次数过多',
              content: '连续5次验证失败，您的账户已被锁定30分钟。',
              showCancel: false,
              success: () => {
                rejectPendingRequest(new Error('Too many attempts'))
                Taro.reLaunch({ url: '/pages/index/index' })
              }
            })
          } else {
            Taro.showToast({ title: res.message || '验证码错误', icon: 'none' })
          }
        }
      } catch (err) {
        Taro.showToast({ title: '验证失败', icon: 'none' })
      } finally {
        setVerifying(false)
      }
    }
  
    return (
      <View className='challenge-page'>
        <View className='header'>
          <Text className='title'>请输入二次验证码</Text>
          <Text className='subtitle'>已发送6位验证码至您的绑定手机号</Text>
        </View>
        <Input 
          className='code-input' 
          type='number' 
          maxlength={6} 
          placeholder='000000' 
          value={code} 
          onInput={(e) => setCode(e.detail.value)}
        />
        <Button className='verify-btn' loading={verifying} onClick={handleVerify}>
          验证并继续
        </Button>
      </View>
    )
  }
  ```

- [ ] **Step 4: 创建 `src/pages/auth/challenge/index.scss` 基础样式**
  
  ```scss
  .challenge-page {
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .header {
      margin-bottom: 40px;
      text-align: center;
      .title { font-size: 20px; font-weight: bold; color: #333; }
      .subtitle { font-size: 14px; color: #999; margin-top: 10px; display: block; }
    }
    .code-input {
      border-bottom: 2px solid #ccc;
      font-size: 32px;
      text-align: center;
      width: 200px;
      margin-bottom: 40px;
      letter-spacing: 5px;
    }
    .verify-btn {
      width: 100%;
      background-color: #FF6B35;
      color: white;
      border-radius: 4px;
    }
  }
  ```

- [ ] **Step 5: 提交更改**
  
  ```bash
  git add src/shared/api/request.ts src/app.config.ts src/pages/auth/challenge/
  git commit -m "feat: implement 2FA risk interceptor, challenge route, and page UI"
  ```

---

### Task 3: 完善出价详情页操作闭环

**Files:**
- Modify: `src/pages/offer/detail/index.tsx`
- Modify: `src/pages/offer/detail/index.scss`

- [ ] **Step 1: 增加对当前用户 ID 的判断**
  
  从 `useAuthStore` 中获取 `user` 并获取其 `id`。
  
  ```typescript
  import { useAuthStore } from '@/domains/auth/store'
  
  // 在 Detail 组件内部
  const user = useAuthStore(state => state.user)
  const currentUserId = user?.id
  ```

- [ ] **Step 2: 在 UI 中添加针对不同身份和状态的操作按钮**
  
  根据 `offer.buyerId` 和 `offer.sellerId` 渲染两套不同的操作。
  
  - 买家在 `pending` 状态下可 `撤回出价 (withdraw)`
  - 卖家在 `pending` 状态下可 `接受出价 (accept)`，`拒绝出价 (reject)`，或 `还价 (counter)`
  - 买家在 `countered` 状态下可 `接受还价 (accept)`，`拒绝还价 (reject)`，或 `再次出价 (counter)`
  
  ```typescript
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const handleAction = async (action: 'accept' | 'reject' | 'withdraw' | 'counter') => {
    if (submitting) return
    setSubmitting(true)
    try {
      if (action === 'accept') {
        await offerApi.accept(offer.id)
        Taro.showToast({ title: '已接受', icon: 'success' })
      } else if (action === 'reject') {
        await offerApi.reject(offer.id)
        Taro.showToast({ title: '已拒绝', icon: 'success' })
      } else if (action === 'withdraw') {
        await offerApi.withdraw(offer.id)
        Taro.showToast({ title: '已撤回', icon: 'success' })
      } else if (action === 'counter') {
        const num = parseFloat(counterPrice)
        if (isNaN(num) || num <= 0) {
          Taro.showToast({ title: '请输入有效还价金额', icon: 'none' })
          setSubmitting(false)
          return
        }
        await offerApi.counter(offer.id, num)
        Taro.showToast({ title: '已发起还价', icon: 'success' })
        setCounterOpen(false)
      }
      // 重新加载详情刷新视图
      loadOffer(offer.id)
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }
  ```

- [ ] **Step 3: 渲染详情页底部按钮组件**
  
  ```typescript
  const isBuyer = currentUserId === offer.buyerId
  const isSeller = currentUserId === offer.sellerId
  
  return (
    // ... 原有组件
    <View className='action-bar-placeholder' />
    <View className='offer-action-bar'>
      {isBuyer && offer.status === 'pending' && (
        <Button className='action-btn withdraw' onClick={() => handleAction('withdraw')}>撤回出价</Button>
      )}
      {isSeller && offer.status === 'pending' && (
        <View className='btn-group'>
          <Button className='action-btn reject' onClick={() => handleAction('reject')}>拒绝</Button>
          <Button className='action-btn counter' onClick={() => setCounterOpen(true)}>还价</Button>
          <Button className='action-btn accept' onClick={() => handleAction('accept')}>接受</Button>
        </View>
      )}
      {isBuyer && offer.status === 'countered' && (
        <View className='btn-group'>
          <Button className='action-btn reject' onClick={() => handleAction('reject')}>拒绝</Button>
          <Button className='action-btn counter' onClick={() => setCounterOpen(true)}>再次出价</Button>
          <Button className='action-btn accept' onClick={() => handleAction('accept')}>接受</Button>
        </View>
      )}
    </View>
  )
  ```

- [ ] **Step 4: 为还价设计一个简单的输入 Panel/Modal**
  
  ```typescript
  {counterOpen && (
    <View className='counter-modal-overlay' onClick={() => setCounterOpen(false)}>
      <View className='counter-modal' onClick={e => e.stopPropagation()}>
        <Text className='modal-title'>发起还价金额</Text>
        <Input 
          type='digit' 
          placeholder='输入价格' 
          value={counterPrice} 
          onInput={e => setCounterPrice(e.detail.value)}
        />
        <View className='modal-btns'>
          <Button onClick={() => setCounterOpen(false)}>取消</Button>
          <Button type='primary' onClick={() => handleAction('counter')}>提交</Button>
        </View>
      </View>
    </View>
  )}
  ```

- [ ] **Step 5: 添加底部按钮与 Modal 的样式到 `detail/index.scss`**
  
  确保样式美观，按钮对齐。
  
  ```scss
  .offer-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 10px 20px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    display: flex;
    justify-content: flex-end;
    .btn-group {
      display: flex;
      width: 100%;
      gap: 10px;
    }
    .action-btn {
      flex: 1;
      font-size: 14px;
      height: 40px;
      line-height: 40px;
      border-radius: 4px;
      &.accept { background: #FF6B35; color: #fff; }
      &.reject { background: #f5f5f5; color: #333; }
      &.counter { background: #ffe2d9; color: #FF6B35; }
      &.withdraw { background: #f5f5f5; color: #666; }
    }
  }
  .counter-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    .counter-modal {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      width: 80%;
      input {
        border: 1px solid #ddd;
        padding: 10px;
        margin: 15px 0;
        border-radius: 4px;
      }
      .modal-btns {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    }
  }
  ```

- [ ] **Step 6: 提交更改**
  
  ```bash
  git add src/pages/offer/detail/index.tsx src/pages/offer/detail/index.scss
  git commit -m "feat: complete offer detail actions for buyer and seller roles"
  ```
