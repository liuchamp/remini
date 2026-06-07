import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TABS = [
  { key: 'active', label: '可用' },
  { key: 'used', label: '已用' },
  { key: 'expired', label: '过期' },
]

export default function List() {
  const [activeTab, setActiveTab] = useState(0)
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    setLoading(false)
  })

  if (loading) {
    return <Loading type='skeleton' rows={3} />
  }

  return (
    <ErrorBoundary>
      <View className='coupon-list-page'>
        <View className='tab-bar'>
          {TABS.map((tab, idx) => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              <Text className='tab-label'>{tab.label}</Text>
            </View>
          ))}
        </View>
        <ScrollView scrollY className='coupon-scroll'>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <View key={coupon.id} className='coupon-card'>
                <Text>{coupon.title}</Text>
              </View>
            ))
          ) : (
            <Empty text='暂无优惠券' />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
