import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Index() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPoints] = useState(0)

  useLoad(() => {
    setLoading(false)
  })

  if (loading) {
    return <Loading type='skeleton' rows={3} />
  }

  return (
    <ErrorBoundary>
      <View className='points-page'>
        <View className='points-header'>
          <Text className='points-total'>{totalPoints}</Text>
          <Text className='points-label'>当前积分</Text>
        </View>
        <ScrollView scrollY className='points-scroll'>
          {records.length > 0 ? (
            records.map((record) => (
              <View key={record.id} className='record-item'>
                <Text>{record.title}</Text>
                <Text>{record.points > 0 ? `+${record.points}` : record.points}</Text>
              </View>
            ))
          ) : (
            <Empty text='暂无积分记录' />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
