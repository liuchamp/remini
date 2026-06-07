import { View, Text, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/domains/auth/store'
import { changeLanguage, getCurrentLanguage } from '@/shared/i18n'
import { isAlipay } from '@/shared/utils/platform'
import './index.scss'

export default function SettingsIndex() {
  const { isLoggedIn, logout } = useAuthStore()
  const [langChecked, setLangChecked] = useState(getCurrentLanguage() === 'en-US')
  const { t } = useTranslation('profile')

  useLoad(() => {
    console.log('settings/index loaded')
  })

  useEffect(() => {
    const current = getCurrentLanguage()
    setLangChecked(current === 'en-US')
  }, [])

  const handleLangChange = (e: any) => {
    const isEn = e.detail.value
    setLangChecked(isEn)
    changeLanguage(isEn ? 'en-US' : 'zh-CN')
    Taro.showToast({ title: isEn ? 'Switched to English' : '已切换为中文', icon: 'success' })
  }

  const handlePrivacy = () => {
    Taro.showModal({
      title: '隐私政策',
      content: 'RE Marketplace 尊重并保护您的隐私。我们仅收集必要的个人信息用于提供交易服务。详细隐私政策请查看官方网站。',
      showCancel: false
    })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: t('logout'),
      content: t('logoutConfirm'),
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.showToast({ title: t('logoutConfirm'), icon: 'success' })
        }
      }
    })
  }

  return (
    <View className='settings-page'>
      <View className='settings-section'>
        <View className='section-header'>
          <Text className='section-title'>偏好设置</Text>
        </View>
        <View className='settings-row'>
          <View className='row-left'>
            <Text className='row-icon'>🌐</Text>
            <View className='row-info'>
              <Text className='row-label'>语言 / Language</Text>
              <Text className='row-desc'>当前：{langChecked ? 'English' : '简体中文'}</Text>
            </View>
          </View>
          {!isAlipay && (
            <Switch
              className='lang-switch'
              checked={langChecked}
              onChange={handleLangChange}
              color='#FF6B35'
            />
          )}
          {isAlipay && (
            <Text className='row-value'>简体中文</Text>
          )}
        </View>
      </View>

      <View className='settings-section'>
        <View className='section-header'>
          <Text className='section-title'>关于</Text>
        </View>
        <View className='settings-row' onClick={handlePrivacy}>
          <View className='row-left'>
            <Text className='row-icon'>🔒</Text>
            <Text className='row-label'>{t('privacyPolicy')}</Text>
          </View>
          <Text className='row-arrow'>›</Text>
        </View>
        <View className='settings-row'>
          <View className='row-left'>
            <Text className='row-icon'>📱</Text>
            <Text className='row-label'>应用版本</Text>
          </View>
          <Text className='row-value'>v1.0.0</Text>
        </View>
      </View>

      {isLoggedIn && (
        <View className='logout-section'>
          <View className='logout-btn' onClick={handleLogout}>
            <Text>{t('logout')}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
