import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Post {
  id: string
  content: string
  images?: string[]
  author: { name: string; avatar: string; isCreator?: boolean }
  likes: number
  comments: number
  createdAt: string
}

interface PostCardProps {
  post: Post
  onClick?: (id: string) => void
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(post.id)
    } else {
      Taro.navigateTo({ url: `/pages/community/post/index?id=${post.id}` })
    }
  }

  return (
    <View className='post-card' onClick={handleClick}>
      <View className='post-header'>
        <Image className='post-avatar' src={post.author.avatar} mode='aspectFill' />
        <View className='post-author-info'>
          <Text className='post-author-name'>{post.author.name}</Text>
          <Text className='post-time'>{post.createdAt}</Text>
        </View>
        {post.author.isCreator && (
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

      <View className='post-footer'>
        <View className='post-stat'>
          <Text className='stat-icon'>👍</Text>
          <Text className='stat-count'>{post.likes}</Text>
        </View>
        <View className='post-stat'>
          <Text className='stat-icon'>💬</Text>
          <Text className='stat-count'>{post.comments}</Text>
        </View>
      </View>
    </View>
  )
}