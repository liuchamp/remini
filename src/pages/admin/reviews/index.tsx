import { useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useReachBottom } from '@tarojs/taro'
import { adminApi } from '@/domains/admin/api'
import './index.scss'

interface PendingProduct {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  sellerName: string
  sellerId: string
  categoryName: string
  condition: string
  createdAt: string
}

export default function AdminReviews() {
  const [products, setProducts] = useState<PendingProduct[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
    setLoading(true)
    try {
      const res = await adminApi.getPendingProducts(pageNum)
      if (res.code === 0 || res.code === 200) {
        const list = res.data.products || []
        setProducts(prev => reset ? list : [...prev, ...list])
        setHasMore(list.length >= 20)
      }
    } catch (err) {
      console.error('Failed to load pending products:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [])

  useLoad(() => {
    loadProducts(1, true)
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadProducts(nextPage)
    }
  })

  const handleApprove = async (product: PendingProduct) => {
    setProcessingId(product.id)
    try {
      const res = await adminApi.approveProduct(product.id)
      if (res.code === 0 || res.code === 200) {
        Taro.showToast({ title: '已通过', icon: 'success' })
        setProducts(prev => prev.filter(p => p.id !== product.id))
      }
    } catch (err) {
      console.error('Failed to approve product:', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (product: PendingProduct) => {
    setProcessingId(product.id)
    try {
      const res = await adminApi.rejectProduct(product.id, '不符合平台规定')
      if (res.code === 0 || res.code === 200) {
        Taro.showToast({ title: '已驳回', icon: 'success' })
        setProducts(prev => prev.filter(p => p.id !== product.id))
      }
    } catch (err) {
      console.error('Failed to reject product:', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setProcessingId(null)
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const h = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    return `${m}-${day} ${h}:${min}`
  }

  const conditionLabels: Record<string, string> = {
    new: '全新',
    like_new: '几乎全新',
    good: '良好',
    fair: '一般',
  }

  return (
    <View className='reviews-page'>
      <View className='page-header'>
        <Text className='header-title'>待审核商品</Text>
        <Text className='header-count'>共 {products.length} 件</Text>
      </View>

      {products.length === 0 && !loading && (
        <View className='empty-state'>
          <Text className='empty-icon'>✅</Text>
          <Text className='empty-text'>暂无待审核商品</Text>
          <Text className='empty-hint'>所有商品已审核完毕</Text>
        </View>
      )}

      <ScrollView className='product-list' scrollY>
        {products.map(product => (
          <View key={product.id} className='product-card'>
            <View className='product-main'>
              <View className='product-image-wrap'>
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    className='product-image'
                    mode='aspectFill'
                  />
                ) : (
                  <View className='product-image-placeholder'>
                    <Text>📷</Text>
                  </View>
                )}
              </View>
              <View className='product-info'>
                <Text className='product-title'>{product.title}</Text>
                <Text className='product-price'>¥{product.price}</Text>
                <View className='product-tags'>
                  <Text className='tag'>{product.categoryName}</Text>
                  <Text className='tag'>
                    {conditionLabels[product.condition] || product.condition}
                  </Text>
                </View>
                <Text className='product-seller'>
                  卖家: {product.sellerName}
                </Text>
                <Text className='product-time'>
                  {formatTime(product.createdAt)}
                </Text>
              </View>
            </View>

            <View className='product-desc'>
              <Text className='desc-label'>描述:</Text>
              <Text className='desc-text' numberOfLines={3}>
                {product.description}
              </Text>
            </View>

            <View className='action-bar'>
              <View
                className={`action-btn reject ${processingId === product.id ? 'disabled' : ''}`}
                onClick={() => !processingId && handleReject(product)}
              >
                <Text>驳回</Text>
              </View>
              <View
                className={`action-btn approve ${processingId === product.id ? 'disabled' : ''}`}
                onClick={() => !processingId && handleApprove(product)}
              >
                <Text>通过</Text>
              </View>
            </View>
          </View>
        ))}

        {loading && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}

        {!hasMore && products.length > 0 && (
          <View className='no-more'>
            <Text>没有更多了</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
