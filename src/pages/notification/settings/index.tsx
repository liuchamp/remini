import { useState, useEffect, useCallback } from 'react'
import { View, Text, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { notificationApi } from '@/domains/notification/api'
import type { NotificationPreference } from '@/domains/notification/types'
import './index.scss'

type PreferenceKey = keyof NotificationPreference

const SETTING_ITEMS: {
  key: PreferenceKey
  labelKey: string
  descKey: string
}[] = [
  { key: 'system', labelKey: 'settings.system', descKey: 'settings.systemDesc' },
  { key: 'transaction', labelKey: 'settings.transaction', descKey: 'settings.transactionDesc' },
  { key: 'marketing', labelKey: 'settings.marketing', descKey: 'settings.marketingDesc' },
  { key: 'interaction', labelKey: 'settings.interaction', descKey: 'settings.interactionDesc' },
]

export default function NotificationSettings() {
  const { t } = useTranslation(['notification', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await notificationApi.getPreferences()
        if (res.code === 0) {
          setPreferences(res.data as NotificationPreference)
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = useCallback(
    async (key: PreferenceKey, value: boolean) => {
      if (!preferences) return

      const previous = preferences[key]
      const updated = { ...preferences, [key]: value }

      // Optimistic update
      setPreferences(updated)

      try {
        await notificationApi.updatePreferences(updated)
      } catch {
        // Rollback on failure
        setPreferences({ ...updated, [key]: previous })
        Taro.showToast({ title: '更新失败，请重试', icon: 'none' })
      }
    },
    [preferences]
  )

  if (loading || !preferences) {
    return (
      <View className='notification-settings'>
        <View className='loading-container'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='notification-settings'>
      <View className='settings-list'>
        {SETTING_ITEMS.map((item) => (
          <View key={item.key} className='settings-item'>
            <View className='settings-info'>
              <Text className='settings-label'>{t(item.labelKey)}</Text>
              <Text className='settings-desc'>{t(item.descKey)}</Text>
            </View>
            <Switch
              checked={preferences[item.key]}
              color='#ff6b35'
              onChange={(e) => handleToggle(item.key, e.detail.value)}
            />
          </View>
        ))}
      </View>
    </View>
  )
}
