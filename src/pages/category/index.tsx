import { useState, useEffect, useRef } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { productApi } from '@/domains/product/api'
import './index.scss'

export default function Category() {
  const router = useRouter()
  const { id } = router.params

  const [categoryName, setCategoryName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!id) return

    const findCategory = (cats: Category[], targetId: string): Category | undefined => {
      for (const cat of cats) {
        if (cat.id === targetId) return cat
        if (cat.children) {
          const found = findCategory(cat.children, targetId)
          if (found) return found
        }
      }
      return undefined
    }

    productApi.getCategories().then(res => {
      if (res.code === 0) {
        const found = findCategory(res.data, id)
        if (found) setCategoryName(found.name)
      }
    })
  }, [id])

  useEffect(() => {
    if (!id) return

    setProducts([])
    setPage(1)
    setHasMore(true)
    loadingRef.current = false

    loadProducts(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadProducts = async (pageNum: number, reset: boolean = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const res = await productApi.getList({ categoryId: id!, page: pageNum, limit: 20 })
      if (res.code === 0) {
        setProducts(prev => reset ? res.data.products : [...prev, ...res.data.products])
        setHasMore(res.data.hasMore)
        setPage(pageNum + 1)
      }
    } catch {
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  const handleScrollToLower = () => {
    if (hasMore && !loadingRef.current) {
      loadProducts(page)
    }
  }

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${productId}` })
  }

  return (
    <ScrollView
      className='category-page'
      scrollY
      onScrollToLower={handleScrollToLower}
      scrollWithAnimation
    >
      <View className='category-header'>
        <Text>分类 - {categoryName || '加载中...'}</Text>
      </View>

      <View className='product-grid'>
        {products.map(product => (
          <View
            key={product.id}
            className='product-card'
            onClick={() => handleProductClick(product.id)}
          >
            <Image
              className='product-image'
              src={product.images[0] || ''}
              mode='aspectFill'
              lazyLoad
            />
            <View className='product-info'>
              <Text className='product-title'>{product.title}</Text>
              <View className='product-price-row'>
                <Text className='product-price'>¥{product.price}</Text>
                {product.isNegotiable && (
                  <Text className='product-tag'>可议价</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {loading && (
        <View className='loading-text'>
          <Text>加载中...</Text>
        </View>
      )}

      {!loading && products.length === 0 && (
        <View className='loading-text'>
          <Text>暂无商品</Text>
        </View>
      )}
    </ScrollView>
  )
}
