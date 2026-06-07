import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

const KYC_TIER_MAP: Record<string, { label: string; color: string }> = {
  L0: { label: '未认证', color: '#B2BEC3' },
  L1: { label: 'L1 已认证', color: '#00B894' },
  L2: { label: 'L2 已认证', color: '#4A90D9' },
  L3: { label: 'L3 已认证', color: '#FF6B35' },
}

const MENU_ITEMS = [
  { icon: '📦', label: '我的商品', url: '/pages/product/search/index?mine=1' },
  { icon: '❤️', label: '我的收藏', url: '/pages/product/search/index?fav=1' },
  { icon: '👥', label: '我的关注', url: '/pages/user/profile/index?follows=1' },
  { icon: '💬', label: '我的出价', url: '/pages/offer/list/index' },
  { icon: '💰', label: '钱包', url: '/pages/wallet/index/index' },
  { icon: '🪪', label: '实名认证', url: '/pages/kyc/index/index' },
]

export default function Profile() {
  const { user, isLoggedIn, logout } = useAuthStore()

  useLoad(() => {
    console.log('profile/index loaded')
  })

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/auth/login/index' })
  }

  const handleMenuClick = (url: string) => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/auth/login/index' })
      return
    }
    Taro.navigateTo({ url })
  }

  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index/index' })
  }

  const handleSellerCenter = () => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/auth/login/index' })
      return
    }
    Taro.navigateTo({ url: '/pages/seller/index/index' })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) logout()
      }
    })
  }

  const getTierInfo = () => {
    if (!user) return KYC_TIER_MAP.L0
    return KYC_TIER_MAP[user.currentKycTier] || KYC_TIER_MAP.L0
  }

  const tierInfo = getTierInfo()

  const trustPercent = user ? Math.min(user.trustScore, 100) : 0
  const trustColor = trustPercent >= 80 ? '#00B894' : trustPercent >= 50 ? '#FDCB6E' : '#E17055'

  const stats = [
    { label: '商品', value: '--' },
    { label: '收藏', value: '--' },
    { label: '关注', value: '--' },
  ]

  return (
    <ScrollView className='profile-page' scrollY>
      <View className='user-card'>
        {isLoggedIn && user ? (
          <>
            <View className='user-info-top'>
              <Image className='user-avatar' src={user.avatar} mode='aspectFill' />
              <View className='user-meta'>
                <Text className='user-name'>{user.username}</Text>
                <View className='user-tags'>
                  <View className='kyc-badge' style={{ backgroundColor: tierInfo.color + '20', color: tierInfo.color }}>
                    <Text>{tierInfo.label}</Text>
                  </View>
                  {user.isVerified && (
                    <View className='verified-badge'>
                      <Text>✓ 已认证</Text>
                    </View>
                  )}
                </View>
                <View className='trust-score-row'>
                  <Text className='trust-label'>信用分</Text>
                  <View className='trust-bar-bg'>
                    <View
                      className='trust-bar-fill'
                      style={{ width: `${trustPercent}%`, backgroundColor: trustColor }}
                    />
                  </View>
                  <Text className='trust-value' style={{ color: trustColor }}>{user.trustScore}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View className='user-info-top' onClick={handleLogin}>
            <View className='avatar-placeholder'>
              <Text className='avatar-placeholder-text'>R</Text>
            </View>
            <View className='user-meta'>
              <Text className='user-name'>点击登录</Text>
              <Text className='user-subtitle'>登录后享受更多功能</Text>
            </View>
          </View>
        )}

        <View className='stats-row'>
          {stats.map((stat, idx) => (
            <View key={idx} className='stat-item'>
              <Text className='stat-value'>{stat.value}</Text>
              <Text className='stat-label'>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {isLoggedIn && (
        <View className='seller-entry' onClick={handleSellerCenter}>
          <View className='seller-entry-left'>
            <Text className='seller-icon'>🏪</Text>
            <Text className='seller-text'>卖家中心</Text>
          </View>
          <Text className='entry-arrow'>›</Text>
        </View>
      )}

      <View className='menu-grid'>
        {MENU_ITEMS.map((item, idx) => (
          <View
            key={idx}
            className='menu-item'
            onClick={() => handleMenuClick(item.url)}
          >
            <Text className='menu-icon'>{item.icon}</Text>
            <Text className='menu-label'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='bottom-actions'>
        <View className='action-item' onClick={handleSettings}>
          <Text className='action-icon'>⚙️</Text>
          <Text className='action-label'>设置</Text>
          <Text className='action-arrow'>›</Text>
        </View>
        {isLoggedIn && (
          <View className='action-item logout' onClick={handleLogout}>
            <Text className='action-icon'>🚪</Text>
            <Text className='action-label'>退出登录</Text>
            <Text className='action-arrow'>›</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
