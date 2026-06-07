import { View, Text } from '@tarojs/components'
import './index.scss'

interface CreatorBadgeProps {
  tier?: 'bronze' | 'silver' | 'gold'
  label?: string
}

export default function CreatorBadge({ tier = 'bronze', label }: CreatorBadgeProps) {
  const tierColors = {
    bronze: 'linear-gradient(135deg, #CD7F32, #B8860B)',
    silver: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
    gold: 'linear-gradient(135deg, #FFD700, #FFA500)'
  }

  return (
    <View className='creator-badge' style={{ background: tierColors[tier] }}>
      <Text className='badge-text'>⭐ {label || '创作者'}</Text>
    </View>
  )
}