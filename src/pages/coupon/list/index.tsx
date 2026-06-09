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
  const { coupons, templates, activeTab, loading, loadCoupons, loadTemplates, useCoupon, claimCoupon } = useCouponStore()
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
    loadTemplates()
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
        {templates.length > 0 && (
          <View className='claim-section'>
            <Text className='section-title'>{t('marketing:coupon.claimCenter')}</Text>
            <ScrollView scrollX className='claim-scroll'>
              {templates.map((tpl) => (
                <View key={tpl.id} className='coupon-template-card'>
                  <View className='template-info'>
                    <Text className='template-name'>{tpl.name}</Text>
                    <Text className='template-discount'>
                      {tpl.type === '折扣' ? `${tpl.discount}折` : `¥${tpl.discount}`}
                    </Text>
                    <Text className='template-condition'>
                      {t('marketing:coupon.minAmount', { amount: tpl.minAmount })}
                    </Text>
                    <Text className='template-remaining'>
                      {tpl.remaining > 0
                        ? t('marketing:coupon.remaining', { count: tpl.remaining })
                        : t('marketing:coupon.claimed')}
                    </Text>
                  </View>
                  <View
                    className={`claim-btn ${tpl.remaining <= 0 ? 'disabled' : ''}`}
                    onClick={async () => {
                      if (tpl.remaining <= 0) return
                      await claimCoupon(tpl.id)
                      Taro.showToast({ title: t('marketing:coupon.claimSuccess'), icon: 'success' })
                    }}
                  >
                    <Text>{tpl.remaining > 0 ? t('marketing:coupon.claim') : t('marketing:coupon.soldOut')}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

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
