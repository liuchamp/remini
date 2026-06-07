import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { communityApi, type Post } from '@/domains/community/api'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const TABS = [
  { key: 'recommended', label: '推荐' },
  { key: 'trending', label: '热门' },
  { key: 'following', label: '关注' },
]

export default function Feed() {
  const [activeTab, setActiveTab] = useState(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadPosts()
  })

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await communityApi.getFeed(TABS[activeTab].key as 'recommended' | 'trending' | 'following')
      if (res.code === 0) {
        setPosts(res.data as Post[])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  return (
    <ErrorBoundary>
      <View className='feed-page'>
        <View className='tab-bar'>
          {TABS.map((tab, idx) => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === idx ? 'active' : ''}`}
              onClick={() => { setActiveTab(idx); loadPosts() }}
            >
              <Text className='tab-label'>{tab.label}</Text>
            </View>
          ))}
        </View>
        <View className='feed-list'>
          {posts.length > 0 ? (
            posts.map((post) => (
              <View key={post.id} className='feed-post'>
                <Text>{post.content}</Text>
              </View>
            ))
          ) : (
            <Empty text='暂无动态' />
          )}
        </View>
      </View>
    </ErrorBoundary>
  )
}
