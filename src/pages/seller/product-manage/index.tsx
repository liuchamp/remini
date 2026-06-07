import { useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { sellerApi, type SellerProduct } from '@/domains/seller/api'
import './index.scss'

const TABS = [
  { key: 'on_sale', label: '在售', emptyIcon: '📦', emptyText: '暂无在售商品' },
  { key: 'sold', label: '已售', emptyIcon: '✅', emptyText: '暂无已售商品' },
  { key: 'archived', label: '已下架', emptyIcon: '📦', emptyText: '暂无已下架商品' },
]

const STATUS_LABELS: Record<string, string> = {
  on_sale: '在售',
  sold: '已售',
  archived: '已下架',
}

export default function ProductManage() {
  const { t } = useTranslation(['product', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [activeTab, setActiveTab] = useState(0)
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ onSale: 0, sold: 0, archived: 0 })

  const statusKey = TABS[activeTab].key

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sellerApi.getProducts({ status: statusKey })
      if (res.code === 0) {
        setProducts(res.data.list)
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [statusKey])

  const fetchStats = useCallback(async () => {
    try {
      const res = await sellerApi.getStats()
      if (res.code === 0) {
        setStats({
          onSale: res.data.onSaleCount,
          sold: res.data.soldCount,
          archived: res.data.totalProducts - res.data.onSaleCount - res.data.soldCount,
        })
      }
    } catch {
      // silent
    }
  }, [])

  useLoad(() => {
    fetchProducts()
    fetchStats()
  })

  const handleTabClick = (index: number) => {
    if (index === activeTab) return
    setActiveTab(index)
    setTimeout(() => fetchProducts(), 0)
  }

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/publish/index?edit=${id}` })
  }

  const handleArchive = async (id: string) => {
    const result = await Taro.showModal({
      title: '确认下架',
      content: '下架后商品将不再展示，确定要下架吗？',
      confirmText: '下架',
      cancelText: '取消',
      confirmColor: '#1976D2',
    })
    if (!result.confirm) return
    try {
      const res = await sellerApi.updateProductStatus(id, 'archived')
      if (res.code === 0) {
        Taro.showToast({ title: '已下架', icon: 'success' })
        fetchProducts()
        fetchStats()
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleRelist = async (id: string) => {
    try {
      const res = await sellerApi.updateProductStatus(id, 'on_sale')
      if (res.code === 0) {
        Taro.showToast({ title: '已重新上架', icon: 'success' })
        fetchProducts()
        fetchStats()
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#C62828',
    })
    if (!result.confirm) return
    try {
      const res = await sellerApi.deleteProduct(id)
      if (res.code === 0) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchProducts()
        fetchStats()
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const renderActions = (product: SellerProduct) => {
    const btns: { text: string; onClick: () => void; cls: string }[] = []

    switch (product.status) {
      case 'on_sale':
        btns.push({ text: '编辑', onClick: () => handleEdit(product.id), cls: 'edit' })
        btns.push({ text: '下架', onClick: () => handleArchive(product.id), cls: 'archive' })
        break
      case 'sold':
        btns.push({ text: '删除', onClick: () => handleDelete(product.id), cls: 'delete' })
        break
      case 'archived':
        btns.push({ text: '重新上架', onClick: () => handleRelist(product.id), cls: 'unarchive' })
        btns.push({ text: '删除', onClick: () => handleDelete(product.id), cls: 'delete' })
        break
    }

    return btns
  }

  const currentTab = TABS[activeTab]

  return (
    <View className='product-manage-page'>
      <View className='tab-bar'>
        {TABS.map((tab, index) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <Text className='tab-label'>{tab.label}</Text>
            {activeTab === index && <View className='tab-indicator' />}
          </View>
        ))}
      </View>

      <View className='stats-bar'>
        <View className='stat-item'>
          <Text className='stat-value'>{stats.onSale}</Text>
          <Text className='stat-label'>在售</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{stats.sold}</Text>
          <Text className='stat-label'>已售</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{stats.archived}</Text>
          <Text className='stat-label'>已下架</Text>
        </View>
      </View>

      <ScrollView className='product-scroll' scrollY>
        {products.length === 0 && !loading && (
          <View className='empty-state'>
            <Text className='empty-icon'>{currentTab.emptyIcon}</Text>
            <Text className='empty-text'>{currentTab.emptyText}</Text>
            <Text className='empty-hint'>去发布更多商品吧</Text>
          </View>
        )}

        {products.map((product) => (
          <View key={product.id} className='product-card'>
            <View className='product-body'>
              <Image
                className='product-thumb'
                src={product.images?.[0] || ''}
                mode='aspectFill'
              />
              <View className='product-info'>
                <Text className='product-name' numberOfLines={2}>
                  {product.title}
                </Text>
                <Text className='product-price'>
                  <Text className='symbol'>¥</Text>
                  {product.price.toFixed(2)}
                </Text>
                <View className='product-meta'>
                  <View className={`status-badge ${product.status}`}>
                    {STATUS_LABELS[product.status] || product.status}
                  </View>
                  <Text className='meta-item'>👁 {product.viewCount}</Text>
                  <Text className='meta-item'>❤ {product.likeCount}</Text>
                </View>
              </View>
            </View>

            {renderActions(product).length > 0 && (
              <View className='product-actions'>
                {renderActions(product).map((btn, idx) => (
                  <View
                    key={idx}
                    className={`action-btn ${btn.cls}`}
                    onClick={btn.onClick}
                  >
                    <Text>{btn.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
