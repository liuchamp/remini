import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useRouter } from '@tarojs/taro'
import { tradeApi } from '@/domains/trade/api'
import './index.scss'

const STATUS_STEPS: { key: string; label: string; field: string }[] = [
  { key: 'pending_payment', label: '提交订单', field: 'createdAt' },
  { key: 'paid', label: '已付款', field: 'paidAt' },
  { key: 'shipped', label: '已发货', field: 'shippedAt' },
  { key: 'delivered', label: '已送达', field: 'deliveredAt' },
  { key: 'completed', label: '已完成', field: 'completedAt' },
]

const ORDER_STATUS_MAP: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  shipped: '待收货',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
  disputed: '争议中',
}

export default function Detail() {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    const id = router.params.id
    if (id) {
      loadDetail(id)
    }
  })

  const loadDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await tradeApi.getOrderDetail(id)
      if (res.code === 0) {
        setOrder(res.data as Order)
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handlePay = () => {
    if (!order) return
    Taro.navigateTo({ url: `/pages/order/pay/index?orderId=${order.id}` })
  }

  const handleConfirm = async () => {
    if (!order) return
    try {
      const res = await tradeApi.confirmOrder(order.id)
      if (res.code === 0) {
        Taro.showToast({ title: '确认成功', icon: 'success' })
        loadDetail(order.id)
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleCancel = async () => {
    if (!order) return
    try {
      const res = await tradeApi.cancelOrder(order.id)
      if (res.code === 0) {
        Taro.showToast({ title: '已取消', icon: 'success' })
        loadDetail(order.id)
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleRefund = () => {
    if (!order) return
    Taro.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await tradeApi.requestRefund(order.id, '其他原因')
            if (result.code === 0) {
              Taro.showToast({ title: '申请已提交', icon: 'success' })
              loadDetail(order.id)
            }
          } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  }

  const getActiveSteps = () => {
    if (!order) return []
    const statusOrder = ['pending_payment', 'paid', 'shipped', 'delivered', 'completed']
    const idx = statusOrder.indexOf(order.status)
    return STATUS_STEPS.map((step, i) => ({
      ...step,
      active: i <= idx,
      current: i === idx,
    }))
  }

  const actionButtons = () => {
    if (!order) return null
    const btns: { text: string; onClick: () => void; type: string }[] = []
    switch (order.status) {
      case 'pending_payment':
        btns.push({ text: '取消订单', onClick: handleCancel, type: 'default' })
        btns.push({ text: '去支付', onClick: handlePay, type: 'primary' })
        break
      case 'paid':
      case 'shipped':
      case 'delivered':
        btns.push({ text: '确认收货', onClick: handleConfirm, type: 'primary' })
        break
      case 'completed':
        btns.push({ text: '申请退款', onClick: handleRefund, type: 'default' })
        btns.push({ text: '去评价', onClick: () => Taro.showToast({ title: '评价功能开发中', icon: 'none' }), type: 'primary' })
        break
    }
    return btns
  }

  if (loading || !order) {
    return (
      <View className='detail-page'>
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const activeSteps = getActiveSteps()
  const btns = actionButtons()

  return (
    <View className='detail-page'>
      <View className='detail-scroll'>
        <View className='status-banner'>
          <Text className='status-text'>{ORDER_STATUS_MAP[order.status] || order.status}</Text>
          {order.status === 'pending_payment' && (
            <Text className='status-sub'>请在24小时内完成支付，逾期自动取消</Text>
          )}
        </View>

        <View className='timeline-card'>
          {activeSteps.map((step, i) => (
            <View key={step.key} className={`timeline-item ${step.active ? 'active' : ''} ${step.current ? 'current' : ''}`}>
              <View className='timeline-dot'>
                {step.current && <View className='current-dot' />}
              </View>
              <View className='timeline-content'>
                <Text className='step-label'>{step.label}</Text>
                {step.active && (order as any)[step.field] && (
                  <Text className='step-time'>{(order as any)[step.field]}</Text>
                )}
              </View>
              {i < activeSteps.length - 1 && (
                <View className={`timeline-line ${step.active && activeSteps[i + 1].active ? 'active' : ''}`} />
              )}
            </View>
          ))}
        </View>

        {order.address && (
          <View className='address-card'>
            <View className='address-header'>
              <Text className='address-name'>{order.address.recipientName}</Text>
              <Text className='address-phone'>{order.address.phone}</Text>
            </View>
            <Text className='address-detail'>
              {order.address.province}{order.address.city}{order.address.district}{order.address.detail}
            </Text>
          </View>
        )}

        <View className='product-card' onClick={() => Taro.navigateTo({ url: `/pages/product/detail/index?id=${order.productId}` })}>
          <Image className='product-image' src={order.product.image} mode='aspectFill' />
          <View className='product-info'>
            <Text className='product-title' numberOfLines={2}>{order.product.title}</Text>
            <Text className='product-price'>¥{order.finalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View className='price-card'>
          <View className='price-row'>
            <Text className='price-label'>商品金额</Text>
            <Text className='price-value'>¥{order.totalAmount.toFixed(2)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View className='price-row'>
              <Text className='price-label'>优惠减免</Text>
              <Text className='price-value discount'>-¥{order.discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View className='price-row shipping'>
            <Text className='price-label'>运费</Text>
            <Text className='price-value'>免运费</Text>
          </View>
          <View className='price-divider' />
          <View className='price-row total'>
            <Text className='price-label'>实付款</Text>
            <Text className='price-value'>¥{order.finalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View className='info-card'>
          <View className='info-row'>
            <Text className='info-label'>订单编号</Text>
            <Text className='info-value' selectable>{order.orderNo}</Text>
          </View>
          <View className='info-row'>
            <Text className='info-label'>下单时间</Text>
            <Text className='info-value'>{order.createdAt}</Text>
          </View>
          {order.note && (
            <View className='info-row'>
              <Text className='info-label'>买家备注</Text>
              <Text className='info-value'>{order.note}</Text>
            </View>
          )}
        </View>
      </View>

      {btns && btns.length > 0 && (
        <View className='bottom-bar'>
          {btns.map((btn, i) => (
            <View
              key={i}
              className={`bottom-btn ${btn.type}`}
              onClick={btn.onClick}
            >
              <Text>{btn.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
