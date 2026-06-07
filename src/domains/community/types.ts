export type FeedTab = 'recommend' | 'hot' | 'following'

export type ShareType =
  | 'normal'
  | 'product_share'
  | 'order_showcase'
  | 'commission'

export interface Post {
  id: string
  userId: string
  user: {
    id: string
    username: string
    avatar: string
    trustScore: number
    productCount: number
    isVerified: boolean
    isCreator?: boolean
  }
  content: string
  images: string[]
  shareType: ShareType
  product?: {
    id: string
    title: string
    image: string
    price: number
  }
  circleId?: string
  likeCount: number
  commentCount: number
  viewCount: number
  isLiked: boolean
  createdAt: string
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
  isLiked: boolean
  parentId?: string
  replyTo?: {
    id: string
    username: string
  }
  createdAt: string
}

export interface Circle {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  postCount: number
  isPrivate: boolean
  isMember: boolean
}

export interface CreatePostData {
  content: string
  images: string[]
  shareType?: ShareType
  productId?: string
  circleId?: string
}

export interface FeedParams {
  tab: FeedTab
  page?: number
}
