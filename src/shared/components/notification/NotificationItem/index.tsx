import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Notification } from '@/domains/notification/types'
import './index.scss'

interface NotificationItemProps {
  notification: Notification
  onRead?: (id: string) => void
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onRead?.(notification.id)
    }

    Taro.navigateTo({ url: `/pages/notification/detail/index?id=${notification.id}` })
  }

  return (
    <View className={`notification-item ${notification.isRead ? 'read' : ''}`} onClick={handleClick}>
      {!notification.isRead && <View className='unread-dot' />}

      <View className='notification-content'>
        <Text className='notification-title'>{notification.title}</Text>
        <Text className='notification-text'>{notification.content}</Text>
        <Text className='notification-time'>{notification.createdAt}</Text>
      </View>
    </View>
  )
}
