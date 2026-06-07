import { View, Text } from '@tarojs/components'
import { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useState, useCallback } from 'react'
import { useFeedStore } from '@/domains/community/store'
import PostCard from '@/shared/components/community/PostCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TAB_KEYS = ['recommended', 'trending', 'following'] as const

export default function Feed() {
  const { t } = useTranslation(['community', 'common'])
  const { posts, activeTab, loading, hasMore, loadPosts, loadMore, refresh } = useFeedStore()
  const [error, setError] = useState(false)

  useLoad(() => {
    loadWithErrorHandling('recommended', true)
  })

  const loadWithErrorHandling = useCallback(async (tab: string, reset: boolean) => {
    setError(false)
    try {
      await loadPosts(tab, reset)
    } catch {
      setError(true)
    }
  }, [loadPosts])

  const handleRefresh = useCallback(async () => {
    setError(false)
    try {
      await refresh()
    } catch {
      setError(true)
    }
    Taro.stopPullDownRefresh()
  }, [refresh])

  usePullDownRefresh(handleRefresh)

  useReachBottom(() => {
    if (hasMore) {
      loadMore()
    }
  })

  const handleTabChange = (tab: typeof TAB_KEYS[number]) => {
    loadWithErrorHandling(tab, true)
  }

  const getTabLabel = (key: string) => {
    switch (key) {
      case 'recommended': return t('community:feed.tabRecommend')
      case 'trending': return t('community:feed.tabTrending')
      case 'following': return t('community:feed.tabFollow')
      default: return key
    }
  }

  return (
    <ErrorBoundary>
      <View className='feed-page'>
        <View className='tab-bar'>
          {TAB_KEYS.map((key) => (
            <View
              key={key}
              className={`tab-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => handleTabChange(key)}
            >
              <Text className='tab-label'>{getTabLabel(key)}</Text>
            </View>
          ))}
        </View>

        <View className='feed-list'>
          {loading && posts.length === 0 ? (
            <Skeleton type='list' rows={4} />
          ) : error ? (
            <RetryButton onRetry={() => handleTabChange(activeTab)} />
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <Empty text={t('community:feed.emptyText')} />
          )}

          {loading && posts.length > 0 && (
            <Loading type='spinner' />
          )}

          {!hasMore && posts.length > 0 && (
            <View className='load-more'>
              <Text className='load-more-text'>{t('common:app.noMore')}</Text>
            </View>
          )}
        </View>
      </View>
    </ErrorBoundary>
  )
}
