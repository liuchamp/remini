import { View } from '@tarojs/components'
import ProductCard from '../ProductCard'
import './index.scss'

interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  images: string[]
  isNegotiable?: boolean
  distance?: number
}

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3
  onProductClick?: (id: string) => void
}

export default function ProductGrid({ products, columns = 2, onProductClick }: ProductGridProps) {
  return (
    <View className={`product-grid grid-${columns}`}>
      {products.map((product) => (
        <View key={product.id} className='product-grid-item'>
          <ProductCard product={product} onClick={onProductClick} />
        </View>
      ))}
    </View>
  )
}