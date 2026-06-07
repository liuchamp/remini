import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { kycApi } from '@/domains/kyc/api'
import { useAuthStore } from '@/domains/auth/store'
import { useCountDown } from '@/shared/hooks/useCountDown'
import { isPhone } from '@/shared/utils/validate'
import { PlatformAPI } from '@/shared/utils/platform'
import './index.scss'

export default function Phone() {
  const { t } = useTranslation('kyc')
  const { user, updateUser } = useAuthStore()

  const [phone, setPhone] = useState(user?.phone || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { seconds, isRunning, start } = useCountDown()

  const handleSendCode = async () => {
    if (!isPhone(phone)) {
      Taro.showToast({ title: t('phoneError'), icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await kycApi.sendPhoneCode(phone)
      if (res.code === 0) {
        Taro.showToast({ title: t('codeSent'), icon: 'success' })
        start(60)
      }
    } catch {
      /* handled by interceptors */
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      Taro.showToast({ title: t('codeError'), icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await kycApi.verifyPhone(phone, code)
      if (res.code === 0) {
        Taro.showToast({ title: t('verifySuccess'), icon: 'success' })
        updateUser({ currentKycTier: 'L1', phoneVerified: true })
        Taro.navigateBack()
      }
    } catch {
      /* handled by interceptors */
    } finally {
      setLoading(false)
    }
  }

  const canVerify = code.length >= 4

  return (
    <View className='kyc-phone-page'>
      <View className='page-header'>
        <Text className='page-title'>{t('phoneVerify')}</Text>
        <Text className='page-desc'>{t('phoneVerifyDesc')}</Text>
      </View>

      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>{t('phoneNumber')}</Text>
          <View className='phone-display'>
            <Text className='phone-text'>{phone || t('notBound')}</Text>
            {phone && (
              <Text className='change-phone'>{t('changePhone')}</Text>
            )}
          </View>
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('verificationCode')}</Text>
          <View className='code-input-group'>
            <Input
              className='code-input'
              type='number'
              maxlength={6}
              placeholder={t('codePlaceholder')}
              value={code}
              onInput={(e) => setCode(e.detail.value)}
            />
            <Button
              className='send-code-btn'
              onClick={handleSendCode}
              disabled={isRunning || loading}
              loading={loading}
            >
              {isRunning ? t('countdown', { seconds }) : t('getCode')}
            </Button>
          </View>
        </View>
      </View>

      <View className='verify-btn-wrapper'>
        <Button
          className='verify-btn'
          onClick={handleVerify}
          loading={loading}
          disabled={!canVerify || loading}
        >
          {t('verify')}
        </Button>
      </View>

      <View className='tips'>
        <Text className='tip-item'>
          <Text className='tip-icon'>💡</Text>
          <Text>{t('tip1')}</Text>
        </Text>
        <Text className='tip-item'>
          <Text className='tip-icon'>💡</Text>
          <Text>{t('tip2')}</Text>
        </Text>
      </View>
    </View>
  )
}