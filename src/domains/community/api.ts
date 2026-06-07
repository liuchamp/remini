import { http } from '@/shared/api/request'
import type { Post, Comment, CreatePostData, FeedParams } from './types'

export type { Post, Comment, CreatePostData, FeedParams }

export const communityApi = {
  getFeed(params: FeedParams) {
    return http.get<{ posts: Post[]; hasMore: boolean }>('/community/feed', { params })
  },

  getPostDetail(id: string) {
    return http.get<Post>(`/community/posts/${id}`)
  },

  createPost(data: CreatePostData) {
    return http.post<Post>('/community/posts', data)
  },

  likePost(id: string) {
    return http.post<{ isLiked: boolean; likeCount: number }>(`/community/posts/${id}/like`)
  },

  collectPost(id: string) {
    return http.post<void>(`/community/posts/${id}/collect`)
  },

  getComments(postId: string, params: { page?: number; pageSize?: number } = { pageSize: 20 }) {
    return http.get<{ comments: Comment[]; hasMore: boolean }>(
      `/community/posts/${postId}/comments`,
      { params },
    )
  },

  addComment(postId: string, content: string, parentId?: string) {
    return http.post<Comment>(`/community/posts/${postId}/comments`, { content, parentId })
  },

  likeComment(commentId: string) {
    return http.post<{ isLiked: boolean; likeCount: number }>(
      `/community/comments/${commentId}/like`,
    )
  },
}
