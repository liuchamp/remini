import { View, Text } from '@tarojs/components'
import { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useFeedStore } from '@/domains/community/store'
import PostCard from '@/shared/components/community/PostCard'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TAB_KEYS = ['recommended', 'trending', 'following'] as const

export default function Feed() {
  const { t } = useTranslation(['community', 'common'])
  const { posts, activeTab, loading, hasMore, loadPosts, loadMore, refresh } = useFeedStore()

  useLoad(() => {
    loadPosts('recommended', true)
  })

  usePullDownRefresh(async () => {
    await refresh()
    Taro.stopPullDownRefresh()
  })

  useReachBottom(() => {
    if (hasMore) {
      loadMore()
    }
  })

  const handleTabChange = (tab: typeof TAB_KEYS[number]) => {
    loadPosts(tab, true)
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
            <Loading type='skeleton' rows={4} />
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
