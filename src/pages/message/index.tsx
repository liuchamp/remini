import { useEffect, useCallback, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/domains/chat/store'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Empty from '@/shared/components/Empty'
import { BackTop } from '@/shared/components/BackTop'
import './index.scss'

export default function Message() {
  const { threads, unreadTotal, loadThreads } = useChatStore()
  const { t } = useTranslation('chat')
  const { unreadCount: notifUnread, loadUnreadCount } = useNotificationStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      await loadThreads()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [loadThreads])

  useDidShow(() => {
    refresh()
    loadUnreadCount()
  })

  useEffect(() => {
    const total = unreadTotal + notifUnread
    if (total > 0) {
      Taro.setTabBarBadge({ index: 3, text: String(Math.min(total, 99)) })
    } else {
      Taro.removeTabBarBadge({ index: 3 })
    }
  }, [unreadTotal, notifUnread])

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
      {loading && threads.length === 0 ? (
        <Skeleton variant='list' count={5} />
      ) : error ? (
        <RetryButton onRetry={refresh} />
      ) : threads.length === 0 ? (
        <View className='empty-state'>
          <Text>{t('noMessages')}</Text>
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
                lazyLoad
              />
              <View className='thread-info'>
                <View className='thread-top'>
                  <View className='thread-name-row'>
                    <Text className='thread-name'>{thread.participant.username}</Text>
                    {thread.isBlocked && (
                      <View className='blocked-badge'>
                        <Text className='blocked-badge-text'>{t('blocked')}</Text>
                      </View>
                    )}
                  </View>
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
      <BackTop threshold={300} />
    </View>
  )
}
