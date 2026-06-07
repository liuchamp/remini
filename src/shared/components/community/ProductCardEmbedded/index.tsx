import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Product {
  id: string
  title: string
  price: number
  images: string[]
}

interface ProductCardEmbeddedProps {
  product: Product
}

export default function ProductCardEmbedded({ product }: ProductCardEmbeddedProps) {
  const handleClick = (e: any) => {
    e.stopPropagation()
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${product.id}` })
  }

  return (
    <View className='product-embedded' onClick={handleClick}>
      <Image
        className='product-embedded-image'
        src={product.images?.[0] || ''}
        mode='aspectFill'
        lazyLoad
      />
      <View className='product-embedded-info'>
        <Text className='product-embedded-title'>{product.title}</Text>
        <Text className='product-embedded-price'>¥{product.price}</Text>
      </View>
    </View>
  )
}