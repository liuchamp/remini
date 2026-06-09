import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { marketingApi, type ReferralInfo, type CommissionData } from '@/domains/marketing/api'
import { communityApi } from '@/domains/community/api'
import './index.scss'

export default function CreatorCenter() {
  const { t } = useTranslation(['community'])
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [commissionData, setCommissionData] = useState<CommissionData>({
    totalCommission: 0,
    availableCommission: 0,
    monthlyEstimate: 0,
    records: [],
  })

  useLoad(async () => {
    await loadReferralInfo()
    const res = await marketingApi.getCommissionData()
    if (res.code === 0) setCommissionData(res.data)
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
          <Text className='stat-label'>{t('creator.totalInvited')}</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{referralInfo?.totalRewards || 0}</Text>
          <Text className='stat-label'>{t('creator.totalRewards')}</Text>
        </View>
      </View>

      <View className='section'>
        <Text className='section-title'>{t('creator.leaderboard')}</Text>
        {referralInfo?.leaderboard.map((item) => (
          <View key={item.rank} className='leaderboard-item'>
            <Text className='rank'>#{item.rank}</Text>
            <Text className='name'>{item.name}</Text>
            <Text className='referrals'>{t('creator.personCount', { count: item.referrals })}</Text>
          </View>
        ))}
      </View>

      <View className='certification-section'>
        <Text className='section-title'>{t('community:creator.certification')}</Text>
        <View className='condition-list'>
          <View className='condition-item'>
            <Text>{t('community:creator.conditionFans')}: ≥ 100</Text>
          </View>
          <View className='condition-item'>
            <Text>{t('community:creator.conditionPosts')}: ≥ 20</Text>
          </View>
          <View className='condition-item'>
            <Text>{t('community:creator.conditionSales')}: ≥ ¥1000</Text>
          </View>
        </View>
        <View
          className='apply-btn'
          onClick={async () => {
            await communityApi.applyCreatorCertification({ reason: '' })
            Taro.showToast({ title: t('community:creator.applySuccess'), icon: 'success' })
          }}
        >
          <Text>{t('community:creator.applyCertification')}</Text>
        </View>
      </View>

      <View className='commission-section'>
        <Text className='section-title'>{t('community:creator.commissionData')}</Text>
        <View className='commission-summary'>
          <View className='summary-item'>
            <Text className='amount'>¥{commissionData.totalCommission.toFixed(2)}</Text>
            <Text className='label'>{t('community:creator.totalCommission')}</Text>
          </View>
          <View className='summary-item'>
            <Text className='amount'>¥{commissionData.availableCommission.toFixed(2)}</Text>
            <Text className='label'>{t('community:creator.availableCommission')}</Text>
          </View>
          <View className='summary-item'>
            <Text className='amount'>¥{commissionData.monthlyEstimate.toFixed(2)}</Text>
            <Text className='label'>{t('community:creator.monthlyEstimate')}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
