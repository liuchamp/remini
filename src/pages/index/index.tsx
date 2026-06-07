import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect, useState, useCallback } from 'react'
import { useProductStore } from '@/domains/product/store'
import { productApi } from '@/domains/product/api'
import { useLocation } from '@/shared/hooks/useLocation'
import './index.scss'

type FeedTab = 'recommend' | 'nearby' | 'following'

export default function Index() {
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

  const handleSearchClick = () => {
    Taro.navigateTo({ url: '/pages/product/search/index' })
  }

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  }

  const handleCategoryClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/category/index?id=${id}` })
  }

  const handleRefresh = () => {
    if (activeTab === 'nearby') {
      loadNearby(true)
    } else {
      loadRecommendations(true)
    }
  }

  const handleLoadMore = () => {
    if (activeTab === 'nearby') {
      if (nearbyHasMore && !nearbyLoading) {
        loadNearby()
      }
    } else {
      if (recommendHasMore && !loading) {
        loadRecommendations()
      }
    }
  }

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab)
    if (tab === 'nearby' && nearbyProducts.length === 0) {
      loadNearby(true)
    }
  }

  const currentProducts = activeTab === 'nearby' ? nearbyProducts : recommendProducts
  const currentHasMore = activeTab === 'nearby' ? nearbyHasMore : recommendHasMore
  const currentLoading = activeTab === 'nearby' ? nearbyLoading : loading
  const currentRefreshing = activeTab === 'nearby' ? nearbyRefreshing : refreshing

  return (
    <View className='home-page'>
      <View className='search-bar' onClick={handleSearchClick}>
        <Text className='search-placeholder'>搜索商品</Text>
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
              {tab === 'recommend' ? '推荐' : tab === 'nearby' ? '附近' : '关注'}
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
                    <Text className='negotiable-tag'>可议价</Text>
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

        {currentLoading && <View className='loading-more'>加载中...</View>}
        {!currentHasMore && currentProducts.length > 0 && (
          <View className='no-more'>已经到底了</View>
        )}
      </ScrollView>
    </View>
  )
}
