import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useProductStore } from '@/domains/product/store'
import { productApi } from '@/domains/product/api'
import { useLocation } from '@/shared/hooks/useLocation'
import { Skeleton } from '@/shared/components/Skeleton'
import { Empty } from '@/shared/components/Empty'
import { triggerHaptic } from '@/shared/utils/haptic'
import './index.scss'

type FeedTab = 'recommend' | 'nearby' | 'following'

export default function Index() {
  const { t } = useTranslation(['product', 'common'])
  const {
    recommendProducts,
    recommendHasMore,
    categories,
    loading,
    refreshing,
    loadRecommendations,
    loadCategories
  } = useProductStore()

  const { getLocation } = useLocation()
  const [activeTab, setActiveTab] = useState<FeedTab>('recommend')
  const [nearbyProducts, setNearbyProducts] = useState<Product[]>([])
  const [nearbyPage, setNearbyPage] = useState(1)
  const [nearbyHasMore, setNearbyHasMore] = useState(true)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyRefreshing, setNearbyRefreshing] = useState(false)

  useEffect(() => {
    loadRecommendations(true)
    loadCategories()
  }, [])

  const loadNearby = useCallback(async (refresh = false) => {
    const page = refresh ? 1 : nearbyPage
    setNearbyLoading(true)

    try {
      const loc = await getLocation()
      const params: any = { page, limit: 20, tab: 'nearby' }
      if (loc) {
        params.latitude = loc.latitude
        params.longitude = loc.longitude
      }

      const res = await productApi.getRecommendations(params)
      if (res.code === 0) {
        setNearbyProducts(refresh ? res.data.products : [...nearbyProducts, ...res.data.products])
        setNearbyPage(page + 1)
        setNearbyHasMore(res.data.hasMore)
      }
    } catch {
      /* silent */
    } finally {
      setNearbyLoading(false)
      setNearbyRefreshing(false)
    }
  }, [nearbyPage, nearbyProducts, getLocation])

  const handleSearchClick = useCallback(() => {
    Taro.navigateTo({ url: '/pages/product/search/index' })
  }, [])

  const handleProductClick = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  }, [])

  const handleCategoryClick = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/category/index?id=${id}` })
  }, [])

  const handleRefresh = useCallback(() => {
    if (activeTab === 'nearby') {
      loadNearby(true)
    } else {
      loadRecommendations(true)
    }
  }, [activeTab, loadNearby, loadRecommendations])

  const handleLoadMore = useCallback(() => {
    if (activeTab === 'nearby') {
      if (nearbyHasMore && !nearbyLoading) {
        loadNearby()
      }
    } else {
      if (recommendHasMore && !loading) {
        loadRecommendations()
      }
    }
  }, [activeTab, nearbyHasMore, nearbyLoading, loadNearby, recommendHasMore, loading, loadRecommendations])

  const handleTabChange = useCallback((tab: FeedTab) => {
    setActiveTab(tab)
    if (tab === 'nearby' && nearbyProducts.length === 0) {
      loadNearby(true)
    }
  }, [nearbyProducts.length, loadNearby])

  const currentProducts = activeTab === 'nearby' ? nearbyProducts : recommendProducts
  const currentHasMore = activeTab === 'nearby' ? nearbyHasMore : recommendHasMore
  const currentLoading = activeTab === 'nearby' ? nearbyLoading : loading
  const currentRefreshing = activeTab === 'nearby' ? nearbyRefreshing : refreshing

  return (
    <View className='home-page'>
      <View className='search-bar' onClick={handleSearchClick}>
        <Text className='search-placeholder'>{t('product:search')}</Text>
      </View>

      {categories.length > 0 && (
        <View className='category-grid'>
          {categories.slice(0, 8).map((cat) => (
            <View
              key={cat.id}
              className='category-item'
              onClick={() => handleCategoryClick(cat.id)}
            >
              <View className='category-icon-wrap'>
                {cat.icon ? (
                  <Image src={cat.icon} className='category-icon' mode='aspectFit' />
                ) : (
                  <Text className='category-icon-fallback'>{cat.name.charAt(0)}</Text>
                )}
              </View>
              <Text className='category-name'>{cat.name}</Text>
            </View>
          ))}
        </View>
      )}

      <View className='feed-tabs'>
        {(['recommend', 'nearby', 'following'] as FeedTab[]).map((tab) => (
          <View
            key={tab}
            className={`feed-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            <Text className='feed-tab-text'>
              {tab === 'recommend' ? t('product:tabRecommend') : tab === 'nearby' ? t('product:tabNearby') : t('product:tabFollowing')}
            </Text>
            {activeTab === tab && <View className='feed-tab-indicator' />}
          </View>
        ))}
      </View>

      <ScrollView
        className='product-feed'
        scrollY
        refresherEnabled
        refresherTriggered={currentRefreshing}
        onRefresherRefresh={handleRefresh}
        onScrollToLower={handleLoadMore}
        lowerThreshold={100}
      >
        {currentLoading && currentProducts.length === 0 ? (
          <Skeleton variant='card' count={4} />
        ) : currentProducts.length === 0 ? (
          <Empty
            variant='no-data'
            action={{
              label: '刷新',
              onClick: () => {
                triggerHaptic('light')
                handleRefresh()
              },
            }}
          />
        ) : (
          <View className='product-grid'>
            {currentProducts.map((product) => (
              <View
                key={product.id}
                className='product-card'
                onClick={() => handleProductClick(product.id)}
              >
                <Image
                  src={product.images?.[0] || ''}
                  className='product-image'
                  mode='aspectFill'
                  lazyLoad
                />
                <View className='product-info'>
                  <Text className='product-title'>{product.title}</Text>
                  <View className='product-price-row'>
                    <Text className='product-price'>¥{product.price}</Text>
                    {product.isNegotiable && (
                      <Text className='negotiable-tag'>{t('product:negotiable')}</Text>
                    )}
                  </View>
                  {product.distance != null && (
                    <Text className='product-distance'>
                      {product.distance < 1
                        ? `${Math.round(product.distance * 1000)}m`
                        : `${product.distance.toFixed(1)}km`}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {currentLoading && currentProducts.length > 0 && (
          <View className='loading-more'>{t('common:loading')}</View>
        )}
        {!currentHasMore && currentProducts.length > 0 && (
          <View className='no-more'>{t('common:app.noMore')}</View>
        )}
      </ScrollView>
    </View>
  )
}
