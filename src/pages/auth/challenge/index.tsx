import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { resolvePendingRequest, rejectPendingRequest, getPendingRequest } from '@/shared/api/request'
import { http } from '@/shared/api/request'
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
      const res = await http.post('/auth/challenge/verify', { code })
      if (res.code === 0) {
        Taro.showToast({ title: '验证成功', icon: 'success' })

        // 获取刚才被拦截的请求配置并重放
        const pending = getPendingRequest()
        if (pending) {
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
