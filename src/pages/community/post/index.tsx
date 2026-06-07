import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { usePostStore } from '@/domains/community/store'
import PostCard from '@/shared/components/community/PostCard'
import CommentList from '@/shared/components/community/CommentList'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Post() {
  const { t } = useTranslation(['community', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { currentPost: post, comments, loading, loadPost, loadComments, likePost, collectPost } = usePostStore()

  useLoad((options) => {
    const id = options?.id
    if (id) {
      loadPost(id)
      loadComments(id)
    }
  })

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
          <PostCard post={post} onClick={() => {}} />

          <View className='post-actions'>
            <View
              className={`action-item ${post.isLiked ? 'active' : ''}`}
              onClick={() => likePost(post.id)}
            >
              <Text className='action-icon'>{post.isLiked ? '❤️' : '👍'}</Text>
              <Text className='action-text'>点赞</Text>
            </View>
            <View
              className={`action-item ${post.isCollected ? 'active' : ''}`}
              onClick={() => collectPost(post.id)}
            >
              <Text className='action-icon'>{post.isCollected ? '⭐' : '☆'}</Text>
              <Text className='action-text'>收藏</Text>
            </View>
            <View className='action-item'>
              <Text className='action-icon'>💬</Text>
              <Text className='action-text'>评论</Text>
            </View>
            <View className='action-item'>
              <Text className='action-icon'>🔗</Text>
              <Text className='action-text'>分享</Text>
            </View>
          </View>

          <View className='post-comments'>
            <Text className='section-title'>评论 ({comments.length})</Text>
            <CommentList postId={post.id} comments={comments} />
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  )
}
