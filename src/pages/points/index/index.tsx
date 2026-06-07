import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { usePointsStore } from '@/domains/marketing/store'
import PointsFlow from '@/shared/components/marketing/PointsFlow'
import Loading from '@/shared/components/Loading'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Points() {
  const { pointsData, records, loading, loadPointsData, loadRecords } = usePointsStore()
  
  useLoad(() => {
    loadPointsData()
    loadRecords()
  })
  
  const handleCategoryChange = (category: string) => {
    loadRecords(category === 'all' ? undefined : category)
  }
  
  if (loading) {
    return <Loading type='skeleton' rows={3} />
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
