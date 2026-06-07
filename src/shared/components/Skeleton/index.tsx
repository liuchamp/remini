import { View } from '@tarojs/components'
import './index.scss'

interface Props {
  type?: 'card' | 'list' | 'detail'
  rows?: number
  avatar?: boolean
}

export function Skeleton({ type = 'list', rows = 5, avatar = false }: Props) {
  const rowHeights = type === 'detail' ? 32 : 24
  const rowGap = 16
  const baseHeight = type === 'card' ? 120 : type === 'detail' ? 200 : 88

  return (
    <View className={`skeleton skeleton-${type}`}>
      {avatar && <View className='skeleton-avatar' />}
      {Array.from({ length: rows }).map((_, i) => (
        <View 
          key={i} 
          className='skeleton-row' 
          style={{ 
            height: `${rowHeights}px`,
            width: i === rows - 1 ? '60%' : '100%',
            marginBottom: i < rows - 1 ? `${rowGap}px` : '0'
          }}
        />
      ))}
      <View className='skeleton-base' style={{ height: `${baseHeight}px` }} />
    </View>
  )
}

export default Skeleton
