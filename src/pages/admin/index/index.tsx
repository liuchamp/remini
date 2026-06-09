import { useState, useCallback, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/domains/admin/api'
import { useAuth } from '@/shared/hooks/useAuth'
import TrendChart from '../components/TrendChart'
import './index.scss'

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingProducts: number
  pendingWithdrawals: number
}

interface RecentActivity {
  id: string
  type: 'user_register' | 'product_created' | 'order_placed' | 'withdraw_request'
  content: string
  createdAt: string
}

interface TrendPoint {
  label: string
  value: number
}

export default function AdminIndex() {
  const { t } = useTranslation(['profile', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [orderTrend, setOrderTrend] = useState<TrendPoint[]>([])
  const [revenueTrend, setRevenueTrend] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const { requireAdmin } = useAuth()

  useEffect(() => {
    requireAdmin()
  }, [])

  useLoad(async () => {
    try {
      const res = await adminApi.getDashboard()
      if (res.code === 0 || res.code === 200) {
        setStats(res.data.stats)
        setRecentActivities(res.data.recentActivities || [])
        setOrderTrend(res.data.orderTrend || [])
        setRevenueTrend(res.data.revenueTrend || [])
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  })

  const navigateTo = useCallback((url: string) => {
    Taro.navigateTo({ url })
  }, [])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const h = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    return `${m}-${day} ${h}:${min}`
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    const icons: Record<string, string> = {
      user_register: '👤',
      product_created: '📦',
      order_placed: '🛒',
      withdraw_request: '💳',
    }
    return icons[type] || '📌'
  }

  if (loading) {
    return (
      <View className='admin-page'>
        <View className='loading-state'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='admin-page'>
      <View className='stats-grid'>
        <View className='stat-card users'>
          <Text className='stat-value'>{stats?.totalUsers ?? '--'}</Text>
          <Text className='stat-label'>用户总数</Text>
        </View>
        <View className='stat-card products'>
          <Text className='stat-value'>{stats?.totalProducts ?? '--'}</Text>
          <Text className='stat-label'>商品总数</Text>
        </View>
        <View className='stat-card orders'>
          <Text className='stat-value'>{stats?.totalOrders ?? '--'}</Text>
          <Text className='stat-label'>订单总数</Text>
        </View>
        <View className='stat-card revenue'>
          <Text className='stat-value'>
            ¥{stats?.totalRevenue?.toFixed(2) ?? '--'}
          </Text>
          <Text className='stat-label'>总收入</Text>
        </View>
      </View>

      <View className='quick-links'>
        <View
          className='quick-link-item'
          onClick={() => navigateTo('/pages/admin/users/index')}
        >
          <Text className='ql-icon'>👥</Text>
          <Text className='ql-title'>用户管理</Text>
          <Text className='ql-arrow'>›</Text>
        </View>
        <View
          className='quick-link-item'
          onClick={() => navigateTo('/pages/admin/reviews/index')}
        >
          <View className='ql-icon-wrap'>
            <Text className='ql-icon'>✅</Text>
            {stats && stats.pendingProducts > 0 && (
              <Text className='ql-badge'>{stats.pendingProducts}</Text>
            )}
          </View>
          <Text className='ql-title'>商品审核</Text>
          <Text className='ql-arrow'>›</Text>
        </View>
        <View
          className='quick-link-item'
          onClick={() => navigateTo('/pages/admin/withdrawals/index')}
        >
          <View className='ql-icon-wrap'>
            <Text className='ql-icon'>💳</Text>
            {stats && stats.pendingWithdrawals > 0 && (
              <Text className='ql-badge'>{stats.pendingWithdrawals}</Text>
            )}
          </View>
          <Text className='ql-title'>提现管理</Text>
          <Text className='ql-arrow'>›</Text>
        </View>
      </View>

      <View className='activity-section'>
        <Text className='section-title'>最近动态</Text>
        {recentActivities.length === 0 ? (
          <View className='empty-state'>
            <Text>暂无动态</Text>
          </View>
        ) : (
          <ScrollView className='activity-list' scrollY>
            {recentActivities.map(activity => (
              <View key={activity.id} className='activity-item'>
                <Text className='activity-icon'>
                  {getActivityIcon(activity.type)}
                </Text>
                <View className='activity-content'>
                  <Text className='activity-text'>{activity.content}</Text>
                  <Text className='activity-time'>
                    {formatTime(activity.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {orderTrend.length > 0 && (
        <TrendChart title={t('adminOrderTrend')} data={orderTrend} />
      )}
      {revenueTrend.length > 0 && (
        <TrendChart title={t('adminRevenueTrend')} data={revenueTrend} color='#4CAF50' />
      )}
    </View>
  )
}
