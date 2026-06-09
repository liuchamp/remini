import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePostStore } from '@/domains/community/store'
import type { Comment } from '@/domains/community/types'
import './index.scss'

interface CommentListProps {
  postId: string
  comments: Comment[]
}

export default function CommentList({ postId, comments }: CommentListProps) {
  const { t } = useTranslation(['community'])
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [content, setContent] = useState('')
  const { addComment, likeComment, deleteComment } = usePostStore()

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

  const handleLongPress = async (comment: Comment) => {
    const res = await Taro.showActionSheet({
      itemList: [t('community:comment.delete')],
    })
    if (res.tapIndex === 0) {
      const confirmRes = await Taro.showModal({
        title: '',
        content: t('community:comment.confirmDelete'),
      })
      if (confirmRes.confirm) {
        try {
          await deleteComment(comment.id)
          Taro.showToast({
            title: t('community:comment.deleteSuccess'),
            icon: 'success',
          })
        } catch {
          /* handled by HttpClient interceptors */
        }
      }
    }
  }

  return (
    <View className='comment-list'>
      <View className='comment-input'>
        <Input
          className='input'
          placeholder={replyTo ? `${t('community:post.replyPlaceholder', { user: replyTo.user.username })}` : t('community:post.commentPlaceholder')}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          onConfirm={handleSubmit}
        />
        <View className='submit-btn' onClick={handleSubmit}>
          <Text className='submit-text'>{t('community:comment.submit')}</Text>
        </View>
      </View>

      <View className='comments'>
        {comments.map((comment) => (
          <View
            key={comment.id}
            className='comment-item'
            onLongPress={() => handleLongPress(comment)}
          >
            <Image className='comment-avatar' src={comment.user.avatar} mode='aspectFill' lazyLoad />
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
                    {t('community:post.comment')}
                  </Text>
                </View>
              </View>

              {comment.replies && comment.replies.length > 0 && (
                <View className='replies'>
                  {comment.replies.map((reply) => (
                    <View
                      key={reply.id}
                      className='reply-item'
                      onLongPress={() => handleLongPress(reply)}
                    >
                      <Image className='reply-avatar' src={reply.user.avatar} mode='aspectFill' lazyLoad />
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
