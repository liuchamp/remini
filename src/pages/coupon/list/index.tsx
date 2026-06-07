import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useCouponStore } from '@/domains/marketing/store'
import CouponCard from '@/shared/components/marketing/CouponCard'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TABS = [
  { key: 'active', label: '可用' },
  { key: 'used', label: '已用' },
  { key: 'expired', label: '过期' },
]

export default function CouponList() {
  const { t } = useTranslation(['marketing', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { coupons, activeTab, loading, loadCoupons, useCoupon } = useCouponStore()

  useLoad(() => {
    loadCoupons('active')
  })

  const handleTabChange = (tab: string) => {
    loadCoupons(tab)
  }

  const handleUse = async (couponId: string) => {
    try {
      await useCoupon(couponId)
      Taro.showToast({
        title: '使用成功',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '使用失败',
        icon: 'none'
      })
    }
  }

  if (loading) {
    return <Loading type='skeleton' rows={3} />
  }

  return (
    <ErrorBoundary>
      <View className='coupon-page'>
        <View className='tab-bar'>
          {TABS.map((tab) => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <Text className='tab-label'>{tab.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView scrollY className='coupon-list'>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} onUse={handleUse} />
            ))
          ) : (
            <Empty text='暂无优惠券' />
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
