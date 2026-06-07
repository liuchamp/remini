import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { marketingApi, ReferralInfo } from '@/domains/marketing/api'
import './index.scss'

export default function CreatorCenter() {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)

  useLoad(() => {
    loadReferralInfo()
  })

  const loadReferralInfo = async () => {
    const res = await marketingApi.getReferralInfo()
    if (res.code === 0) setReferralInfo(res.data)
  }

  return (
    <View className='creator-center-page'>
      <View className='stats-section'>
        <View className='stat-item'>
          <Text className='stat-value'>{referralInfo?.totalReferrals || 0}</Text>
          <Text className='stat-label'>邀请人数</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{referralInfo?.totalRewards || 0}</Text>
          <Text className='stat-label'>累计奖励</Text>
        </View>
      </View>

      <View className='section'>
        <Text className='section-title'>邀请排行</Text>
        {referralInfo?.leaderboard.map((item) => (
          <View key={item.rank} className='leaderboard-item'>
            <Text className='rank'>#{item.rank}</Text>
            <Text className='name'>{item.name}</Text>
            <Text className='referrals'>{item.referrals} 人</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
