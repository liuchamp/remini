import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

interface UserProfile {
  id: string
  username: string
  avatar: string
  bio?: string
  trustScore: number
  isVerified: boolean
  productCount: number
  followerCount: number
  followingCount: number
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    const userId = options?.id
    if (userId) {
      loadProfile(userId)
    }
  })

  const loadProfile = async (userId: string) => {
    setLoading(true)
    try {
      const res = await Taro.request({
        url: `https://api.remx.com/users/${userId}`,
        method: 'GET',
      })
      if (res.data.code === 0) {
        setProfile(res.data.data as UserProfile)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  if (!profile) {
    return <Empty text='用户不存在' />
  }

  return (
    <ErrorBoundary>
      <View className='user-profile-page'>
        <View className='profile-header'>
          <Image className='profile-avatar' src={profile.avatar} mode='aspectFill' />
          <View className='profile-name-row'>
            <Text className='profile-username'>{profile.username}</Text>
            {profile.isVerified && <Text className='verified-badge'>✓</Text>}
          </View>
          <Text className='profile-trust'>信任分 {profile.trustScore}</Text>
          {profile.bio && <Text className='profile-bio'>{profile.bio}</Text>}
        </View>

        <View className='profile-stats'>
          <View className='stat-item'>
            <Text className='stat-value'>{profile.productCount}</Text>
            <Text className='stat-label'>商品</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{profile.followerCount}</Text>
            <Text className='stat-label'>粉丝</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{profile.followingCount}</Text>
            <Text className='stat-label'>关注</Text>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  )
}
