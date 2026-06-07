import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useAuthStore } from '@/domains/auth/store'
import { sellerApi, type SellerProduct } from '@/domains/seller/api'
import './index.scss'

export default function Listings() {
  const { isLoggedIn } = useAuthStore()
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useLoad(() => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.navigateBack()
      return
    }
    loadProducts(true)
  })

  const loadProducts = async (refresh = false) => {
    const currentPage = refresh ? 1 : page
    setLoading(true)
    try {
      const res = await sellerApi.getProducts({ page: currentPage, pageSize: 20 })
      if (res.code === 0) {
        setProducts(
          refresh ? res.data.list : [...products, ...res.data.list]
        )
        setHasMore(res.data.list.length === 20)
        setPage(currentPage + 1)
      }
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/publish/index?edit=${id}` })
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const apiRes = await sellerApi.deleteProduct(id)
            if (apiRes.code === 0) {
              setProducts((prev) => prev.filter((p) => p.id !== id))
              Taro.showToast({ title: '已删除', icon: 'success' })
            }
          } catch {
            /* handled by interceptor */
          }
        }
      },
    })
  }

  const handleRefresh = useCallback(() => {
    loadProducts(true)
  }, [])

  const handleLoadMore = () => {
    if (hasMore && !loading) loadProducts()
  }

  const statusLabelMap: Record<string, string> = {
    on_sale: '在售',
    sold: '已售',
    archived: '已下架',
  }

  return (
    <View className='listings-page'>
      {loading && products.length === 0 ? (
        <View className='status-text'>加载中...</View>
      ) : products.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-icon'>📦</Text>
          <Text className='empty-text'>还没有发布商品</Text>
          <View
            className='go-publish-btn'
            onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}
          >
            <Text>去发布</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className='listings-scroll'
          scrollY
          refresherEnabled
          refresherTriggered={loading}
          onRefresherRefresh={handleRefresh}
          onScrollToLower={handleLoadMore}
          lowerThreshold={100}
        >
          {products.map((product) => (
            <View key={product.id} className='listing-card'>
              <Image
                className='listing-image'
                src={product.images?.[0] || ''}
                mode='aspectFill'
                lazyLoad
              />
              <View className='listing-info'>
                <Text className='listing-title'>{product.title}</Text>
                <View className='listing-meta'>
                  <Text className='listing-price'>¥{product.price}</Text>
                  <Text className={`listing-status status-${product.status}`}>
                    {statusLabelMap[product.status] || product.status}
                  </Text>
                </View>
                <View className='listing-stats'>
                  <Text className='stat-item'>浏览 {product.viewCount}</Text>
                  <Text className='stat-item'>喜欢 {product.likeCount}</Text>
                </View>
              </View>
              <View className='listing-actions'>
                <View
                  className='action-btn edit-btn'
                  onClick={() => handleEdit(product.id)}
                >
                  <Text>编辑</Text>
                </View>
                <View
                  className='action-btn delete-btn'
                  onClick={() => handleDelete(product.id)}
                >
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))}
          {loading && <View className='loading-more'>加载中...</View>}
          {!hasMore && products.length > 0 && (
            <View className='no-more'>已经到底了</View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
