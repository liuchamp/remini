import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/domains/auth/api'
import { useAuthStore } from '@/domains/auth/store'
import { useCountDown } from '@/shared/hooks/useCountDown'
import { isPhone } from '@/shared/utils/validate'
import { PlatformAPI } from '@/shared/utils/platform'
import './index.scss'

export default function Login() {
  const { t } = useTranslation('auth')
  const { setAuth } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [wechatLoading, setWechatLoading] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const { seconds, isRunning, start } = useCountDown()

  const handleWechatLogin = async () => {
    setWechatLoading(true)
    try {
      const { code: wxCode } = await PlatformAPI.login()
      const res = await authApi.code2session('weapp', wxCode)
      if (res.code === 0) {
        setAuth(res.data.user, res.data.token, res.data.refreshToken)
        Taro.showToast({ title: t('login.loginSuccess'), icon: 'success' })
        Taro.switchTab({ url: '/pages/index/index' })
      }
    } catch {
      /* handled by HttpClient interceptors */
    } finally {
      setWechatLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (!isPhone(phone)) {
      Taro.showToast({ title: t('login.phoneError'), icon: 'none' })
      return
    }
    setSendCodeLoading(true)
    try {
      const res = await authApi.sendCode(phone)
      if (res.code === 0) {
        Taro.showToast({ title: t('login.codeSent'), icon: 'success' })
        start(60)
      }
    } catch {
      /* handled by HttpClient interceptors */
    } finally {
      setSendCodeLoading(false)
    }
  }

  const handlePhoneLogin = async () => {
    if (!isPhone(phone)) {
      Taro.showToast({ title: t('login.phoneError'), icon: 'none' })
      return
    }
    if (!code || code.length < 4) {
      Taro.showToast({ title: t('login.codeError'), icon: 'none' })
      return
    }
    setPhoneLoading(true)
    try {
      const res = await authApi.loginByPhone(phone, code)
      if (res.code === 0) {
        setAuth(res.data.user, res.data.token, res.data.refreshToken)
        Taro.showToast({ title: t('login.loginSuccess'), icon: 'success' })
        Taro.switchTab({ url: '/pages/index/index' })
      }
    } catch {
      /* handled by HttpClient interceptors */
    } finally {
      setPhoneLoading(false)
    }
  }

  const goRegister = () => {
    Taro.navigateTo({ url: '/pages/auth/register/index' })
  }

  const canSubmit = phone.length > 0 && code.length > 0

  return (
    <View className='login-page'>
      <View className='logo-section'>
        <Text className='logo-icon'>R</Text>
        <Text className='title'>{t('login.title')}</Text>
      </View>

      <Button
        className='wechat-login-btn'
        onClick={handleWechatLogin}
        loading={wechatLoading}
        disabled={wechatLoading}
      >
        微信{t('login.wechatLogin')}
      </Button>

      <View className='divider'>
        <Text className='divider-text'>或</Text>
      </View>

      <View className='input-group'>
        <Text className='country-code'>+86</Text>
        <Input
          className='phone-input'
          type='number'
          maxlength={11}
          placeholder={t('login.phonePlaceholder')}
          value={phone}
          onInput={(e) => setPhone(e.detail.value)}
        />
      </View>

      <View className='input-group code-group'>
        <Input
          className='code-input'
          type='number'
          maxlength={6}
          placeholder={t('login.codePlaceholder')}
          value={code}
          onInput={(e) => setCode(e.detail.value)}
        />
        <Button
          className='send-code-btn'
          onClick={handleSendCode}
          disabled={isRunning || sendCodeLoading}
          loading={sendCodeLoading}
        >
          {isRunning
            ? t('login.countdown', { seconds })
            : t('login.getCode')}
        </Button>
      </View>

      <Button
        className='login-btn'
        onClick={handlePhoneLogin}
        loading={phoneLoading}
        disabled={!canSubmit || phoneLoading}
      >
        {t('login.loginBtn')}
      </Button>

      <View className='agreement'>
        <Text className='agreement-text'>{t('login.agreeTerms')}</Text>
        <Text className='agreement-link'>{t('login.termsOfService')}</Text>
        <Text className='agreement-text'>{t('login.and')}</Text>
        <Text className='agreement-link'>{t('login.privacyPolicy')}</Text>
      </View>

      <View className='register-link'>
        <Text className='register-text'>{t('login.noAccount')}</Text>
        <Text className='register-btn' onClick={goRegister}>
          {t('login.goRegister')}
        </Text>
      </View>
    </View>
  )
}
