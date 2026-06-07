import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Shop() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    setLoading(false)
  })

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  return (
    <ErrorBoundary>
      <View className='points-shop-page'>
        <ScrollView scrollY className='shop-scroll'>
          {items.length > 0 ? (
            items.map((item) => (
              <View key={item.id} className='shop-item'>
                <Image className='item-image' src={item.image} mode='aspectFill' lazyLoad />
                <Text className='item-title'>{item.title}</Text>
                <Text className='item-points'>{item.points} 积分</Text>
              </View>
            ))
          ) : (
            <Empty text='暂无兑换商品' />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
