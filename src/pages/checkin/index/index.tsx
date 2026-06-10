import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useCheckinStore } from '@/domains/marketing/store'
import CheckinCalendar from '@/shared/components/marketing/CheckinCalendar'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Checkin() {
  const { t } = useTranslation(['marketing', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { checkinData, loading, loadCheckinData, checkin } = useCheckinStore()
  const [error, setError] = useState(false)

  useLoad(() => {
    loadData()
  })

  const loadData = async () => {
    setError(false)
    try {
      await loadCheckinData()
    } catch {
      setError(true)
    }
  }

  const refresh = () => {
    loadData()
  }

  const handleCheckin = async () => {
    try {
      const result = await checkin()
      if (result) {
        Taro.showToast({
          title: `签到成功 +${result.points}积分`,
          icon: 'success'
        })
      }
    } catch (error) {
      Taro.showToast({
        title: '签到失败',
        icon: 'none'
      })
    }
  }

  if (loading) {
    return <Skeleton variant='card' count={3} />
  }

  if (error) {
    return <RetryButton onRetry={refresh} />
  }

  return (
    <ErrorBoundary>
      <View className='checkin-page'>
        <View className='header'>
          <Text className='title'>每日签到</Text>
          <Text className='subtitle'>签到获取积分，连续签到更多奖励</Text>
        </View>

        {checkinData && (
          <CheckinCalendar
            checkinDays={checkinData.checkinDays}
            continuousDays={checkinData.continuousDays}
            todayChecked={checkinData.todayChecked}
            onCheckin={handleCheckin}
          />
        )}

        <View className='rewards-section'>
          <Text className='section-title'>签到奖励</Text>
          <View className='rewards-grid'>
            <View className='reward-item'>
              <Text className='reward-value'>{checkinData?.rewards.base || 10}</Text>
              <Text className='reward-label'>基础积分</Text>
            </View>
            <View className='reward-item'>
              <Text className='reward-value'>+{checkinData?.rewards.continuous || 5}</Text>
              <Text className='reward-label'>连续奖励</Text>
            </View>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  )
}
