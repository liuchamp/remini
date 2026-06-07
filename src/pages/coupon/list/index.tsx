import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useState, useCallback } from 'react'
import { useCouponStore } from '@/domains/marketing/store'
import CouponCard from '@/shared/components/marketing/CouponCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
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
  const [error, setError] = useState(false)

  const loadWithErrorHandling = useCallback(async (tab: string) => {
    setError(false)
    try {
      await loadCoupons(tab)
    } catch {
      setError(true)
    }
  }, [loadCoupons])

  const refresh = useCallback(() => {
    loadWithErrorHandling(activeTab)
  }, [activeTab, loadWithErrorHandling])

  useLoad(() => {
    loadWithErrorHandling('active')
  })

  const handleTabChange = (tab: string) => {
    loadWithErrorHandling(tab)
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

  if (loading && coupons.length === 0) {
    return <Skeleton type='card' rows={3} />
  }

  if (error) {
    return <RetryButton onRetry={refresh} />
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
