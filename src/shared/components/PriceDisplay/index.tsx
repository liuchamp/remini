import { View, Text } from '@tarojs/components'
import './index.scss'

interface PriceDisplayProps {
  price: number
  originalPrice?: number
  size?: 'small' | 'medium' | 'large'
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? price.toString() : price.toFixed(2)
}

export default function PriceDisplay({ price, originalPrice, size = 'medium' }: PriceDisplayProps) {
  return (
    <View className={`price-display price-${size}`}>
      <Text className='price-symbol'>¥</Text>
      <Text className='price-value'>{formatPrice(price)}</Text>
      {originalPrice && originalPrice > price && (
        <Text className='price-original'>¥{formatPrice(originalPrice)}</Text>
      )}
    </View>
  )
}
