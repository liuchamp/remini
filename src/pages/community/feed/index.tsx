import { View, Text } from '@tarojs/components'
import { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useFeedStore } from '@/domains/community/store'
import PostCard from '@/shared/components/community/PostCard'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TABS = [
  { key: 'recommended', label: '推荐' },
  { key: 'trending', label: '热门' },
  { key: 'following', label: '关注' },
] as const

export default function Feed() {
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

  const handleTabChange = (tab: typeof TABS[number]['key']) => {
    loadPosts(tab, true)
  }

  return (
    <ErrorBoundary>
      <View className='feed-page'>
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

        <View className='feed-list'>
          {loading && posts.length === 0 ? (
            <Loading type='skeleton' rows={4} />
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <Empty text='暂无动态' />
          )}

          {loading && posts.length > 0 && (
            <Loading type='spinner' />
          )}

          {!hasMore && posts.length > 0 && (
            <View className='load-more'>
              <Text className='load-more-text'>没有更多了</Text>
            </View>
          )}
        </View>
      </View>
    </ErrorBoundary>
  )
}
