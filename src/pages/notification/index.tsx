import { useEffect, useCallback, useRef } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useDidHide, usePullDownRefresh } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '@/domains/notification/store'
import type { Notification } from '@/domains/notification/types'
import './index.scss'

const TYPE_ICON_MAP: Record<string, string> = {
  system: '\u{1F514}',
  transaction: '\u{1F4B0}',
  marketing: '\u{1F389}'
}

const POLL_INTERVAL = 30000

export default function Notification() {
  const { t } = useTranslation(['notification', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { notifications, unreadCount, loading, loadNotifications, markAsRead, markAllAsRead, loadUnreadCount } =
    useNotificationStore()
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPolling = useCallback(() => {
    stopPolling()
    pollTimerRef.current = setInterval(() => {
      loadUnreadCount()
    }, POLL_INTERVAL)
  }, [loadUnreadCount])

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  useDidShow(() => {
    loadNotifications('system')
    loadUnreadCount()
    startPolling()
  })

  useDidHide(() => {
    stopPolling()
  })

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  usePullDownRefresh(() => {
    loadNotifications('system').finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  const handleItemClick = useCallback(
    async (item: Notification) => {
      if (!item.isRead) {
        await markAsRead(item.id)
      }
      if (item.link) {
        Taro.navigateTo({ url: item.link })
      }
    },
    [markAsRead]
  )

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead()
    Taro.showToast({ title: '已全部标为已读', icon: 'success' })
  }, [markAllAsRead])

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const groupByType = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = {}
    items.forEach((item) => {
      if (!groups[item.type]) groups[item.type] = []
      groups[item.type].push(item)
    })
    return groups
  }

  const groupTitle = (type: string) => {
    switch (type) {
      case 'system': return '系统通知'
      case 'transaction': return '交易通知'
      case 'marketing': return '营销活动'
      default: return '其他'
    }
  }

  const groups = groupByType(notifications)

  return (
    <View className='notification-page'>
      <View className='notification-header'>
        <Text className='header-title'>消息中心</Text>
        {unreadCount > 0 && (
          <View className='mark-all-btn' onClick={handleMarkAllRead}>
            <Text className='mark-all-text'>全部已读</Text>
          </View>
        )}
      </View>

      <ScrollView
        className='notification-list'
        scrollY
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={() => {
          loadNotifications('system').finally(() => {
            Taro.stopPullDownRefresh()
          })
        }}
      >
        {notifications.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📭</Text>
            <Text className='empty-text'>暂无消息</Text>
          </View>
        ) : (
          Object.entries(groups).map(([type, items]) => (
            <View key={type} className='notification-group'>
              <View className='group-header'>
                <Text className='group-title'>{groupTitle(type)}</Text>
              </View>
              {items.map((item) => (
                <View
                  key={item.id}
                  className={`notification-item ${item.isRead ? '' : 'unread'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <View className={`item-icon icon-${type}`}>
                    <Text className='icon-text'>{TYPE_ICON_MAP[type] || '📌'}</Text>
                  </View>
                  <View className='item-body'>
                    <View className='item-top'>
                      <Text className='item-title'>{item.title}</Text>
                      <Text className='item-time'>{formatTime(item.createdAt)}</Text>
                    </View>
                    <Text className='item-preview' numberOfLines={2}>
                      {item.content}
                    </Text>
                  </View>
                  {!item.isRead && <View className='unread-dot' />}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
