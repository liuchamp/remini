import { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { offerApi, type Offer } from '@/domains/trade/offer'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const STATUS_MAP: Record<string, string> = {
  pending: '等待回复',
  accepted: '已接受',
  rejected: '已拒绝',
  counter_offered: '已还价',
  withdrawn: '已撤回',
  expired: '已过期',
}

export default function Detail() {
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    const id = options?.id
    if (id) {
      loadOffer(id)
    }
  })

  const loadOffer = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await offerApi.getDetail(id)
      if (res.code === 0) {
        setOffer(res.data as Offer)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <Loading type='skeleton' rows={3} />
  }

  if (!offer) {
    return <Empty text='出价不存在' />
  }

  return (
    <ErrorBoundary>
      <View className='offer-detail-page'>
        <View className='offer-header'>
          <Text className='offer-title'>出价详情</Text>
          <View className='offer-status'>
            <Text>{STATUS_MAP[offer.status] || offer.status}</Text>
          </View>
        </View>
        <View className='offer-info'>
          <View className='info-row'>
            <Text className='info-label'>商品</Text>
            <Text className='info-value'>{offer.productTitle}</Text>
          </View>
          <View className='info-row'>
            <Text className='info-label'>出价金额</Text>
            <Text className='info-value offer-price'>¥{offer.amount.toFixed(2)}</Text>
          </View>
          {offer.note && (
            <View className='info-row'>
              <Text className='info-label'>备注</Text>
              <Text className='info-value'>{offer.note}</Text>
            </View>
          )}
          <View className='info-row'>
            <Text className='info-label'>出价时间</Text>
            <Text className='info-value'>{offer.createdAt}</Text>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  )
}
