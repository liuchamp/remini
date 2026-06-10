import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useState, useRef } from 'react'
import { usePostStore } from '@/domains/community/store'
import PostCard from '@/shared/components/community/PostCard'
import CommentList from '@/shared/components/community/CommentList'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Post() {
  const { t } = useTranslation(['community', 'common'])
  const { currentPost: post, comments, loading, loadPost, loadComments, likePost, collectPost } = usePostStore()
  const [error, setError] = useState(false)
  const postIdRef = useRef('')

  useLoad((options) => {
    const id = options?.id || ''
    if (id) {
      postIdRef.current = id
      loadData(id)
    }
  })

  const loadData = async (id: string) => {
    setError(false)
    try {
      await loadPost(id)
      await loadComments(id)
    } catch {
      setError(true)
    }
  }

  const refresh = () => {
    if (postIdRef.current) loadData(postIdRef.current)
  }

  if (loading) {
    return <Skeleton variant='detail' count={4} />
  }

  if (error) {
    return <RetryButton onRetry={refresh} />
  }

  if (!post) {
    return <Empty text={t('community:post.notFound')} />
  }

  return (
    <ErrorBoundary>
      <View className='post-detail-page'>
        <ScrollView scrollY className='post-scroll'>
          <PostCard post={post} onClick={() => {}} />

          <View className='post-actions'>
            <View
              className={`action-item ${post.isLiked ? 'active' : ''}`}
              onClick={() => likePost(post.id)}
            >
              <Text className='action-icon'>{post.isLiked ? '❤️' : '👍'}</Text>
              <Text className='action-text'>{t('community:post.like')}</Text>
            </View>
            <View
              className={`action-item ${post.isCollected ? 'active' : ''}`}
              onClick={() => collectPost(post.id)}
            >
              <Text className='action-icon'>{post.isCollected ? '⭐' : '☆'}</Text>
              <Text className='action-text'>{t('community:post.collect')}</Text>
            </View>
            <View className='action-item'>
              <Text className='action-icon'>💬</Text>
              <Text className='action-text'>{t('community:post.comment')}</Text>
            </View>
            <View className='action-item'>
              <Text className='action-icon'>🔗</Text>
              <Text className='action-text'>{t('community:post.share')}</Text>
            </View>
          </View>

          <View className='post-comments'>
            <Text className='section-title'>{t('community:post.comment')} ({comments.length})</Text>
            <CommentList postId={post.id} comments={comments} />
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
