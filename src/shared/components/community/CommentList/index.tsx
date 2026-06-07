import { View, Text, Image, Input } from '@tarojs/components'
import { useState } from 'react'
import { usePostStore } from '@/domains/community/store'
import type { Comment } from '@/domains/community/types'
import './index.scss'

interface CommentListProps {
  postId: string
  comments: Comment[]
}

export default function CommentList({ postId, comments }: CommentListProps) {
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [content, setContent] = useState('')
  const { addComment, likeComment } = usePostStore()

  const handleSubmit = async () => {
    if (!content.trim()) return

    try {
      await addComment(postId, content, replyTo?.id)
      setContent('')
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleReply = (comment: Comment) => {
    setReplyTo(comment)
  }

  const handleLike = (commentId: string) => {
    likeComment(commentId)
  }

  return (
    <View className='comment-list'>
      <View className='comment-input'>
        <Input
          className='input'
          placeholder={replyTo ? `回复 ${replyTo.user.username}` : '写评论...'}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          onConfirm={handleSubmit}
        />
        <View className='submit-btn' onClick={handleSubmit}>
          <Text className='submit-text'>发送</Text>
        </View>
      </View>

      <View className='comments'>
        {comments.map((comment) => (
          <View key={comment.id} className='comment-item'>
            <Image className='comment-avatar' src={comment.user.avatar} mode='aspectFill' />
            <View className='comment-content'>
              <Text className='comment-author'>{comment.user.username}</Text>
              <Text className='comment-text'>{comment.content}</Text>
              <View className='comment-footer'>
                <Text className='comment-time'>{comment.createdAt}</Text>
                <View className='comment-actions'>
                  <Text className='action-btn' onClick={() => handleLike(comment.id)}>
                    {comment.isLiked ? '❤️' : '👍'} {comment.likeCount}
                  </Text>
                  <Text className='action-btn' onClick={() => handleReply(comment)}>
                    回复
                  </Text>
                </View>
              </View>

              {comment.replies && comment.replies.length > 0 && (
                <View className='replies'>
                  {comment.replies.map((reply) => (
                    <View key={reply.id} className='reply-item'>
                      <Image className='reply-avatar' src={reply.user.avatar} mode='aspectFill' />
                      <View className='reply-content'>
                        <Text className='reply-author'>{reply.user.username}</Text>
                        <Text className='reply-text'>{reply.content}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
