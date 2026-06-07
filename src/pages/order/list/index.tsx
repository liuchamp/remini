import { useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { tradeApi } from '@/domains/trade/api'
import './index.scss'

const TABS = [
  { key: '', label: '全部' },
  { key: 'pending_payment', label: '待付款' },
  { key: 'paid', label: '已付款' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: '待付款', color: '#FF6B35' },
  paid: { label: '已付款', color: '#07C160' },
  shipped: { label: '待收货', color: '#4A90D9' },
  delivered: { label: '已送达', color: '#07C160' },
  completed: { label: '已完成', color: '#999' },
  cancelled: { label: '已取消', color: '#999' },
  refunding: { label: '退款中', color: '#FF6B35' },
  refunded: { label: '已退款', color: '#999' },
  disputed: { label: '争议中', color: '#E02020' },
}

export default function List() {
  const [activeTab, setActiveTab] = useState(0)
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const statusKey = TABS[activeTab].key

  const fetchOrders = useCallback(async (p: number, replace: boolean) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await tradeApi.getOrderList(statusKey || undefined, p)
      if (res.code === 0) {
        const data = res.data as { orders: Order[]; hasMore: boolean }
        setOrders(prev => (replace ? data.orders : [...prev, ...data.orders]))
        setHasMore(data.hasMore)
        setPage(p)
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [statusKey])

  useLoad(() => {
    fetchOrders(1, true)
  })

  const handleTabClick = (index: number) => {
    if (index === activeTab) return
    setActiveTab(index)
    setOrders([])
    setPage(1)
    setHasMore(true)
    setTimeout(() => fetchOrders(1, true), 0)
  }

  const handleScrollToLower = () => {
    if (hasMore && !loading) {
      fetchOrders(page + 1, false)
    }
  }

  const handleOrderClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/order/detail/index?id=${id}` })
  }

  const handlePay = (e: any, id: string) => {
    e.stopPropagation()
    Taro.navigateTo({ url: `/pages/order/pay/index?orderId=${id}` })
  }

  const handleConfirm = async (e: any, id: string) => {
    e.stopPropagation()
    try {
      const res = await tradeApi.confirmOrder(id)
      if (res.code === 0) {
        Taro.showToast({ title: '确认成功', icon: 'success' })
        fetchOrders(1, true)
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleCancel = async (e: any, id: string) => {
    e.stopPropagation()
    try {
      const res = await tradeApi.cancelOrder(id)
      if (res.code === 0) {
        Taro.showToast({ title: '已取消', icon: 'success' })
        fetchOrders(1, true)
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const actionButtons = (order: Order) => {
    const btns: { text: string; onClick: (e: any) => void; type: string }[] = []
    switch (order.status) {
      case 'pending_payment':
        btns.push({ text: '取消订单', onClick: (e) => handleCancel(e, order.id), type: 'default' })
        btns.push({ text: '去支付', onClick: (e) => handlePay(e, order.id), type: 'primary' })
        break
      case 'paid':
        btns.push({ text: '确认收货', onClick: (e) => handleConfirm(e, order.id), type: 'primary' })
        break
      case 'shipped':
        btns.push({ text: '确认收货', onClick: (e) => handleConfirm(e, order.id), type: 'primary' })
        break
      case 'delivered':
        btns.push({ text: '确认收货', onClick: (e) => handleConfirm(e, order.id), type: 'primary' })
        break
    }
    return btns
  }

  return (
    <View className='order-list-page'>
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

      <ScrollView
        className='order-scroll'
        scrollY
        onScrollToLower={handleScrollToLower}
        lowerThreshold={100}
      >
        {orders.length === 0 && !loading && (
          <View className='empty-state'>
            <Text className='empty-icon'>📦</Text>
            <Text className='empty-text'>暂无订单</Text>
            <Text className='empty-hint'>去看看有什么值得买的吧</Text>
          </View>
        )}

        {orders.map(order => {
          const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999' }
          return (
            <View
              key={order.id}
              className='order-card'
              onClick={() => handleOrderClick(order.id)}
            >
              <View className='order-header'>
                <Text className='order-no'>订单号: {order.orderNo}</Text>
                <Text className='order-status' style={{ color: statusInfo.color }}>
                  {statusInfo.label}
                </Text>
              </View>

              <View className='order-body'>
                <Image
                  className='product-image'
                  src={order.product.image}
                  mode='aspectFill'
                  lazyLoad
                />
                <View className='product-info'>
                  <Text className='product-title' numberOfLines={2}>
                    {order.product.title}
                  </Text>
                  <Text className='product-price'>
                    <Text className='price-symbol'>¥</Text>
                    {order.finalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {actionButtons(order).length > 0 && (
                <View className='order-actions'>
                  {actionButtons(order).map((btn, i) => (
                    <View
                      key={i}
                      className={`action-btn ${btn.type}`}
                      onClick={btn.onClick}
                    >
                      <Text>{btn.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        })}

        {loading && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}

        {!hasMore && orders.length > 0 && (
          <View className='no-more'>
            <Text>没有更多了</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
