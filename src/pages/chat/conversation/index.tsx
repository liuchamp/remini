import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/domains/chat/store'
import { chatApi } from '@/domains/chat/api'
import { useAuthStore } from '@/domains/auth/store'
import { Breadcrumb } from '@/shared/components/Breadcrumb'
import './index.scss'

export default function Conversation() {
  const router = useRouter()
  const { threadId, userId } = router.params
  const { messages, loading, blocking, loadMessages, sendMessage, blockUser, unblockUser, threads, sendReadReceipt } = useChatStore()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<any>(null)
  const { t } = useTranslation('chat')

  const isBlocked = useMemo(() => {
    const thread = threads.find(t => t.id === threadId)
    return thread?.isBlocked ?? false
  }, [threads, threadId])

  useEffect(() => {
    if (!threadId) return
    loadMessages(threadId)
    chatApi.markRead(threadId)
  }, [threadId])

  useEffect(() => {
    if (!threadId || !currentUserId || messages.length === 0) return
    const unreadIds = messages
      .filter((m) => m.senderId !== currentUserId && !m.isRead)
      .map((m) => m.id)
    if (unreadIds.length > 0) {
      sendReadReceipt(threadId, unreadIds)
    }
  }, [messages, threadId, currentUserId, sendReadReceipt])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!content || !threadId) return
    sendMessage(threadId, content)
    setInputValue('')

    setTimeout(() => {
      scrollRef.current?.scrollToIndex?.(messages.length)
    }, 100)
  }

  const handleInput = (e: any) => {
    setInputValue(e.detail.value)
  }

  const handleBlockUser = useCallback(() => {
    if (!userId) return
    const action = isBlocked ? 'unblock' : 'block'
    const title = action === 'block' ? t('blockUser') : t('unblockUser')
    const content = action === 'block' ? t('blockConfirmDesc') : t('unblockConfirmDesc')

    Taro.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          if (action === 'block') {
            blockUser(userId).then(() => {
              Taro.showToast({ title: t('blocked'), icon: 'none' })
            })
          } else {
            unblockUser(userId).then(() => {
              Taro.showToast({ title: t('unblockUser'), icon: 'none' })
            })
          }
        }
      }
    })
  }, [userId, isBlocked, blockUser, unblockUser, t])

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    if (isToday) return `${hh}:${mm}`
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${hh}:${mm}`
  }

  const formatReadTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  const formatDateSeparator = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const todayStr = now.toDateString()
    const dateStr = date.toDateString()
    if (dateStr === todayStr) return t('today')
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (dateStr === yesterday.toDateString()) return t('yesterday')
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const messageGroups = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = []
    let currentDate = ''
    for (const msg of messages) {
      const msgDate = new Date(msg.createdAt).toDateString()
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msg.createdAt, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    }
    return groups
  }, [messages])

  return (
    <View>
      <Breadcrumb items={[
        { label: '消息', path: '/pages/message/index' },
        { label: '聊天' }
      ]} />
      <View className='conversation-page'>
      {isBlocked && (
        <View className='blocked-banner'>
          <Text className='blocked-text'>{t('blockedBanner')}</Text>
          <Text className='blocked-undo' onClick={handleBlockUser}>{t('blockedUndo')}</Text>
        </View>
      )}

      <View className='chat-header'>
        <Text className='header-action' onClick={handleBlockUser}>
          {isBlocked ? t('unblockUser') : t('blockUser')}
        </Text>
      </View>

      <ScrollView
        className='message-list'
        scrollY
        scrollWithAnimation
        ref={scrollRef}
      >
        {loading && messages.length === 0 ? (
          <View className='loading-state'>
            <Text>{t('loading', { ns: 'common' })}</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className='empty-state'>
            <Text>{t('noMessages')}</Text>
          </View>
        ) : (
          messageGroups.map((group) => (
            <View key={group.date}>
              <View className='date-separator'>
                <Text className='date-text'>{formatDateSeparator(group.date)}</Text>
              </View>
              {group.messages.map((msg) => {
                const isSelf = msg.senderId === currentUserId
                return (
                  <View
                    key={msg.id}
                    className={`message-item ${isSelf ? 'self' : 'other'}`}
                  >
                    <View className='message-bubble'>
                      {msg.type === 'product' && msg.product ? (
                        <View
                          className='product-card'
                          onClick={() => Taro.navigateTo({ url: `/pages/product/detail/index?id=${msg.product!.id}` })}
                        >
                          <Image src={msg.product.image || ''} className='product-card-image' mode='aspectFill' />
                          <View className='product-card-info'>
                            <Text className='product-card-title'>{msg.product.title || ''}</Text>
                            <Text className='product-card-price'>¥{msg.product.price || 0}</Text>
                          </View>
                        </View>
                      ) : msg.type === 'order' && msg.order ? (
                        <View
                          className='order-card'
                          onClick={() => Taro.navigateTo({ url: `/pages/order/detail/index?id=${msg.order!.id}` })}
                        >
                          <Text className='order-card-no'>{msg.order.orderNo || ''}</Text>
                          <Text className='order-card-status'>{msg.order.status || ''}</Text>
                        </View>
                      ) : (
                        <Text className='message-content'>{msg.content}</Text>
                      )}
                    </View>
                    <View className='message-meta'>
                      <Text className='message-time'>{formatTime(msg.createdAt)}</Text>
                      {isSelf && msg.isRead && (
                        <Text className='message-read-status'>
                          {t('readTime')}{msg.readAt ? ` ${formatReadTime(msg.readAt)}` : ''}
                        </Text>
                      )}
                      {isSelf && !msg.isRead && (
                        <Text className='message-sent-status'>{t('unread')}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          ))
        )}
      </ScrollView>

      <View className='action-bar'>
        <Text
          className='action-button'
          onClick={() => Taro.showToast({ title: t('common:app.comingSoon'), icon: 'none' })}
        >
          {t('action.sendProduct')}
        </Text>
        <Text
          className='action-button'
          onClick={() => Taro.showToast({ title: t('common:app.comingSoon'), icon: 'none' })}
        >
          {t('action.sendOrder')}
        </Text>
      </View>

      <View className='input-bar'>
        <Input
          className='message-input'
          type='text'
          placeholder={t('inputPlaceholder')}
          value={inputValue}
          onInput={handleInput}
          confirmType='send'
          onConfirm={handleSend}
          disabled={isBlocked}
        />
        <Button
          className='send-button'
          onClick={handleSend}
          disabled={!inputValue.trim() || isBlocked || blocking}
        >
          {t('send')}
        </Button>
      </View>
    </View>
    </View>
  )
}
