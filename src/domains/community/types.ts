export type FeedTab = 'recommended' | 'trending' | 'following'

export interface Post {
  id: string
  user: {
    id: string
    username: string
    avatar: string
    isCreator?: boolean
  }
  content: string
  images?: string[]
  product?: {
    id: string
    title: string
    cover: string
    price: number
  }
  likeCount: number
  commentCount: number
  shareCount: number
  isLiked?: boolean
  isCollected?: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  user: {
    id: string
    username: string
    avatar: string
  }
  content: string
  likeCount: number
  isLiked?: boolean
  parentId?: string
  replies?: Comment[]
  createdAt: string
}

export interface CreatePostData {
  content: string
  images?: string[]
  productId?: string
  circleId?: string
}

export interface FeedParams {
  tab: FeedTab
  page?: number
  pageSize?: number
}
