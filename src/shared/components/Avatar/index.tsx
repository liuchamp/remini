import { View, Image, Text } from '@tarojs/components'
import './index.scss'

interface AvatarProps {
  src?: string
  name?: string
  size?: number
}

export default function Avatar({ src, name, size = 80 }: AvatarProps) {
  const initials = name ? name.charAt(0) : '?'
  const colors = ['#FF6B35', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800']
  const bgColor = colors[(name?.charCodeAt(0) || 0) % colors.length]

  if (src) {
    return (
      <Image
        className='avatar'
        src={src}
        style={{ width: `${size}px`, height: `${size}px` }}
        mode='aspectFill'
      />
    )
  }

  return (
    <View
      className='avatar avatar-fallback'
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text className='avatar-initial' style={{ fontSize: `${size * 0.45}px` }}>
        {initials}
      </Text>
    </View>
  )
}
