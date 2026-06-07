import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { kycApi } from '@/domains/kyc/api'
import { useAuthStore } from '@/domains/auth/store'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import type { KycTier } from '@/domains/kyc/types'
import './index.scss'

const TIER_CONFIG = [
  { level: 'L0' as KycTier, label: 'L0-基础认证', desc: '手机号验证', color: '#B2BEC3' },
  { level: 'L1' as KycTier, label: 'L1-初级认证', desc: '身份证信息认证', color: '#74B9FF' },
  { level: 'L2' as KycTier, label: 'L2-中级认证', desc: '活体检测', color: '#FDCB6E' },
  { level: 'L3' as KycTier, label: 'L3-高级认证', desc: '完成全部认证', color: '#00B894' }
]

const TIER_ORDER: KycTier[] = ['L0', 'L1', 'L2', 'L3']

const TIER_TO_PATH: Record<string, string> = {
  phone: '/pages/kyc/phone/index',
  identity: '/pages/kyc/identity/index',
  liveness: '/pages/kyc/liveness/index'
}

export default function Index() {
  const { t } = useTranslation(['kyc', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentTier, setCurrentTier] = useState<KycTier | null>(null)
  const [nextStep, setNextStep] = useState<string | null>(null)

  const updateUser = useAuthStore((s) => s.updateUser)

  useLoad(() => {
    loadKycStatus()
  })

  async function loadKycStatus() {
    setLoading(true)
    setError(false)
    try {
      const res = await kycApi.getStatus()
      if (res.code === 0) {
        setCurrentTier(res.data.currentTier)
        setNextStep(res.data.nextStep)
        updateUser({ currentKycTier: res.data.currentTier })
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadKycStatus()
  }

  function getTierState(tier: KycTier): 'completed' | 'current' | 'locked' {
    if (!currentTier) return 'locked'
    const currentIndex = TIER_ORDER.indexOf(currentTier)
    const tierIndex = TIER_ORDER.indexOf(tier)

    if (tierIndex < currentIndex) return 'completed'
    if (tierIndex === currentIndex) {
      if (currentTier === 'L3' && nextStep === null) return 'completed'
      return 'current'
    }
    return 'locked'
  }

  function handleAction() {
    if (nextStep) {
      const path = TIER_TO_PATH[nextStep]
      if (path) {
        Taro.navigateTo({ url: path })
      }
    }
  }

  if (loading) {
    return (
      <View className='kyc-page'>
        <Skeleton type='detail' rows={5} />
      </View>
    )
  }

  if (error) {
    return (
      <View className='kyc-page'>
        <RetryButton onRetry={refresh} />
      </View>
    )
  }

  return (
    <View className='kyc-page'>
      <View className='current-tier'>
        <Text className='current-tier-label'>当前认证等级</Text>
        <Text className='current-tier-value'>{currentTier || 'L0'}</Text>
      </View>

      <View className='tier-list'>
        {TIER_CONFIG.map((tier) => {
          const state = getTierState(tier.level)
          const isCompleted = state === 'completed'
          const isCurrent = state === 'current'
          const isLocked = state === 'locked'
          const tierColor = isLocked ? '#B2BEC3' : tier.color

          return (
            <View
              key={tier.level}
              className='tier-item'
              style={{ borderLeftColor: tierColor }}
            >
              <View
                className='tier-indicator'
                style={{ backgroundColor: tierColor }}
              >
                <Text className='tier-indicator-text'>
                  {isCompleted ? '✓' : tier.level.replace('L', '')}
                </Text>
              </View>

              <View className='tier-info'>
                <Text
                  className='tier-label'
                  style={{ color: isLocked ? '#B2BEC3' : '#2D3436' }}
                >
                  {tier.label}
                </Text>
                <Text className='tier-desc'>{tier.desc}</Text>
              </View>

              {isCompleted && (
                <View className='tier-badge tier-badge-completed'>已完成</View>
              )}

              {isCurrent && nextStep && (
                <View className='tier-action' onClick={handleAction}>
                  去认证
                </View>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}
