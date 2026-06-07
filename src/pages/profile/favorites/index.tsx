import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/domains/auth/store'
import { productApi } from '@/domains/product/api'
import './index.scss'

export default function Favorites() {
  const { t } = useTranslation(['profile', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { isLoggedIn } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useLoad(() => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.navigateBack()
      return
    }
    loadFavorites(true)
  })

  const loadFavorites = async (refresh = false) => {
    const currentPage = refresh ? 1 : page
    setLoading(true)
    try {
      const res = await productApi.getFavorites(currentPage)
      if (res.code === 0) {
        setProducts(
          refresh ? res.data.products : [...products, ...res.data.products]
        )
        setHasMore(res.data.hasMore)
        setPage(currentPage + 1)
      }
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false)
    }
  }

  const handleUnfavorite = async (productId: string) => {
    try {
      const res = await productApi.toggleFavorite(productId)
      if (res.code === 0) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        Taro.showToast({ title: '已取消收藏', icon: 'success' })
      }
    } catch {
      /* handled by interceptor */
    }
  }

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  }

  const handleRefresh = useCallback(() => {
    loadFavorites(true)
  }, [])

  const handleLoadMore = () => {
    if (hasMore && !loading) loadFavorites()
  }

  return (
    <View className='favorites-page'>
      {loading && products.length === 0 ? (
        <View className='status-text'>加载中...</View>
      ) : products.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-icon'>❤️</Text>
          <Text className='empty-text'>还没有收藏商品</Text>
          <View
            className='go-browse-btn'
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <Text>去逛逛</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className='favorites-scroll'
          scrollY
          refresherEnabled
          refresherTriggered={loading}
          onRefresherRefresh={handleRefresh}
          onScrollToLower={handleLoadMore}
          lowerThreshold={100}
        >
          <View className='product-list'>
            {products.map((product) => (
              <View
                key={product.id}
                className='favorite-card'
                onClick={() => handleProductClick(product.id)}
              >
                <Image
                  className='fav-image'
                  src={product.images?.[0] || ''}
                  mode='aspectFill'
                  lazyLoad
                />
                <View className='fav-info'>
                  <Text className='fav-title'>{product.title}</Text>
                  <View className='fav-bottom'>
                    <Text className='fav-price'>¥{product.price}</Text>
                    <View
                      className='unfavorite-btn'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnfavorite(product.id)
                      }}
                    >
                      <Text>取消收藏</Text>
                    </View>
                  </View>
                  {product.seller && (
                    <Text className='fav-seller'>{product.seller.username}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          {loading && <View className='loading-more'>加载中...</View>}
          {!hasMore && products.length > 0 && (
            <View className='no-more'>已经到底了</View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
