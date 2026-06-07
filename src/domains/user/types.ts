export interface UserProfile {
  id: string
  username: string
  avatar: string
  bio?: string
  trustScore: number
  currentKycTier: 'L0' | 'L1' | 'L2' | 'L3'
  isVerified: boolean
  productCount: number
  followerCount: number
  followingCount: number
  isFollowed: boolean
  createdAt: string
}

export interface FollowUser {
  id: string
  username: string
  avatar: string
  trustScore: number
  isVerified: boolean
}

export interface FollowState {
  followers: FollowUser[]
  following: FollowUser[]
  followersPage: number
  followingPage: number
  followersHasMore: boolean
  followingHasMore: boolean
  loading: boolean
}

export interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar: string
  rating: number
  content: string
  images: string[]
  createdAt: string
}
