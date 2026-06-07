import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/shared/components/i18n/LanguageSwitcher'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

export default function Settings() {
  const { t } = useTranslation(['common'])
  const [cacheSize, setCacheSize] = useState('0 KB')
  const [appVersion] = useState('v1.0.0')
  const { logout } = useAuthStore()

  useEffect(() => {
    calculateCacheSize()
  }, [])

  const calculateCacheSize = async () => {
    try {
      const res = await Taro.getStorageInfo()
      const sizeKB = Math.round((res as any).currentSize / 1024 * 10) / 10
      setCacheSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`)
    } catch {
      setCacheSize('0 KB')
    }
  }

  const handleClearCache = async () => {
    const res = await Taro.showModal({
      title: t('common:action.confirm'),
      content: `确定清理 ${cacheSize} 缓存？`
    })
    if (!res.confirm) return

    const token = Taro.getStorageSync('token')
    const locale = Taro.getStorageSync('@remx/locale')
    Taro.clearStorageSync()
    if (token) Taro.setStorageSync('token', token)
    if (locale) Taro.setStorageSync('@remx/locale', locale)
    Taro.showToast({ title: '清理成功', icon: 'success' })
    await calculateCacheSize()
  }

  const handleLogout = async () => {
    const res = await Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？'
    })
    if (!res.confirm) return
    logout()
    Taro.reLaunch({ url: '/pages/auth/login/index' })
  }

  const goPrivacy = () => Taro.navigateTo({ url: '/pages/static/webview/index?url=https://example.com/privacy' })
  const goTerms = () => Taro.navigateTo({ url: '/pages/static/webview/index?url=https://example.com/terms' })
  const checkUpdate = () => Taro.showToast({ title: t('common:app.versionLatest'), icon: 'none' })

  return (
    <View className='settings-page'>
      <View className='section'>
        <View className='section-title'>关于</View>
        <View className='row' onClick={checkUpdate}>
          <Text className='row-label'>当前版本</Text>
          <Text className='row-value'>{appVersion}</Text>
        </View>
        <View className='row' onClick={goPrivacy}>
          <Text className='row-label'>隐私政策</Text>
          <Text className='row-arrow'>›</Text>
        </View>
        <View className='row' onClick={goTerms}>
          <Text className='row-label'>用户协议</Text>
          <Text className='row-arrow'>›</Text>
        </View>
      </View>

      <View className='section'>
        <View className='section-title'>通用</View>
        <View className='row'>
          <Text className='row-label'>语言</Text>
          <LanguageSwitcher type='inline' />
        </View>
        <View className='row' onClick={handleClearCache}>
          <Text className='row-label'>清理缓存</Text>
          <Text className='row-value'>{cacheSize}</Text>
        </View>
      </View>

      <View className='logout-section'>
        <View className='logout-btn' onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>
    </View>
  )
}
