import { View, Text, Image } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useCircleStore } from '@/domains/community/store'
import PostCard from '@/shared/components/community/PostCard'
import Loading from '@/shared/components/Loading'
import Empty from '@/shared/components/Empty'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

interface PostCardPost {
  id: string
  content: string
  images?: string[]
  author: { name: string; avatar: string; isCreator?: boolean }
  likes: number
  comments: number
  createdAt: string
}

function toPostCardPost(post: any): PostCardPost {
  return {
    id: post.id,
    content: post.content,
    images: post.images,
    author: { name: post.user?.username || '', avatar: post.user?.avatar || '' },
    likes: post.likeCount || 0,
    comments: post.commentCount || 0,
    createdAt: post.createdAt || '',
  }
}

export default function CircleDetail() {
  const { t } = useTranslation(['community'])
  const { circle, posts, loading, loadDetail, joinCircle, leaveCircle } = useCircleStore()

  useLoad((params) => {
    if (params.id) {
      loadDetail(params.id)
    }
  })

  const handleJoinLeave = async () => {
    if (!circle) return

    if (circle.isJoined) {
      const res = await Taro.showModal({
        title: '',
        content: t('community:circle.leaveConfirm'),
      })
      if (res.confirm) {
        await leaveCircle(circle.id)
      }
    } else {
      await joinCircle(circle.id)
    }
  }

  if (loading) {
    return <Loading type='skeleton' rows={4} />
  }

  return (
    <ErrorBoundary>
      <View className='circle-detail-page'>
        {circle ? (
          <>
            <View className='circle-header'>
              <Image className='circle-avatar' src={circle.avatar} mode='aspectFill' />
              <View className='circle-info'>
                <Text className='circle-name'>{circle.name}</Text>
                <Text className='circle-desc'>{circle.description}</Text>
                <Text className='circle-members'>
                  {t('community:circle.members', { count: circle.memberCount })}
                </Text>
              </View>
              <View
                className={`circle-join-btn ${circle.isJoined ? 'joined' : ''}`}
                onClick={handleJoinLeave}
              >
                <Text className='circle-join-btn-text'>
                  {circle.isJoined ? t('community:circle.joined') : t('community:circle.join')}
                </Text>
              </View>
            </View>
            <View className='circle-posts'>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={toPostCardPost(post)} />
                ))
              ) : (
                <Empty text={t('community:circle.noPosts')} />
              )}
            </View>
          </>
        ) : (
          <Empty text={t('community:circle.notFound')} />
        )}
      </View>
    </ErrorBoundary>
  )
}
