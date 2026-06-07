import { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { shippingApi, TrackingInfo, TrackingEvent } from '@/domains/shipping/api'
import Loading from '@/shared/components/Loading'
import './index.scss'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待揽收', color: '#FF6B35' },
  picked_up: { label: '已揽收', color: '#4A90D9' },
  in_transit: { label: '运输中', color: '#4A90D9' },
  arrived: { label: '到达站点', color: '#07C160' },
  out_for_delivery: { label: '派送中', color: '#FF6B35' },
  delivered: { label: '已签收', color: '#07C160' },
  exception: { label: '异常', color: '#E02020' },
  returned: { label: '已退回', color: '#999' },
}

export default function Track() {
  const router = useRouter()
  const { t } = useTranslation('logistics')
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const orderId = router.params.orderId as string | undefined

  const loadTracking = useCallback(async (id: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    setError(false)
    try {
      const res = await shippingApi.getTracking(id)
      if (res.code === 0) {
        setTracking(res.data as TrackingInfo)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useLoad(() => {
    if (orderId) {
      loadTracking(orderId)
    } else {
      Taro.showToast({ title: t('loadFailed'), icon: 'none' })
      setLoading(false)
    }
  })

  const handleRefresh = () => {
    if (orderId) {
      setRefreshing(true)
      loadTracking(orderId, true)
    }
  }

  const handleCopyTrackingNumber = () => {
    if (!tracking) return
    Taro.setClipboardData({
      data: tracking.trackingNumber,
      success: () => {
        Taro.showToast({ title: t('copied'), icon: 'success' })
      },
      fail: () => {
        Taro.showToast({ title: t('copyFailed') || '复制失败', icon: 'none' })
      },
    })
  }

  const getStatusInfo = (status: string) => {
    return STATUS_MAP[status] || { label: status, color: '#999' }
  }

  const getStatusLabel = (status: string) => {
    const statusInfo = getStatusInfo(status)
    return t(`statusMap.${status}`) || statusInfo.label
  }

  if (loading) {
    return (
      <View className='track-page'>
        <ScrollView
          className='track-scroll'
          scrollY
          onScrollToLower={handleRefresh}
          lowerThreshold={100}
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherRefresh={handleRefresh}
          refresherBackground='#f5f5f5'
        >
          <Loading type='skeleton' rows={6} />
        </ScrollView>
      </View>
    )
  }

  if (error || !tracking) {
    return (
      <View className='track-page'>
        <ScrollView
          className='track-scroll'
          scrollY
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherRefresh={handleRefresh}
          refresherBackground='#f5f5f5'
        >
          <View className='track-error'>
            <Text className='track-error-icon'>!</Text>
            <Text className='track-error-text'>{t('loadFailed')}</Text>
            <View className='track-error-retry' onClick={() => orderId && loadTracking(orderId)}>
              <Text>{t('retry')}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  const statusInfo = getStatusInfo(tracking.status)
  const statusLabel = getStatusLabel(tracking.status)

  return (
    <View className='track-page'>
      <ScrollView
        className='track-scroll'
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        refresherBackground='#f5f5f5'
      >
        <View className='track-header-card'>
          <View className='track-status-row'>
            <View className='track-status-icon' style={{ backgroundColor: statusInfo.color }}>
              <Text className='track-status-icon-text'>{statusLabel.charAt(0)}</Text>
            </View>
            <View className='track-status-info'>
              <Text className='track-status-label' style={{ color: statusInfo.color }}>{statusLabel}</Text>
              <Text className='track-status-sub'>{t('status')}</Text>
            </View>
          </View>

          <View className='track-company-row'>
            <View className='track-company-icon'>
              <Text className='track-icon-text'>{t('carrier').charAt(0)}</Text>
            </View>
            <View className='track-company-info'>
              <Text className='track-company-name'>{tracking.company}</Text>
              <Text className='track-company-status'>{t('carrier')}</Text>
            </View>
          </View>

          <View className='track-number-row' onClick={handleCopyTrackingNumber}>
            <View className='track-number-left'>
              <Text className='track-number-label'>{t('trackingNumber')}</Text>
              <Text className='track-number-value'>{tracking.trackingNumber}</Text>
            </View>
            <View className='track-copy-hint'>
              <Text className='track-copy-text'>{t('copy')}</Text>
            </View>
          </View>
        </View>

        <View className='track-timeline'>
          {tracking.events.length > 0 ? (
            tracking.events.map((event: TrackingEvent, index: number) => {
              const isLatest = index === 0
              const eventStatusInfo = getStatusInfo(event.status)
              const eventStatusLabel = getStatusLabel(event.status)
              return (
                <View key={event.id} className={`track-event ${isLatest ? 'track-event-latest' : ''}`}>
                  <View className={`track-event-dot ${isLatest ? 'track-event-dot-latest' : ''}`} style={isLatest ? { backgroundColor: eventStatusInfo.color } : {}} />
                  {index < tracking.events.length - 1 && (
                    <View className='track-event-line' />
                  )}
                  <View className='track-event-content'>
                    <View className='track-event-header'>
                      <Text className={`track-event-status ${isLatest ? 'track-event-status-latest' : ''}`} style={isLatest ? { color: eventStatusInfo.color } : {}}>
                        {eventStatusLabel}
                      </Text>
                      <Text className={`track-event-time ${isLatest ? 'track-event-time-latest' : ''}`}>{event.time}</Text>
                    </View>
                    <Text className={`track-event-desc ${isLatest ? 'track-event-desc-latest' : ''}`}>{event.description}</Text>
                    {event.location && (
                      <Text className={`track-event-location ${isLatest ? 'track-event-location-latest' : ''}`}>
                        {t('events.location')}: {event.location}
                      </Text>
                    )}
                  </View>
                </View>
              )
            })
          ) : (
            <View className='track-empty'>
              <Text className='track-empty-text'>{t('noTracking')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
