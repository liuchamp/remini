import { useState, useCallback, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useReachBottom } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/domains/admin/api'
import { useAuth } from '@/shared/hooks/useAuth'
import './index.scss'

interface UserItem {
  id: string
  username: string
  avatar?: string
  phone?: string
  status: 'active' | 'banned' | 'inactive'
  createdAt: string
  productCount?: number
  orderCount?: number
}

export default function AdminUsers() {
  const { t } = useTranslation(['profile', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [users, setUsers] = useState<UserItem[]>([])
  const [keyword, setKeyword] = useState('')
  const { requireAdmin } = useAuth()

  useEffect(() => {
    requireAdmin()
  }, [])
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  const loadUsers = useCallback(async (pageNum: number, filter: string, query: string, reset: boolean = false) => {
    setLoading(true)
    try {
      const params: any = { page: pageNum }
      if (query) params.keyword = query
      if (filter) params.status = filter
      const res = await adminApi.getUsers(params)
      if (res.code === 0 || res.code === 200) {
        const list = res.data.users || []
        setUsers(prev => reset ? list : [...prev, ...list])
        setTotal(res.data.total ?? 0)
        setHasMore(list.length >= 20)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [])

  useLoad(() => {
    loadUsers(1, statusFilter, searchText, true)
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadUsers(nextPage, statusFilter, searchText)
    }
  })

  const handleSearch = () => {
    setSearchText(keyword)
    setPage(1)
    loadUsers(1, statusFilter, keyword, true)
  }

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter)
    setPage(1)
    loadUsers(1, filter, searchText, true)
  }

  const handleBanToggle = async (user: UserItem) => {
    try {
      const action = user.status === 'banned' ? adminApi.unbanUser : adminApi.banUser
      const res = await action(user.id)
      if (res.code === 0 || res.code === 200) {
        Taro.showToast({
          title: user.status === 'banned' ? '已解封' : '已封禁',
          icon: 'success'
        })
        loadUsers(1, statusFilter, searchText, true)
      }
    } catch (err) {
      console.error('Failed to toggle user ban:', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const getStatusLabel = (status: UserItem['status']) => {
    const map: Record<string, string> = {
      active: '正常',
      banned: '封禁',
      inactive: '未激活',
    }
    return map[status] || status
  }

  const getStatusClass = (status: UserItem['status']) => {
    return `status-badge status-${status}`
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
  }

  return (
    <View className='users-page'>
      <View className='search-bar'>
        <Input
          className='search-input'
          placeholder='搜索用户名或手机号'
          value={keyword}
          onInput={e => setKeyword(e.detail.value)}
          onConfirm={handleSearch}
          confirmType='search'
        />
        <Text className='search-btn' onClick={handleSearch}>搜索</Text>
      </View>

      <View className='filter-bar'>
        <View
          className={`filter-item ${statusFilter === '' ? 'active' : ''}`}
          onClick={() => handleFilterChange('')}
        >
          <Text>全部</Text>
        </View>
        <View
          className={`filter-item ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => handleFilterChange('active')}
        >
          <Text>正常</Text>
        </View>
        <View
          className={`filter-item ${statusFilter === 'banned' ? 'active' : ''}`}
          onClick={() => handleFilterChange('banned')}
        >
          <Text>封禁</Text>
        </View>
        <View
          className={`filter-item ${statusFilter === 'inactive' ? 'active' : ''}`}
          onClick={() => handleFilterChange('inactive')}
        >
          <Text>未激活</Text>
        </View>
      </View>

      <View className='user-count'>
        <Text>共 {total} 个用户</Text>
      </View>

      <ScrollView className='user-list' scrollY>
        {users.length === 0 && !loading && (
          <View className='empty-state'>
            <Text>暂无用户数据</Text>
          </View>
        )}

        {users.map(user => (
          <View key={user.id} className='user-item'>
            <View className='user-info'>
              <View className='user-avatar'>
                <Text className='avatar-text'>
                  {user.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View className='user-detail'>
                <View className='user-name-row'>
                  <Text className='user-name'>{user.username}</Text>
                  <Text className={getStatusClass(user.status)}>
                    {getStatusLabel(user.status)}
                  </Text>
                </View>
                {user.phone && <Text className='user-phone'>{user.phone}</Text>}
                <Text className='user-meta'>
                  注册于 {formatTime(user.createdAt)}
                  {user.productCount != null && ` · ${user.productCount} 商品`}
                  {user.orderCount != null && ` · ${user.orderCount} 订单`}
                </Text>
              </View>
            </View>
            <View
              className={`ban-btn ${user.status === 'banned' ? 'unban' : ''}`}
              onClick={() => handleBanToggle(user)}
            >
              <Text>{user.status === 'banned' ? '解封' : '封禁'}</Text>
            </View>
          </View>
        ))}

        {loading && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}

        {!hasMore && users.length > 0 && (
          <View className='no-more'>
            <Text>没有更多了</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
