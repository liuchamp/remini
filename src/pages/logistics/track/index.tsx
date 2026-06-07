import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { shippingApi, TrackingInfo, TrackingEvent } from '@/domains/shipping/api'
import './index.scss'

export default function Track() {
  const router = useRouter()
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useLoad(() => {
    const orderId = router.params.orderId
    if (orderId) {
      loadTracking(orderId)
    } else {
      Taro.showToast({ title: '参数错误', icon: 'none' })
      setLoading(false)
    }
  })

  const loadTracking = async (orderId: string) => {
    setLoading(true)
    setError(false)
    try {
      const res = await shippingApi.getTracking(orderId)
      if (res.code === 0) {
        setTracking(res.data as TrackingInfo)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='track-page'>
        <View className='track-loading'>
          <Text className='track-loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (error || !tracking) {
    return (
      <View className='track-page'>
        <View className='track-error'>
          <Text className='track-error-icon'>!</Text>
          <Text className='track-error-text'>物流信息加载失败</Text>
          <View className='track-error-retry' onClick={() => {
            const orderId = router.params.orderId
            if (orderId) loadTracking(orderId)
          }}>
            <Text>重新加载</Text>
          </View>
        </View>
      </View>
    )
  }

  const latestEvent = tracking.events[0]
  const pastEvents = tracking.events.slice(1)

  return (
    <View className='track-page'>
      <View className='track-header-card'>
        <View className='track-company-row'>
          <View className='track-company-icon'>
            <Text className='track-icon-text'>运</Text>
          </View>
          <View className='track-company-info'>
            <Text className='track-company-name'>{tracking.company}</Text>
            <Text className='track-company-status'>{tracking.status}</Text>
          </View>
        </View>
        <View className='track-number-row'>
          <Text className='track-number-label'>运单编号</Text>
          <Text className='track-number-value'>{tracking.trackingNumber}</Text>
        </View>
      </View>

      <View className='track-timeline'>
        {latestEvent && (
          <View className='track-event track-event-latest'>
            <View className='track-event-dot track-event-dot-latest' />
            <View className='track-event-content'>
              <View className='track-event-header'>
                <Text className='track-event-status track-event-status-latest'>{latestEvent.status}</Text>
                <Text className='track-event-time track-event-time-latest'>{latestEvent.time}</Text>
              </View>
              <Text className='track-event-desc track-event-desc-latest'>{latestEvent.description}</Text>
              {latestEvent.location && (
                <Text className='track-event-location track-event-location-latest'>{latestEvent.location}</Text>
              )}
            </View>
          </View>
        )}

        {pastEvents.map((event: TrackingEvent) => (
          <View className='track-event' key={event.id}>
            <View className='track-event-dot' />
            <View className='track-event-line' />
            <View className='track-event-content'>
              <View className='track-event-header'>
                <Text className='track-event-status'>{event.status}</Text>
                <Text className='track-event-time'>{event.time}</Text>
              </View>
              <Text className='track-event-desc'>{event.description}</Text>
              {event.location && (
                <Text className='track-event-location'>{event.location}</Text>
              )}
            </View>
          </View>
        ))}

        {tracking.events.length === 0 && (
          <View className='track-empty'>
            <Text className='track-empty-text'>暂无物流轨迹</Text>
          </View>
        )}
      </View>
    </View>
  )
}
