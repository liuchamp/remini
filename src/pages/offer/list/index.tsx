import { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { offerApi, type Offer } from '@/domains/trade/offer'
import { useTranslation } from 'react-i18next'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TAB_KEYS = ['sent', 'received']

export default function List() {
  const { t } = useTranslation(['trade', 'common'])
  const [activeTab, setActiveTab] = useState(0)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    fetchOffers()
  })

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await offerApi.getList({ type: TAB_KEYS[activeTab] as 'sent' | 'received' })
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
          {TAB_KEYS.map((key, idx) => (
            <View
              key={key}
              className={`tab-item ${activeTab === idx ? 'active' : ''}`}
              onClick={() => { setActiveTab(idx); fetchOffers() }}
            >
              <Text className='tab-label'>{key === 'sent' ? t('trade:offerSent') : t('trade:offerReceived')}</Text>
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
            <Empty text={t('trade:offerEmpty')} />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
