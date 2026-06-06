import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import { useChatStore } from '@/domains/chat/store'
import { chatApi } from '@/domains/chat/api'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

export default function Conversation() {
  const router = useRouter()
  const { threadId } = router.params
  const { messages, loading, loadMessages, sendMessage } = useChatStore()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<any>(null)

  useEffect(() => {
    if (!threadId) return
    loadMessages(threadId)
    chatApi.markRead(threadId)
  }, [threadId])

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

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    if (isToday) return `${hh}:${mm}`
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${hh}:${mm}`
  }

  const formatDateSeparator = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const todayStr = now.toDateString()
    const dateStr = date.toDateString()
    if (dateStr === todayStr) return '今天'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (dateStr === yesterday.toDateString()) return '昨天'
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
    <View className='conversation-page'>
      <ScrollView
        className='message-list'
        scrollY
        scrollWithAnimation
        ref={scrollRef}
      >
        {loading && messages.length === 0 ? (
          <View className='loading-state'>
            <Text>加载中...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className='empty-state'>
            <Text>暂无消息</Text>
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
                      <Text className='message-content'>{msg.content}</Text>
                    </View>
                    <Text className='message-time'>{formatTime(msg.createdAt)}</Text>
                  </View>
                )
              })}
            </View>
          ))
        )}
      </ScrollView>

      <View className='input-bar'>
        <Input
          className='message-input'
          type='text'
          placeholder='输入消息...'
          value={inputValue}
          onInput={handleInput}
          confirmType='send'
          onConfirm={handleSend}
        />
        <Button
          className='send-button'
          onClick={handleSend}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </View>
    </View>
  )
}
