import { useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '@/domains/trade/api'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Empty from '@/shared/components/Empty'
import { BackTop } from '@/shared/components/BackTop'
import './index.scss'

const TAB_KEYS = ['', 'pending_payment', 'paid', 'shipped', 'completed']
const TAB_KEY_MAP: Record<string, string> = {
  '': 'trade:orderStatus.all',
  pending_payment: 'trade:orderStatus.pending',
  paid: 'trade:orderStatus.paid',
  shipped: 'trade:orderStatus.shipped',
  completed: 'trade:orderStatus.completed',
}
const STATUS_KEY_MAP: Record<string, string> = {
  pending_payment: 'trade:orderStatus.pending',
  paid: 'trade:orderStatus.paid',
  shipped: 'trade:orderStatus.shipped',
  delivered: 'trade:orderStatus.delivered',
  completed: 'trade:orderStatus.completed',
  cancelled: 'trade:orderStatus.cancelled',
  refunding: 'trade:orderStatus.refunding',
  refunded: 'trade:orderStatus.refunded',
  disputed: 'trade:orderStatus.disputed',
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: '#FF6B35',
  paid: '#07C160',
  shipped: '#4A90D9',
  delivered: '#07C160',
  completed: '#999',
  cancelled: '#999',
  refunding: '#FF6B35',
  refunded: '#999',
  disputed: '#E02020',
}

export default function List() {
  const { t } = useTranslation(['trade', 'common'])
  const [activeTab, setActiveTab] = useState(0)
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)

  const [error, setError] = useState(false)
  const statusKey = TAB_KEYS[activeTab]

  const refresh = useCallback(() => {
    setError(false)
    setOrders([])
    setPage(1)
    setHasMore(true)
    fetchOrders(1, true)
  }, [fetchOrders])

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
      setError(true)
      Taro.showToast({ title: t('common:error.serverError'), icon: 'none' })
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
        Taro.showToast({ title: t('trade:confirmSuccess'), icon: 'success' })
        fetchOrders(1, true)
      }
    } catch {
        Taro.showToast({ title: t('trade:operationFailed'), icon: 'none' })
    }
  }

  const handleCancel = async (e: any, id: string) => {
    e.stopPropagation()
    try {
      const res = await tradeApi.cancelOrder(id)
      if (res.code === 0) {
        Taro.showToast({ title: t('trade:orderStatus.cancelled'), icon: 'success' })
        fetchOrders(1, true)
      }
    } catch {
      Taro.showToast({ title: t('trade:operationFailed'), icon: 'none' })
    }
  }

  const actionButtons = (order: Order) => {
    const btns: { text: string; onClick: (e: any) => void; type: string }[] = []
    switch (order.status) {
      case 'pending_payment':
        btns.push({ text: t('trade:cancelOrder'), onClick: (e) => handleCancel(e, order.id), type: 'default' })
        btns.push({ text: t('trade:goPay'), onClick: (e) => handlePay(e, order.id), type: 'primary' })
        break
      case 'paid':
        btns.push({ text: t('trade:confirmReceipt'), onClick: (e) => handleConfirm(e, order.id), type: 'primary' })
        break
      case 'shipped':
        btns.push({ text: t('trade:confirmReceipt'), onClick: (e) => handleConfirm(e, order.id), type: 'primary' })
        break
      case 'delivered':
        btns.push({ text: t('trade:confirmReceipt'), onClick: (e) => handleConfirm(e, order.id), type: 'primary' })
        break
    }
    return btns
  }

  return (
    <View className='order-list-page'>
      <View className='tab-bar'>
        {TAB_KEYS.map((key, index) => (
          <View
            key={key}
            className={`tab-item ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <Text className='tab-label'>{t(TAB_KEY_MAP[key] || 'trade:orderStatus.all')}</Text>
            {activeTab === index && <View className='tab-indicator' />}
          </View>
        ))}
      </View>

      <ScrollView
        className='order-scroll'
        scrollY
        onScrollToLower={handleScrollToLower}
        lowerThreshold={100}
        onScroll={e => setScrollTop(e.detail.scrollTop)}
      >
        {loading ? (
          <Skeleton variant='list' count={5} />
        ) : error ? (
          <RetryButton onRetry={refresh} />
        ) : orders.length === 0 ? (
          <Empty text={t('common:empty.list')} />
        ) : (
          orders.map(order => (
            <View
              key={order.id}
              className='order-card'
              onClick={() => handleOrderClick(order.id)}
            >
              <View className='order-header'>
                <Text className='order-no'>{t('trade:orderNo')}{order.orderNo}</Text>
                <Text className='order-status' style={{ color: STATUS_COLORS[order.status] || '#999' }}>
                  {t(STATUS_KEY_MAP[order.status] || 'trade:orderStatus.' + order.status)}
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
        ))}

        {loading && (
          <View className='loading-more'>
            <Text>{t('common:loading')}</Text>
          </View>
        )}

        {!hasMore && orders.length > 0 && (
          <View className='no-more'>
            <Text>{t('common:app.noMore')}</Text>
          </View>
        )}
      </ScrollView>

      <BackTop threshold={300} scrollTop={scrollTop} />
    </View>
  )
}
