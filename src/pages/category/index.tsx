import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import { productApi } from '@/domains/product/api'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Empty from '@/shared/components/Empty'
import './index.scss'

export default function Category() {
  const { t } = useTranslation(['product', 'common'])
  const router = useRouter()
  const { id } = router.params

  const [categoryName, setCategoryName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
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

  const loadProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
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
      if (reset) setError(true)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [id])

  const refresh = useCallback(() => {
    setError(false)
    setProducts([])
    setPage(1)
    setHasMore(true)
    loadingRef.current = false
    loadProducts(1, true)
  }, [loadProducts])

  const handleScrollToLower = useCallback(() => {
    if (hasMore && !loadingRef.current) {
      loadProducts(page)
    }
  }, [hasMore, loadProducts, page])

  const handleProductClick = useCallback((productId: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${productId}` })
  }, [])

  useEffect(() => {
    if (!id) return
    setProducts([])
    setPage(1)
    setHasMore(true)
    loadingRef.current = false
    loadProducts(1, true)
  }, [id, loadProducts])

  if (loading && products.length === 0) {
    return (
      <ScrollView className='category-page' scrollY scrollWithAnimation>
        <Skeleton variant='card' count={4} />
      </ScrollView>
    )
  }

  if (error) {
    return (
      <ScrollView className='category-page' scrollY scrollWithAnimation>
        <RetryButton onRetry={refresh} />
      </ScrollView>
    )
  }

  if (!loading && products.length === 0) {
    return (
      <ScrollView className='category-page' scrollY scrollWithAnimation>
        <Empty text={t('common:empty.list')} />
      </ScrollView>
    )
  }

  return (
    <ScrollView
      className='category-page'
      scrollY
      onScrollToLower={handleScrollToLower}
      scrollWithAnimation
    >
      <View className='category-header'>
        <Text>{t('product:category')} - {categoryName || t('common:loading')}</Text>
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
                  <Text className='product-tag'>{t('product:negotiable')}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {loading && (
        <View className='loading-text'>
          <Text>{t('common:loading')}</Text>
        </View>
      )}
    </ScrollView>
  )
}
