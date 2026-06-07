import { View, Text } from '@tarojs/components'
import type { Coupon } from '@/domains/marketing/types'
import './index.scss'

interface CouponCardProps {
  coupon: Coupon
  onUse?: (id: string) => void
}

export default function CouponCard({ coupon, onUse }: CouponCardProps) {
  const isExpired = new Date(coupon.endTime) < new Date()
  const isUsed = coupon.status === 'used'
  const canUse = coupon.status === 'active' && !isExpired

  return (
    <View className={`coupon-card ${coupon.status}`}>
      <View className='coupon-left'>
        <Text className='coupon-value'>
          {coupon.type === '折扣' ? `${coupon.value}折` : `¥${coupon.value}`}
        </Text>
        <Text className='coupon-condition'>
          {coupon.minSpend > 0 ? `满${coupon.minSpend}可用` : '无门槛'}
        </Text>
      </View>

      <View className='coupon-right'>
        <Text className='coupon-title'>{coupon.title}</Text>
        <Text className='coupon-time'>
          {coupon.startTime} - {coupon.endTime}
        </Text>

        {canUse && (
          <View className='use-btn' onClick={() => onUse?.(coupon.id)}>
            <Text className='use-text'>立即使用</Text>
          </View>
        )}

        {isUsed && (
          <Text className='status-text used'>已使用</Text>
        )}

        {isExpired && (
          <Text className='status-text expired'>已过期</Text>
        )}
      </View>
    </View>
  )
}
