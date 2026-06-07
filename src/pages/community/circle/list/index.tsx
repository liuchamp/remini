import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { communityApi } from '@/domains/community/api'
import Empty from '@/shared/components/Empty'
import './index.scss'

export default function CircleList() {
  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    loadCircles()
  })

  const loadCircles = async () => {
    setLoading(true)
    try {
      const res = await communityApi.getCircles()
      if (res.code === 0) setCircles(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='circle-list-page'>
      {circles.length === 0 && !loading ? (
        <Empty text='暂无圈子' />
      ) : (
        <View className='circle-list'>
          {circles.map((c) => (
            <View
              key={c.id}
              className='circle-card'
              onClick={() => Taro.navigateTo({ url: `/pages/community/circle/detail/index?id=${c.id}` })}
            >
              <Image className='circle-avatar' src={c.avatar} mode='aspectFill' lazyLoad />
              <View className='circle-info'>
                <Text className='circle-name'>{c.name}</Text>
                <Text className='circle-members'>{c.memberCount} 成员</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
