import { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { offerApi, type Offer } from '@/domains/trade/offer'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TABS = [
  { key: 'sent', label: '发出的' },
  { key: 'received', label: '收到的' },
]

export default function List() {
  const [activeTab, setActiveTab] = useState(0)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    fetchOffers()
  })

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await offerApi.getList({ type: TABS[activeTab].key as 'sent' | 'received' })
      if (res.code === 0) {
        const data = res.data as { list: Offer[]; total: number }
        setOffers(data.list || [])
      }
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  return (
    <ErrorBoundary>
      <View className='offer-list-page'>
        <View className='tab-bar'>
          {TABS.map((tab, idx) => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === idx ? 'active' : ''}`}
              onClick={() => { setActiveTab(idx); fetchOffers() }}
            >
              <Text className='tab-label'>{tab.label}</Text>
            </View>
          ))}
        </View>
        <ScrollView scrollY className='offer-scroll'>
          {offers.length > 0 ? (
            offers.map((offer) => (
              <View key={offer.id} className='offer-card'>
                <Text>{offer.productTitle}</Text>
                <Text>¥{offer.amount.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Empty text='暂无出价' />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
