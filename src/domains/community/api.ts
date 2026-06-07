import { http } from '@/shared/api/request'
import type { Post, Comment, Circle, CreatePostData } from './types'

export type { Post, Comment, Circle, CreatePostData }

export const communityApi = {
  getFeed(tab?: string, page?: number) {
    return http.get<{ posts: Post[]; hasMore: boolean }>('/posts', { tab, page })
  },
  getPostDetail(id: string) {
    return http.get<Post>(`/posts/${id}`)
  },
  createPost(data: CreatePostData) {
    return http.post<Post>('/posts', data)
  },
  likePost(id: string) {
    return http.post<{ isLiked: boolean; likeCount: number }>(`/posts/${id}/like`)
  },
  getComments(postId: string, page?: number) {
    return http.get<{ comments: Comment[]; hasMore: boolean }>(`/posts/${postId}/comments`, { page })
  },
  createComment(postId: string, content: string) {
    return http.post<Comment>(`/posts/${postId}/comments`, { content })
  },
  likeComment(commentId: string) {
    return http.post<{ isLiked: boolean; likeCount: number }>(`/comments/${commentId}/like`)
  },
  getCircles() {
    return http.get<Circle[]>('/circles')
  },
  getCirclePosts(circleId: string, page?: number) {
    return http.get<{ posts: Post[]; hasMore: boolean }>(`/circles/${circleId}/posts`, { page })
  },
  joinCircle(circleId: string) {
    return http.post<{ isMember: boolean }>(`/circles/${circleId}/join`)
  },
  getCircleDetail(id: string) {
    return http.get<{ circle: Circle; posts: Post[] }>(`/circles/${id}`)
  },
}
