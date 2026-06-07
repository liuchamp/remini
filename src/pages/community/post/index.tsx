import { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { communityApi, type Post } from '@/domains/community/api'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Post() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad((options) => {
    const id = options?.id
    if (id) {
      loadPost(id)
    }
  })

  const loadPost = async (id: string) => {
    setLoading(true)
    try {
      const res = await communityApi.getPostDetail(id)
      if (res.code === 0) {
        setPost(res.data as Post)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  if (!post) {
    return <Empty text='帖子不存在或已删除' />
  }

  return (
    <ErrorBoundary>
      <View className='post-detail-page'>
        <ScrollView scrollY className='post-scroll'>
          <View className='post-header'>
            <Image className='post-author-avatar' src={post.user.avatar} mode='aspectFill' />
            <View className='post-author-info'>
              <Text className='post-author-name'>{post.user.username}</Text>
              <Text className='post-time'>{post.createdAt}</Text>
            </View>
          </View>

          <View className='post-content'>
            <Text className='post-text'>{post.content}</Text>
          </View>

          {post.images && post.images.length > 0 && (
            <View className='post-images'>
              {post.images.map((img, idx) => (
                <Image
                  key={idx}
                  className='post-image'
                  src={img}
                  mode='aspectFill'
                  lazy-load
                />
              ))}
            </View>
          )}

          <View className='post-stats'>
            <View className='stat-item'>
              <Text className='stat-icon'>❤️</Text>
              <Text className='stat-count'>{post.likeCount}</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-icon'>💬</Text>
              <Text className='stat-count'>{post.commentCount}</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-icon'>🔗</Text>
              <Text className='stat-count'>{post.shareCount}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
