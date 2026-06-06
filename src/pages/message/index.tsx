import { useEffect, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useChatStore } from '@/domains/chat/store'
import './index.scss'

export default function Message() {
  const { threads, unreadTotal, loadThreads } = useChatStore()

  useDidShow(() => {
    loadThreads()
  })

  useEffect(() => {
    if (unreadTotal > 0) {
      Taro.setTabBarBadge({ index: 3, text: String(Math.min(unreadTotal, 99)) })
    } else {
      Taro.removeTabBarBadge({ index: 3 })
    }
  }, [unreadTotal])

  const handleThreadClick = useCallback((thread: ChatThread) => {
    Taro.navigateTo({
      url: `/pages/chat/conversation/index?threadId=${thread.id}&userId=${thread.participant.id}`
    })
  }, [])

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

  return (
    <View className='message-page'>
      {threads.length === 0 ? (
        <View className='empty-state'>
          <Text>暂无消息</Text>
        </View>
      ) : (
        <View className='thread-list'>
          {threads.map((thread) => (
            <View
              key={thread.id}
              className='thread-item'
              onClick={() => handleThreadClick(thread)}
            >
              <Image
                className='thread-avatar'
                src={thread.participant.avatar}
                mode='aspectFill'
              />
              <View className='thread-info'>
                <View className='thread-top'>
                  <Text className='thread-name'>{thread.participant.username}</Text>
                  <Text className='thread-time'>{formatTime(thread.lastMessageAt)}</Text>
                </View>
                <View className='thread-bottom'>
                  <Text className='thread-preview' numberOfLines={1}>
                    {thread.lastMessage}
                  </Text>
                  {thread.unreadCount > 0 && (
                    <View className='unread-badge'>
                      <Text className='unread-count'>
                        {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
