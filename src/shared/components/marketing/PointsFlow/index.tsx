import { View, Text, ScrollView } from '@tarojs/components'
import type { PointsRecord } from '@/domains/marketing/types'
import Empty from '@/shared/components/Empty'
import './index.scss'

interface PointsFlowProps {
  records: PointsRecord[]
  onCategoryChange?: (category: string) => void
}

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'checkin', label: '签到' },
  { key: 'order', label: '订单' },
  { key: 'invite', label: '邀请' },
  { key: 'exchange', label: '兑换' },
]

export default function PointsFlow({ records, onCategoryChange }: PointsFlowProps) {
  return (
    <View className='points-flow'>
      <View className='category-bar'>
        {CATEGORIES.map((category) => (
          <View
            key={category.key}
            className='category-item'
            onClick={() => onCategoryChange?.(category.key)}
          >
            <Text className='category-text'>{category.label}</Text>
          </View>
        ))}
      </View>
      
      <ScrollView scrollY className='records-list'>
        {records.length > 0 ? (
          records.map((record) => (
            <View key={record.id} className='record-item'>
              <View className='record-info'>
                <Text className='record-title'>{record.title}</Text>
                <Text className='record-time'>{record.createdAt}</Text>
              </View>
              <Text className={`record-points ${record.points > 0 ? 'positive' : 'negative'}`}>
                {record.points > 0 ? '+' : ''}{record.points}
              </Text>
            </View>
          ))
        ) : (
          <Empty text='暂无积分记录' />
        )}
      </ScrollView>
    </View>
  )
}
