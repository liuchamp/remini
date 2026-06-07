import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '@/domains/trade/api'
import './index.scss'

export default function Pay() {
  const { t } = useTranslation(['trade', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [paying, setPaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    const orderId = router.params.orderId
    if (orderId) {
      loadOrder(orderId)
    } else {
      setLoading(false)
      Taro.showToast({ title: '参数错误', icon: 'none' })
    }
  })

  const loadOrder = async (id: string) => {
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

  const handlePay = async () => {
    if (!order || paying) return
    setPaying(true)
    try {
      const res = await tradeApi.getPaymentParams(order.id)
      if (res.code !== 0) {
        Taro.showToast({ title: res.message || '获取支付参数失败', icon: 'none' })
        setPaying(false)
        return
      }
      const params = res.data as { timeStamp: string; nonceStr: string; package: string; signType: string; paySign: string }
      await Taro.requestPayment({
        timeStamp: params.timeStamp,
        nonceStr: params.nonceStr,
        package: params.package,
        signType: params.signType as keyof Taro.requestPayment.SignType,
        paySign: params.paySign,
      })
      Taro.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/order/detail/index?id=${order.id}` })
      }, 1500)
    } catch (err: any) {
      if (err.errMsg?.includes('cancel')) {
        Taro.showToast({ title: '已取消支付', icon: 'none' })
      } else {
        Taro.showToast({ title: '支付失败', icon: 'none' })
      }
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <View className='pay-page'>
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!order) {
    return (
      <View className='pay-page'>
        <View className='error-container'>
          <Text>订单信息加载失败</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='pay-page'>
      <View className='pay-content'>
        <View className='amount-card'>
          <Text className='amount-label'>支付金额</Text>
          <Text className='amount-value'>
            <Text className='amount-symbol'>¥</Text>
            {order.finalAmount.toFixed(2)}
          </Text>
          <Text className='order-hint'>订单编号: {order.orderNo}</Text>
        </View>

        <View className='product-card'>
          <Image className='product-image' src={order.product.image} mode='aspectFill' />
          <View className='product-info'>
            <Text className='product-title' numberOfLines={2}>{order.product.title}</Text>
          </View>
        </View>

        <View className='pay-method-card'>
          <Text className='section-title'>支付方式</Text>
          <View className='pay-method-item selected'>
            <Image
              className='pay-icon'
              src='https://res.wx.qq.com/op_res/BkQmhxYMoGCAovjuVdJCbw8oagq7e3Ff3Cv3KLgz3dCRfLoBICzO3_No3wVXpr0g'
              mode='aspectFit'
            />
            <Text className='pay-method-label'>微信支付</Text>
            <Text className='pay-check'>✓</Text>
          </View>
        </View>
      </View>

      <View className='pay-footer'>
        <View className='pay-total'>
          <Text className='total-label'>合计: </Text>
          <Text className='total-amount'>¥{order.finalAmount.toFixed(2)}</Text>
        </View>
        <View
          className={`pay-btn ${paying ? 'disabled' : ''}`}
          onClick={handlePay}
        >
          <Text>{paying ? '支付中...' : '立即支付'}</Text>
        </View>
      </View>
    </View>
  )
}
