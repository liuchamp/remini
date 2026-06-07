import { useState } from 'react'
import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useRouter } from '@tarojs/taro'
import { tradeApi } from '@/domains/trade/api'
import { shippingApi } from '@/domains/shipping/api'
import Loading from '@/shared/components/Loading'
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

const LOGISTICS_COMPANIES = [
  '顺丰速运',
  '中通快递',
  '圆通速递',
  '韵达快递',
  '申通快递',
  '极兔速递',
  '京东物流',
  '邮政EMS',
]

const CANCEL_REASONS = [
  '不想要了',
  '买错了',
  '信息填写错误',
  '卖家缺货',
  '其他原因',
]

export default function Detail() {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const [showShippingModal, setShowShippingModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelCustomReason, setCancelCustomReason] = useState('')

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

  const handleConfirm = () => {
    if (!order) return
    Taro.showModal({
      title: '确认收货',
      content: '请确认已收到货物，确认后货款将打给卖家',
      confirmText: '确认收货',
      cancelText: '再等等',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await tradeApi.confirmOrder(order.id)
            if (result.code === 0) {
              Taro.showToast({ title: '确认成功', icon: 'success' })
              loadDetail(order.id)
            }
          } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  }

  const openCancelModal = () => {
    setCancelReason('')
    setCancelCustomReason('')
    setShowCancelModal(true)
  }

  const handleCancelSubmit = async () => {
    if (!order) return
    const reason = cancelReason === '其他原因' ? cancelCustomReason.trim() : cancelReason
    if (!cancelReason) {
      Taro.showToast({ title: '请选择取消原因', icon: 'none' })
      return
    }
    if (cancelReason === '其他原因' && !reason) {
      Taro.showToast({ title: '请输入取消原因', icon: 'none' })
      return
    }
    try {
      const res = await tradeApi.cancelOrder(order.id, reason)
      if (res.code === 0) {
        Taro.showToast({ title: '已取消', icon: 'success' })
        setShowCancelModal(false)
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

  const openShippingModal = () => {
    setSelectedCompany('')
    setTrackingNumber('')
    setShowShippingModal(true)
  }

  const handleShipSubmit = async () => {
    if (!order) return
    if (!selectedCompany) {
      Taro.showToast({ title: '请选择物流公司', icon: 'none' })
      return
    }
    if (!trackingNumber.trim()) {
      Taro.showToast({ title: '请输入运单号', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const res = await shippingApi.createShipping({
        orderId: order.id,
        company: selectedCompany,
        trackingNumber: trackingNumber.trim(),
      })
      if (res.code === 0) {
        Taro.showToast({ title: '发货成功', icon: 'success' })
        setShowShippingModal(false)
        loadDetail(order.id)
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
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
        btns.push({ text: '取消订单', onClick: openCancelModal, type: 'default' })
        btns.push({ text: '去支付', onClick: handlePay, type: 'primary' })
        break
      case 'paid':
        btns.push({ text: '确认发货', onClick: openShippingModal, type: 'primary' })
        break
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
        <Loading type='skeleton' rows={4} />
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

      {showShippingModal && (
        <View className='modal-overlay' onClick={() => setShowShippingModal(false)}>
          <View className='modal-content' onClick={(e: any) => e.stopPropagation()}>
            <View className='modal-header'>
              <Text className='modal-title'>确认发货</Text>
              <View className='modal-close' onClick={() => setShowShippingModal(false)}>
                <Text>✕</Text>
              </View>
            </View>

            <View className='modal-body'>
              <View className='form-section'>
                <Text className='form-label'>物流公司</Text>
                <ScrollView className='company-list' scrollY>
                  {LOGISTICS_COMPANIES.map((company) => (
                    <View
                      key={company}
                      className={`company-item ${selectedCompany === company ? 'selected' : ''}`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <Text className='company-name'>{company}</Text>
                      {selectedCompany === company && (
                        <View className='company-check'>✓</View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View className='form-section'>
                <Text className='form-label'>运单号</Text>
                <Input
                  className='tracking-input'
                  placeholder='请输入快递运单号'
                  value={trackingNumber}
                  onInput={(e) => setTrackingNumber(e.detail.value)}
                />
              </View>
            </View>

            <View className='modal-footer'>
              <View
                className={`modal-btn primary ${submitting ? 'disabled' : ''}`}
                onClick={handleShipSubmit}
              >
                <Text>{submitting ? '提交中...' : '确认发货'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showCancelModal && (
        <View className='modal-overlay' onClick={() => setShowCancelModal(false)}>
          <View className='modal-content' onClick={(e: any) => e.stopPropagation()}>
            <View className='modal-header'>
              <Text className='modal-title'>取消订单</Text>
              <View className='modal-close' onClick={() => setShowCancelModal(false)}>
                <Text>✕</Text>
              </View>
            </View>

            <View className='modal-body'>
              <View className='form-section'>
                <Text className='form-label'>请选择取消原因</Text>
                <View className='reason-list'>
                  {CANCEL_REASONS.map((reason) => (
                    <View
                      key={reason}
                      className={`reason-item ${cancelReason === reason ? 'selected' : ''}`}
                      onClick={() => {
                        setCancelReason(reason)
                        if (reason !== '其他原因') {
                          setCancelCustomReason('')
                        }
                      }}
                    >
                      <Text className='reason-text'>{reason}</Text>
                      {cancelReason === reason && (
                        <View className='reason-check'>✓</View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {cancelReason === '其他原因' && (
                <View className='form-section'>
                  <Text className='form-label'>请填写具体原因</Text>
                  <Input
                    className='tracking-input'
                    placeholder='请输入取消原因'
                    value={cancelCustomReason}
                    onInput={(e) => setCancelCustomReason(e.detail.value)}
                  />
                </View>
              )}
            </View>

            <View className='modal-footer'>
              <View className='modal-btn primary' onClick={handleCancelSubmit}>
                <Text>确认取消</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
