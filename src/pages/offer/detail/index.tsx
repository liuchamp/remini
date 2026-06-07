import { useState, useCallback } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { offerApi, type Offer } from '@/domains/trade/offer'
import { useAuthStore } from '@/domains/auth/store'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const STATUS_MAP: Record<string, string> = {
  pending: '等待回复',
  accepted: '已接受',
  rejected: '已拒绝',
  countered: '已还价',
  withdrawn: '已撤回',
  expired: '已过期',
}

export default function Detail() {
  const { t } = useTranslation(['trade', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')

  const user = useAuthStore(state => state.user)
  const currentUserId = user?.id

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

  const handleAction = useCallback(async (action: 'accept' | 'reject' | 'withdraw' | 'counter') => {
    if (!offer || submitting) return
    setSubmitting(true)
    try {
      if (action === 'accept') {
        await offerApi.accept(offer.id)
        Taro.showToast({ title: '已接受', icon: 'success' })
      } else if (action === 'reject') {
        await offerApi.reject(offer.id)
        Taro.showToast({ title: '已拒绝', icon: 'success' })
      } else if (action === 'withdraw') {
        await offerApi.withdraw(offer.id)
        Taro.showToast({ title: '已撤回', icon: 'success' })
      } else if (action === 'counter') {
        const num = parseFloat(counterPrice)
        if (isNaN(num) || num <= 0) {
          Taro.showToast({ title: '请输入有效还价金额', icon: 'none' })
          setSubmitting(false)
          return
        }
        await offerApi.counter(offer.id, num)
        Taro.showToast({ title: '已发起还价', icon: 'success' })
        setCounterOpen(false)
        setCounterPrice('')
      }
      // 刷新详情
      loadOffer(offer.id)
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }, [offer, submitting, counterPrice, loadOffer])

  if (loading) {
    return <Loading type='skeleton' rows={3} />
  }

  if (!offer) {
    return <Empty text='出价不存在' />
  }

  const isBuyer = currentUserId === offer.buyerId
  const isSeller = currentUserId === offer.sellerId

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
          {offer.counterAmount && (
            <View className='info-row'>
              <Text className='info-label'>还价金额</Text>
              <Text className='info-value counter-price'>¥{offer.counterAmount.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* 底部操作栏 */}
        <View className='offer-action-bar'>
          {isBuyer && offer.status === 'pending' && (
            <Button
              className='action-btn withdraw'
              onClick={() => handleAction('withdraw')}
              loading={submitting}
            >
              撤回出价
            </Button>
          )}
          {isSeller && offer.status === 'pending' && (
            <View className='btn-group'>
              <Button className='action-btn reject' onClick={() => handleAction('reject')}>拒绝</Button>
              <Button className='action-btn counter' onClick={() => setCounterOpen(true)}>还价</Button>
              <Button className='action-btn accept' onClick={() => handleAction('accept')}>接受</Button>
            </View>
          )}
          {isBuyer && offer.status === 'countered' && (
            <View className='btn-group'>
              <Button className='action-btn reject' onClick={() => handleAction('reject')}>拒绝还价</Button>
              <Button className='action-btn counter' onClick={() => {
                setCounterPrice(offer.counterAmount ? String(offer.counterAmount) : '')
                setCounterOpen(true)
              }}>再次出价</Button>
              <Button className='action-btn accept' onClick={() => handleAction('accept')}>接受还价</Button>
            </View>
          )}
        </View>

        {/* 还价输入 Modal */}
        {counterOpen && (
          <View className='counter-modal-overlay' onClick={() => setCounterOpen(false)}>
            <View className='counter-modal' onClick={e => e.stopPropagation()}>
              <Text className='modal-title'>发起还价金额</Text>
              <Input
                type='digit'
                placeholder='输入价格'
                value={counterPrice}
                onInput={e => setCounterPrice(e.detail.value)}
              />
              <View className='modal-btns'>
                <Button onClick={() => setCounterOpen(false)}>取消</Button>
                <Button type='primary' onClick={() => handleAction('counter')}>提交</Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </ErrorBoundary>
  )
}
