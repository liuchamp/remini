import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect } from 'react'
import { useProductStore } from '@/domains/product/store'
import './index.scss'

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

  useEffect(() => {
    loadRecommendations(true)
    loadCategories()
  }, [])

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
    loadRecommendations(true)
  }

  const handleLoadMore = () => {
    if (recommendHasMore && !loading) {
      loadRecommendations()
    }
  }

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

      <ScrollView
        className='product-feed'
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        onScrollToLower={handleLoadMore}
        lowerThreshold={100}
      >
        <View className='product-grid'>
          {recommendProducts.map((product) => (
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

        {loading && <View className='loading-more'>加载中...</View>}
        {!recommendHasMore && recommendProducts.length > 0 && (
          <View className='no-more'>已经到底了</View>
        )}
      </ScrollView>
    </View>
  )
}
