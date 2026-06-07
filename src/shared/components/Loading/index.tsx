import { View } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  type?: 'spinner' | 'skeleton'
  rows?: number
}

export default function Loading({ type = 'spinner', rows = 3 }: LoadingProps) {
  if (type === 'skeleton') {
    return (
      <View className='skeleton'>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} className='skeleton-row'>
            <View className='skeleton-avatar' />
            <View className='skeleton-content'>
              <View className='skeleton-title' />
              <View className='skeleton-text' />
            </View>
          </View>
        ))}
      </View>
    )
  }

  return (
    <View className='loading-spinner'>
      <View className='spinner' />
    </View>
  )
}
