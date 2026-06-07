import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  images: string[]
  isNegotiable?: boolean
  distance?: number
  seller?: { name: string; avatar: string }
}

interface ProductCardProps {
  product: Product
  onClick?: (id: string) => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(product.id)
    } else {
      Taro.navigateTo({ url: `/pages/product/detail/index?id=${product.id}` })
    }
  }

  return (
    <View className='product-card' onClick={handleClick}>
      <Image
        className='product-card-image'
        src={product.images?.[0] || ''}
        mode='aspectFill'
        lazyLoad
      />
      <View className='product-card-info'>
        <Text className='product-card-title'>{product.title}</Text>
        <View className='product-card-price-row'>
          <Text className='product-card-price'>¥{product.price}</Text>
          {product.isNegotiable && (
            <Text className='product-card-tag'>可议价</Text>
          )}
        </View>
        {product.distance != null && (
          <Text className='product-card-distance'>
            {product.distance < 1
              ? `${Math.round(product.distance * 1000)}m`
              : `${product.distance.toFixed(1)}km`}
          </Text>
        )}
      </View>
    </View>
  )
}