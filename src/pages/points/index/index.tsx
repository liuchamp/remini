import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { usePointsStore } from '@/domains/marketing/store'
import PointsFlow from '@/shared/components/marketing/PointsFlow'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Points() {
  const { t } = useTranslation(['marketing', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { pointsData, records, loading, loadPointsData, loadRecords } = usePointsStore()
  const [error, setError] = useState(false)
  
  useLoad(() => {
    loadData()
  })

  const loadData = async () => {
    setError(false)
    try {
      await loadPointsData()
      await loadRecords()
    } catch {
      setError(true)
    }
  }

  const refresh = () => {
    loadData()
  }
  
  const handleCategoryChange = (category: string) => {
    loadRecords(category === 'all' ? undefined : category)
  }
  
  if (loading) {
    return <Skeleton variant='card' count={3} />
  }

  if (error) {
    return <RetryButton onRetry={refresh} />
  }
  
  return (
    <ErrorBoundary>
      <View className='points-page'>
        <View className='points-header'>
          <Text className='points-total'>{pointsData?.totalPoints || 0}</Text>
          <Text className='points-label'>当前积分</Text>
        </View>
        
        <View className='points-stats'>
          <View className='stat-item'>
            <Text className='stat-value'>{pointsData?.todayEarned || 0}</Text>
            <Text className='stat-label'>今日获取</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{pointsData?.monthEarned || 0}</Text>
            <Text className='stat-label'>本月获取</Text>
          </View>
        </View>
        
        <PointsFlow records={records} onCategoryChange={handleCategoryChange} />
      </View>
    </ErrorBoundary>
  )
}
