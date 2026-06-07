import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

const DASHBOARD_CARDS = [
  { key: 'onSale', icon: '📦', label: '在售商品', value: '0', color: '#FF6B35', bg: '#FFF0E8' },
  { key: 'pendingOffers', icon: '💬', label: '待处理出价', value: '0', color: '#FDCB6E', bg: '#FFF8E1' },
  { key: 'pendingOrders', icon: '📋', label: '待处理订单', value: '0', color: '#4A90D9', bg: '#E8F0FE' },
]

const QUICK_ACTIONS = [
  { icon: '➕', label: '发布商品', url: '/pages/publish/index' },
  { icon: '📦', label: '管理商品', url: '/pages/product/search/index?mine=1' },
  { icon: '💬', label: '管理出价', url: '/pages/offer/list/index' },
  { icon: '📋', label: '订单管理', url: '/pages/order/list/index' },
  { icon: '🚚', label: '发货管理', url: '/pages/logistics/track/index' },
  { icon: '📊', label: '数据统计', url: '' },
]

export default function SellerIndex() {
  const { user } = useAuthStore()

  useLoad(() => {
    console.log('seller/index loaded')
  })

  const handleAction = (url: string) => {
    if (!url) {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
      return
    }
    Taro.navigateTo({ url })
  }

  return (
    <ScrollView className='seller-page' scrollY>
      <View className='seller-header'>
        <View className='header-content'>
          <Text className='header-greeting'>卖家中心</Text>
          <Text className='header-subtitle'>
            {user ? `${user.username} · 欢迎回来` : '登录后管理您的商品'}
          </Text>
        </View>
      </View>

      <View className='dashboard-cards'>
        {DASHBOARD_CARDS.map((card) => (
          <View
            key={card.key}
            className='dashboard-card'
            style={{ backgroundColor: card.bg }}
          >
            <Text className='card-icon'>{card.icon}</Text>
            <Text className='card-value' style={{ color: card.color }}>{card.value}</Text>
            <Text className='card-label'>{card.label}</Text>
          </View>
        ))}
      </View>

      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>快捷操作</Text>
        </View>
        <View className='actions-grid'>
          {QUICK_ACTIONS.map((action, idx) => (
            <View
              key={idx}
              className='action-item'
              onClick={() => handleAction(action.url)}
            >
              <Text className='action-icon'>{action.icon}</Text>
              <Text className='action-label'>{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>数据概览</Text>
          <Text className='section-more'>{'> 全部'}</Text>
        </View>
        <View className='data-overview'>
          <View className='data-row'>
            <View className='data-item'>
              <Text className='data-value'>--</Text>
              <Text className='data-label'>今日访客</Text>
            </View>
            <View className='data-item'>
              <Text className='data-value'>--</Text>
              <Text className='data-label'>今日咨询</Text>
            </View>
            <View className='data-item'>
              <Text className='data-value'>--</Text>
              <Text className='data-label'>今日订单</Text>
            </View>
          </View>
          <View className='data-row'>
            <View className='data-item'>
              <Text className='data-value'>--</Text>
              <Text className='data-label'>曝光次数</Text>
            </View>
            <View className='data-item'>
              <Text className='data-value'>--</Text>
              <Text className='data-label'>收藏次数</Text>
            </View>
            <View className='data-item'>
              <Text className='data-value'>--</Text>
              <Text className='data-label'>转化率</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
