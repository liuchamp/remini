import { http } from '@/shared/api/request'
import type { UserProfile, FollowUser, Review } from './types'

export const userApi = {
  getProfile(userId: string) {
    return http.get<UserProfile>(`/users/${userId}`)
  },

  getUserProducts(userId: string, params?: { page?: number; limit?: number }) {
    return http.get<{ products: Product[]; total: number; hasMore: boolean }>(
      `/users/${userId}/products`,
      params
    )
  },

  getUserReviews(userId: string, params?: { page?: number; limit?: number }) {
    return http.get<{ reviews: Review[]; total: number; hasMore: boolean }>(
      `/users/${userId}/reviews`,
      params
    )
  },

  follow(userId: string) {
    return http.post<{ isFollowed: boolean }>(`/users/${userId}/follow`)
  },

  unfollow(userId: string) {
    return http.delete(`/users/${userId}/follow`)
  },

  getFollowers(params?: { page?: number; limit?: number }) {
    return http.get<{ users: FollowUser[]; hasMore: boolean }>(
      '/user/followers',
      params
    )
  },

  getFollowing(params?: { page?: number; limit?: number }) {
    return http.get<{ users: FollowUser[]; hasMore: boolean }>(
      '/user/following',
      params
    )
  },

  getMyListings(params?: { page?: number; limit?: number }) {
    return http.get<{ products: Product[]; hasMore: boolean }>(
      '/user/listings',
      params
    )
  },

  deleteListing(id: string) {
    return http.delete(`/products/${id}`)
  },
}
