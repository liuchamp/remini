import { View, Text, Image, ITouchEvent } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { usePostStore } from '@/domains/community/store'
import type { Post } from '@/domains/community/types'
import './index.scss'

interface PostCardProps {
  post: Post
  onClick?: (id: string) => void
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const { likePost } = usePostStore()

  const handleClick = () => {
    if (onClick) {
      onClick(post.id)
    } else {
      Taro.navigateTo({ url: `/pages/community/post/index?id=${post.id}` })
    }
  }

  const handleLike = (e: ITouchEvent) => {
    e.stopPropagation()
    likePost(post.id)
  }

  const handleShare = (e: ITouchEvent) => {
    e.stopPropagation()
    // TODO: 实现分享功能
  }

  return (
    <View className='post-card' onClick={handleClick}>
      <View className='post-header'>
        <Image className='post-avatar' src={post.user.avatar} mode='aspectFill' />
        <View className='post-author-info'>
          <Text className='post-author-name'>{post.user.username}</Text>
          <Text className='post-time'>{post.createdAt}</Text>
        </View>
        {post.user.isCreator && (
          <View className='creator-badge'>
            <Text className='badge-text'>创作者</Text>
          </View>
        )}
      </View>

      <Text className='post-content'>{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <View className='post-images'>
          {post.images.slice(0, 3).map((img, i) => (
            <Image key={i} className='post-image' src={img} mode='aspectFill' />
          ))}
        </View>
      )}

      {post.product && (
        <View className='product-embed'>
          <Image className='product-cover' src={post.product.cover} mode='aspectFill' />
          <View className='product-info'>
            <Text className='product-title'>{post.product.title}</Text>
            <Text className='product-price'>¥{post.product.price}</Text>
          </View>
        </View>
      )}

      <View className='post-footer'>
        <View className='post-stat' onClick={handleLike}>
          <Text className={`stat-icon ${post.isLiked ? 'liked' : ''}`}>
            {post.isLiked ? '❤️' : '👍'}
          </Text>
          <Text className='stat-count'>{post.likeCount}</Text>
        </View>
        <View className='post-stat'>
          <Text className='stat-icon'>💬</Text>
          <Text className='stat-count'>{post.commentCount}</Text>
        </View>
        <View className='post-stat' onClick={handleShare}>
          <Text className='stat-icon'>🔗</Text>
          <Text className='stat-count'>{post.shareCount}</Text>
        </View>
      </View>
    </View>
  )
}
