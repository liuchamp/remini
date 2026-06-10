import { View, Text } from '@tarojs/components'
import './index.scss'

export interface EmptyProps {
  variant?: 'no-data' | 'no-orders' | 'no-favorites' | 'no-results' | 'no-chat' | 'no-posts'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultConfig = {
  'no-data': {
    icon: '📭',
    title: '暂无数据',
    description: '这里什么都没有',
  },
  'no-orders': {
    icon: '📦',
    title: '暂无订单',
    description: '快去发现心仪的商品吧',
  },
  'no-favorites': {
    icon: '⭐',
    title: '暂无收藏',
    description: '收藏喜欢的商品，方便随时查看',
  },
  'no-results': {
    icon: '🔍',
    title: '未找到结果',
    description: '换个关键词试试',
  },
  'no-chat': {
    icon: '💬',
    title: '暂无消息',
    description: '去社区看看大家在聊什么',
  },
  'no-posts': {
    icon: '📝',
    title: '暂无动态',
    description: '分享你的第一篇动态吧',
  },
}

export function Empty({
  variant = 'no-data',
  title,
  description,
  action,
  className = ''
}: EmptyProps) {
  const config = defaultConfig[variant]

  return (
    <View className={`empty ${className}`}>
      <Text className='empty-icon'>{config.icon}</Text>
      <Text className='empty-title'>{title || config.title}</Text>
      <Text className='empty-description'>{description || config.description}</Text>
      {action && (
        <View className='empty-action' onClick={action.onClick}>
          <Text className='empty-action-text'>{action.label}</Text>
        </View>
      )}
    </View>
  )
}

export default Empty
