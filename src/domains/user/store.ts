import { create } from 'zustand'
import { userApi } from './api'
import type { UserProfile, FollowUser, Review } from './types'

interface UserState {
  // Current viewing profile
  profile: UserProfile | null

  // Follow lists
  followers: FollowUser[]
  following: FollowUser[]
  followersPage: number
  followingPage: number
  followersHasMore: boolean
  followingHasMore: boolean

  // User products
  userProducts: Product[]
  userProductsPage: number
  userProductsHasMore: boolean

  // User reviews
  userReviews: Review[]
  userReviewsPage: number
  userReviewsHasMore: boolean

  // Loading states
  profileLoading: boolean
  loading: boolean

  // Actions
  loadProfile: (userId: string) => Promise<void>
  loadUserProducts: (userId: string, refresh?: boolean) => Promise<void>
  loadUserReviews: (userId: string, refresh?: boolean) => Promise<void>
  loadFollowers: (refresh?: boolean) => Promise<void>
  loadFollowing: (refresh?: boolean) => Promise<void>
  toggleFollow: (userId: string) => Promise<void>
  clearProfile: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  followers: [],
  following: [],
  followersPage: 1,
  followingPage: 1,
  followersHasMore: true,
  followingHasMore: true,
  userProducts: [],
  userProductsPage: 1,
  userProductsHasMore: true,
  userReviews: [],
  userReviewsPage: 1,
  userReviewsHasMore: true,
  profileLoading: false,
  loading: false,

  loadProfile: async (userId) => {
    set({ profileLoading: true })
    try {
      const res = await userApi.getProfile(userId)
      if (res.code === 0) {
        set({ profile: res.data, profileLoading: false })
      }
    } catch {
      set({ profileLoading: false })
    }
  },

  loadUserProducts: async (userId, refresh = false) => {
    const page = refresh ? 1 : get().userProductsPage
    set({ loading: true })
    try {
      const res = await userApi.getUserProducts(userId, { page, limit: 20 })
      if (res.code === 0) {
        set({
          userProducts: refresh
            ? res.data.products
            : [...get().userProducts, ...res.data.products],
          userProductsPage: page + 1,
          userProductsHasMore: res.data.hasMore,
          loading: false,
        })
      }
    } catch {
      set({ loading: false })
    }
  },

  loadUserReviews: async (userId, refresh = false) => {
    const page = refresh ? 1 : get().userReviewsPage
    set({ loading: true })
    try {
      const res = await userApi.getUserReviews(userId, { page, limit: 20 })
      if (res.code === 0) {
        set({
          userReviews: refresh
            ? res.data.reviews
            : [...get().userReviews, ...res.data.reviews],
          userReviewsPage: page + 1,
          userReviewsHasMore: res.data.hasMore,
          loading: false,
        })
      }
    } catch {
      set({ loading: false })
    }
  },

  loadFollowers: async (refresh = false) => {
    const page = refresh ? 1 : get().followersPage
    set({ loading: true })
    try {
      const res = await userApi.getFollowers({ page, limit: 20 })
      if (res.code === 0) {
        set({
          followers: refresh
            ? res.data.users
            : [...get().followers, ...res.data.users],
          followersPage: page + 1,
          followersHasMore: res.data.hasMore,
          loading: false,
        })
      }
    } catch {
      set({ loading: false })
    }
  },

  loadFollowing: async (refresh = false) => {
    const page = refresh ? 1 : get().followingPage
    set({ loading: true })
    try {
      const res = await userApi.getFollowing({ page, limit: 20 })
      if (res.code === 0) {
        set({
          following: refresh
            ? res.data.users
            : [...get().following, ...res.data.users],
          followingPage: page + 1,
          followingHasMore: res.data.hasMore,
          loading: false,
        })
      }
    } catch {
      set({ loading: false })
    }
  },

  toggleFollow: async (userId) => {
    const profile = get().profile
    if (!profile) return

    const wasFollowed = profile.isFollowed
    set({
      profile: {
        ...profile,
        isFollowed: !wasFollowed,
        followerCount: wasFollowed
          ? profile.followerCount - 1
          : profile.followerCount + 1,
      },
    })

    try {
      if (wasFollowed) {
        const res = await userApi.unfollow(userId)
        if (res.code === 0) {
          set({
            profile: { ...get().profile!, isFollowed: false },
          })
        }
      } else {
        const res = await userApi.follow(userId)
        if (res.code === 0) {
          set({
            profile: { ...get().profile!, isFollowed: true },
          })
        }
      }
    } catch {
      // Revert on error
      set({
        profile: {
          ...get().profile!,
          isFollowed: wasFollowed,
          followerCount: wasFollowed
            ? profile.followerCount
            : profile.followerCount - 1,
        },
      })
    }
  },

  clearProfile: () =>
    set({
      profile: null,
      userProducts: [],
      userProductsPage: 1,
      userProductsHasMore: true,
      userReviews: [],
      userReviewsPage: 1,
      userReviewsHasMore: true,
    }),
}))
