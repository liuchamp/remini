import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { notificationApi } from '@/domains/notification/api'
import { useNotificationStore } from '@/domains/notification/store'
import type { Notification } from '@/domains/notification/types'
import './index.scss'

export default function NotificationDetail() {
  const router = useRouter()
  const { t } = useTranslation(['notification', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { markAsRead } = useNotificationStore()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)

  const id = router.params.id

  useEffect(() => {
    if (!id) return

    const loadDetail = async () => {
      setLoading(true)
      try {
        const res = await notificationApi.getDetail(id)
        if (res.code === 0 && res.data) {
          const data = res.data as Notification
          setNotification(data)

          if (!data.isRead) {
            await markAsRead(data.id)
            setNotification({ ...data, isRead: true })
          }
        }
      } catch (error) {
        console.error('Failed to load notification detail:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [id, markAsRead])

  const handleViewLink = () => {
    if (notification?.link) {
      Taro.navigateTo({ url: notification.link })
    }
  }

  if (loading) {
    return (
      <View className='notification-detail'>
        <View className='loading-container'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!notification) {
    return (
      <View className='notification-detail'>
        <View className='empty-container'>
          <Text className='empty-text'>通知不存在</Text>
        </View>
      </View>
    )
  }

  const typeLabel = (() => {
    switch (notification.type) {
      case 'system': return '系统通知'
      case 'transaction': return '交易通知'
      case 'marketing': return '营销通知'
      case 'interaction': return '互动通知'
      default: return '通知'
    }
  })()

  return (
    <View className='notification-detail'>
      <View className='detail-card'>
        <View className='detail-type-badge'>
          <Text className='detail-type-text'>{typeLabel}</Text>
        </View>

        <Text className='detail-title'>{notification.title}</Text>

        <Text className='detail-content'>{notification.content}</Text>

        <Text className='detail-time'>{notification.createdAt}</Text>
      </View>

      {notification.link && (
        <View className='detail-action'>
          <Button className='view-link-btn' type='primary' onClick={handleViewLink}>
            查看详情
          </Button>
        </View>
      )}
    </View>
  )
}
