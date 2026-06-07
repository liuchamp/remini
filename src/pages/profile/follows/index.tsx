import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/domains/auth/store'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/domains/user/api'
import type { FollowUser } from '@/domains/user/types'
import './index.scss'

export default function Follows() {
  const { t } = useTranslation(['profile', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { isLoggedIn } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following')
  const [users, setUsers] = useState<FollowUser[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useLoad(() => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.navigateBack()
      return
    }
  })

  useEffect(() => {
    setUsers([])
    setPage(1)
    setHasMore(true)
    loadUsers(true)
  }, [activeTab])

  const loadUsers = async (refresh = false) => {
    const currentPage = refresh ? 1 : page
    setLoading(true)
    try {
      const res =
        activeTab === 'following'
          ? await userApi.getFollowing({ page: currentPage, limit: 20 })
          : await userApi.getFollowers({ page: currentPage, limit: 20 })

      if (res.code === 0) {
        setUsers(
          refresh ? res.data.users : [...users, ...res.data.users]
        )
        setHasMore(res.data.hasMore)
        setPage(currentPage + 1)
      }
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (userId: string) => {
    Taro.showModal({
      title: '提示',
      content: '确定要取消关注吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const apiRes = await userApi.unfollow(userId)
            if (apiRes.code === 0) {
              setUsers((prev) => prev.filter((u) => u.id !== userId))
              Taro.showToast({ title: '已取消关注', icon: 'success' })
            }
          } catch {
            /* handled by interceptor */
          }
        }
      },
    })
  }

  const handleUserClick = (userId: string) => {
    Taro.navigateTo({ url: `/pages/users/${userId}/index` })
  }

  const handleRefresh = () => {
    loadUsers(true)
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) loadUsers()
  }

  return (
    <View className='follows-page'>
      <View className='tab-bar'>
        <View
          className={`tab-item ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <Text>我关注的</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <Text>关注我的</Text>
        </View>
      </View>

      {loading && users.length === 0 ? (
        <View className='status-text'>加载中...</View>
      ) : users.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-icon'>👥</Text>
          <Text className='empty-text'>
            {activeTab === 'following' ? '还没有关注任何人' : '还没有粉丝'}
          </Text>
        </View>
      ) : (
        <ScrollView
          className='follows-scroll'
          scrollY
          refresherEnabled
          refresherTriggered={loading}
          onRefresherRefresh={handleRefresh}
          onScrollToLower={handleLoadMore}
          lowerThreshold={100}
        >
          {users.map((user) => (
            <View
              key={user.id}
              className='follow-card'
              onClick={() => handleUserClick(user.id)}
            >
              <Image
                className='follow-avatar'
                src={user.avatar}
                mode='aspectFill'
                lazyLoad
              />
              <View className='follow-info'>
                <View className='follow-name-row'>
                  <Text className='follow-name'>{user.username}</Text>
                  {user.isVerified && (
                    <Text className='verified-mark'>✓</Text>
                  )}
                </View>
                <Text className='follow-score'>信用 {user.trustScore}</Text>
              </View>
              {activeTab === 'following' && (
                <View
                  className='unfollow-btn'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnfollow(user.id)
                  }}
                >
                  <Text>已关注</Text>
                </View>
              )}
            </View>
          ))}
          {loading && <View className='loading-more'>加载中...</View>}
          {!hasMore && users.length > 0 && (
            <View className='no-more'>已经到底了</View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
