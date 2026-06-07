import { http } from '@/shared/api/request'

export const communityApi = {
  getFeed(tab?: string, page?: number) {
    return http.get<{ posts: Post[]; hasMore: boolean }>('/posts', { tab, page })
  },
  getPostDetail(id: string) {
    return http.get<Post>(`/posts/${id}`)
  },
  createPost(data: {
    content: string
    images: string[]
    shareType?: 'normal' | 'product_share' | 'order_showcase' | 'commission'
    productId?: string
    circleId?: string
  }) {
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
}
