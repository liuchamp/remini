import { useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { offerApi } from '@/domains/trade/offer'
import './index.scss'

const TABS = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'accepted', label: '已接受' },
  { key: 'rejected', label: '已拒绝' },
]

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: '待处理', cls: 'pending' },
  accepted: { label: '已接受', cls: 'accepted' },
  rejected: { label: '已拒绝', cls: 'rejected' },
  countered: { label: '已还价', cls: 'countered' },
  withdrawn: { label: '已撤回', cls: 'expired' },
  expired: { label: '已过期', cls: 'expired' },
}

export default function OfferManage() {
  const { t } = useTranslation(['trade', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [activeTab, setActiveTab] = useState(0)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)

  // Counter dialog state
  const [counterVisible, setCounterVisible] = useState(false)
  const [counterOfferId, setCounterOfferId] = useState('')
  const [counterAmount, setCounterAmount] = useState('')
  const [counterSubmitting, setCounterSubmitting] = useState(false)

  const statusKey = TABS[activeTab].key

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await offerApi.getList({ type: 'received', status: statusKey || undefined })
      if (res.code === 0) {
        setOffers(res.data.list)
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [statusKey])

  useLoad(() => {
    fetchOffers()
  })

  const handleTabClick = (index: number) => {
    if (index === activeTab) return
    setActiveTab(index)
    setTimeout(() => fetchOffers(), 0)
  }

  const handleAccept = async (offerId: string) => {
    try {
      const res = await offerApi.accept(offerId)
      if (res.code === 0) {
        Taro.showToast({ title: '已接受出价', icon: 'success' })
        fetchOffers()
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleReject = async (offerId: string) => {
    const result = await Taro.showModal({
      title: '确认拒绝',
      content: '确定要拒绝这个出价吗？',
      confirmText: '拒绝',
      cancelText: '再想想',
      confirmColor: '#FF6B35',
    })
    if (!result.confirm) return
    try {
      const res = await offerApi.reject(offerId)
      if (res.code === 0) {
        Taro.showToast({ title: '已拒绝', icon: 'success' })
        fetchOffers()
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleCounterOpen = (offerId: string, currentAmount: number) => {
    setCounterOfferId(offerId)
    setCounterAmount(String(currentAmount))
    setCounterVisible(true)
  }

  const handleCounterSubmit = async () => {
    const amount = parseFloat(counterAmount)
    if (isNaN(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入有效的金额', icon: 'none' })
      return
    }
    setCounterSubmitting(true)
    try {
      const res = await offerApi.counter(counterOfferId, amount)
      if (res.code === 0) {
        Taro.showToast({ title: '还价已发送', icon: 'success' })
        setCounterVisible(false)
        fetchOffers()
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setCounterSubmitting(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
    const month = d.getMonth() + 1
    const day = d.getDate()
    return `${month}月${day}日`
  }

  const renderOfferActions = (offer: Offer) => {
    if (offer.status !== 'pending') return null
    return (
      <View className='offer-actions'>
        <View className='action-btn reject' onClick={() => handleReject(offer.id)}>
          拒绝
        </View>
        <View className='action-btn counter' onClick={() => handleCounterOpen(offer.id, offer.amount)}>
          还价
        </View>
        <View className='action-btn accept' onClick={() => handleAccept(offer.id)}>
          接受
        </View>
      </View>
    )
  }

  return (
    <View className='offer-manage-page'>
      {/* Tabs */}
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

      {/* Offer List */}
      <ScrollView className='offer-scroll' scrollY>
        {offers.length === 0 && !loading && (
          <View className='empty-state'>
            <Text className='empty-icon'>💬</Text>
            <Text className='empty-text'>暂无所选类型的出价</Text>
          </View>
        )}

        {offers.map((offer) => {
          const statusInfo = STATUS_CONFIG[offer.status] || { label: offer.status, cls: '' }
          return (
            <View key={offer.id} className='offer-card'>
              <View className='offer-header'>
                <View className={`offer-status ${statusInfo.cls}`}>
                  {statusInfo.label}
                </View>
                <Text className='offer-time'>{formatTime(offer.createdAt)}</Text>
              </View>

              <View className='offer-body'>
                <Image
                  className='product-thumb'
                  src={(offer as any).product?.image || (offer as any).productImage || ''}
                  mode='aspectFill'
                />
                <View className='offer-info'>
                  <Text className='product-title' numberOfLines={2}>
                    {(offer as any).product?.title || (offer as any).productTitle || ''}
                  </Text>
                  <View className='buyer-info'>
                    <View className='buyer-avatar' />
                    <Text className='buyer-name'>
                      {(offer as any).buyer?.username || (offer as any).buyerName || '匿名用户'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className='offer-amount-row'>
                <Text className='offer-amount'>
                  <Text className='symbol'>¥</Text>
                  {offer.amount.toFixed(2)}
                </Text>
                {(offer as any).counterAmount && (
                  <Text className='counter-info'>→ 还价 ¥{(offer as any).counterAmount.toFixed(2)}</Text>
                )}
              </View>

              {(offer as any).note && (
                <View className='offer-note'>
                  <Text className='label'>留言：</Text>
                  <Text>{(offer as any).note}</Text>
                </View>
              )}

              {renderOfferActions(offer)}
            </View>
          )
        })}

        {loading && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}
      </ScrollView>

      {/* Counter Dialog */}
      {counterVisible && (
        <View className='dialog-overlay' onClick={() => !counterSubmitting && setCounterVisible(false)}>
          <View className='dialog-box' onClick={(e) => e.stopPropagation()}>
            <Text className='dialog-title'>输入还价金额</Text>
            <View className='dialog-input-wrapper'>
              <Input
                className='dialog-input'
                type='digit'
                value={counterAmount}
                onInput={(e) => setCounterAmount(e.detail.value)}
                placeholder='请输入金额'
                focus
              />
            </View>
            <View className='dialog-actions'>
              <View
                className='dialog-btn cancel'
                onClick={() => !counterSubmitting && setCounterVisible(false)}
              >
                取消
              </View>
              <View
                className='dialog-btn confirm'
                onClick={handleCounterSubmit}
                style={{ opacity: counterSubmitting ? 0.6 : 1 }}
              >
                {counterSubmitting ? '发送中...' : '确定'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
