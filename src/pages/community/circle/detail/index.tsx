import { View, Text, Image } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { communityApi } from '@/domains/community/api'
import PostCard from '@/shared/components/community/PostCard'
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

function toPostCardPost(post: Post): PostCardPost {
  return {
    id: post.id,
    content: post.content,
    images: post.images,
    author: { name: post.user.username, avatar: post.user.avatar },
    likes: post.likeCount,
    comments: post.commentCount,
    createdAt: post.createdAt,
  }
}

export default function CircleDetail() {
  const [circle, setCircle] = useState<Circle | null>(null)
  const [posts, setPosts] = useState<Post[]>([])

  useLoad((params) => {
    if (params.id) {
      loadCircleDetail(params.id)
    }
  })

  const loadCircleDetail = async (id: string) => {
    const res = await communityApi.getCircleDetail(id)
    if (res.code === 0) {
      setCircle(res.data.circle)
      setPosts(res.data.posts || [])
    }
  }

  return (
    <View className='circle-detail-page'>
      {circle && (
        <View className='circle-header'>
          <Image className='circle-avatar' src={circle.avatar} mode='aspectFill' />
          <View className='circle-info'>
            <Text className='circle-name'>{circle.name}</Text>
            <Text className='circle-desc'>{circle.description}</Text>
            <Text className='circle-members'>{circle.memberCount} 成员</Text>
          </View>
        </View>
      )}
      <View className='circle-posts'>
        {posts.map((post) => (
          <PostCard key={post.id} post={toPostCardPost(post)} />
        ))}
      </View>
    </View>
  )
}
