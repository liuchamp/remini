import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useUnload } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '@/domains/notification/store'
import NotificationItem from '@/shared/components/notification/NotificationItem'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TABS = [
  { key: 'system', label: '系统' },
  { key: 'transaction', label: '交易' },
  { key: 'marketing', label: '营销' },
]

export default function Notification() {
  const { t } = useTranslation(['notification', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const {
    notifications,
    activeTab,
    unreadCount,
    loading,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling
  } = useNotificationStore()

  useLoad(() => {
    loadNotifications('system')
    loadUnreadCount()
    startPolling()
  })

  useUnload(() => {
    stopPolling()
  })

  const handleTabChange = (tab: string) => {
    loadNotifications(tab)
  }

  const handleRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleReadAll = async () => {
    await markAllAsRead()
    Taro.showToast({
      title: '全部已读',
      icon: 'success'
    })
  }

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  return (
    <ErrorBoundary>
      <View className='notification-page'>
        <View className='header'>
          <Text className='title'>通知中心</Text>
          <View className='header-actions'>
            {unreadCount > 0 && (
              <Text className='read-all' onClick={handleReadAll}>
                全部已读 ({unreadCount})
              </Text>
            )}
            <Text
              className='settings-link'
              onClick={() => Taro.navigateTo({ url: '/pages/notification/settings/index' })}
            >
              设置
            </Text>
          </View>
        </View>

        <View className='tab-bar'>
          {TABS.map((tab) => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <Text className='tab-label'>{tab.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView scrollY className='notification-scroll'>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleRead}
              />
            ))
          ) : (
            <Empty text='暂无通知' />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
