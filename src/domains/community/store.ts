import { create } from 'zustand'
import { communityApi } from './api'

type FeedTab = 'recommend' | 'hot' | 'following'

interface CommunityState {
  // Feed
  feedTab: FeedTab
  feedPosts: Post[]
  feedPage: number
  feedHasMore: boolean
  feedLoading: boolean
  feedRefreshing: boolean

  // Post detail
  currentPost: Post | null
  postLoading: boolean

  // Comments
  comments: Comment[]
  commentsPage: number
  commentsHasMore: boolean
  commentsLoading: boolean

  // Circles
  circles: Circle[]
  circlePosts: Post[]
  circlePostsPage: number
  circlePostsHasMore: boolean

  // Actions - Feed
  setFeedTab: (tab: FeedTab) => void
  loadFeed: (refresh?: boolean) => Promise<void>

  // Actions - Post
  loadPost: (id: string) => Promise<void>
  likePost: (postId: string) => Promise<void>
  clearPost: () => void

  // Actions - Comments
  loadComments: (postId: string, refresh?: boolean) => Promise<void>
  createComment: (postId: string, content: string) => Promise<void>

  // Actions - Create
  createPost: (data: {
    content: string
    images: string[]
    shareType?: 'normal' | 'product_share' | 'order_showcase' | 'commission'
    productId?: string
    circleId?: string
  }) => Promise<Post | null>

  // Actions - Circles
  loadCircles: () => Promise<void>
  loadCirclePosts: (circleId: string, refresh?: boolean) => Promise<void>
  joinCircle: (circleId: string) => Promise<void>
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  // Feed
  feedTab: 'recommend',
  feedPosts: [],
  feedPage: 1,
  feedHasMore: true,
  feedLoading: false,
  feedRefreshing: false,

  // Post
  currentPost: null,
  postLoading: false,

  // Comments
  comments: [],
  commentsPage: 1,
  commentsHasMore: true,
  commentsLoading: false,

  // Circles
  circles: [],
  circlePosts: [],
  circlePostsPage: 1,
  circlePostsHasMore: true,

  setFeedTab: (tab) => {
    if (tab !== get().feedTab) {
      set({ feedTab: tab, feedPosts: [], feedPage: 1, feedHasMore: true })
      get().loadFeed(true)
    }
  },

  loadFeed: async (refresh = false) => {
    const { feedTab, feedPage, feedLoading, feedRefreshing } = get()
    if (feedLoading || feedRefreshing) return

    const page = refresh ? 1 : feedPage
    set(refresh ? { feedRefreshing: true } : { feedLoading: true })

    try {
      const res = await communityApi.getFeed(feedTab, page)
      if (res.code === 0) {
        set({
          feedPosts: refresh ? res.data.posts : [...get().feedPosts, ...res.data.posts],
          feedPage: page + 1,
          feedHasMore: res.data.hasMore,
          feedLoading: false,
          feedRefreshing: false,
        })
      } else {
        set({ feedLoading: false, feedRefreshing: false })
      }
    } catch {
      set({ feedLoading: false, feedRefreshing: false })
    }
  },

  loadPost: async (id) => {
    set({ postLoading: true, comments: [], commentsPage: 1, commentsHasMore: true })
    try {
      const res = await communityApi.getPostDetail(id)
      if (res.code === 0) {
        set({ currentPost: res.data, postLoading: false })
      } else {
        set({ postLoading: false })
      }
    } catch {
      set({ postLoading: false })
    }
  },

  likePost: async (postId) => {
    const { currentPost, feedPosts } = get()

    // Optimistic update on currentPost
    if (currentPost && currentPost.id === postId) {
      set({
        currentPost: {
          ...currentPost,
          isLiked: !currentPost.isLiked,
          likeCount: currentPost.isLiked ? currentPost.likeCount - 1 : currentPost.likeCount + 1,
        },
      })
    }

    // Optimistic update on feed
    const updatedFeed = feedPosts.map((p) =>
      p.id === postId
        ? {
            ...p,
            isLiked: !p.isLiked,
            likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
          }
        : p
    )
    set({ feedPosts: updatedFeed })

    try {
      const res = await communityApi.likePost(postId)
      if (res.code === 0) {
        // Sync with server state
        if (currentPost && currentPost.id === postId) {
          set({
            currentPost: {
              ...currentPost,
              isLiked: res.data.isLiked,
              likeCount: res.data.likeCount,
            },
          })
        }
        set({
          feedPosts: feedPosts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: res.data.isLiked, likeCount: res.data.likeCount }
              : p
          ),
        })
      }
    } catch {
      // Revert optimistic update
      if (currentPost && currentPost.id === postId) {
        set({
          currentPost: {
            ...currentPost,
            isLiked: !currentPost.isLiked,
            likeCount: currentPost.isLiked ? currentPost.likeCount - 1 : currentPost.likeCount + 1,
          },
        })
      }
    }
  },

  clearPost: () => set({ currentPost: null, comments: [], commentsPage: 1, commentsHasMore: true }),

  loadComments: async (postId, refresh = false) => {
    const { commentsLoading } = get()
    if (commentsLoading) return

    const page = refresh ? 1 : get().commentsPage
    set({ commentsLoading: true })

    try {
      const res = await communityApi.getComments(postId, page)
      if (res.code === 0) {
        set({
          comments: refresh ? res.data.comments : [...get().comments, ...res.data.comments],
          commentsPage: page + 1,
          commentsHasMore: res.data.hasMore,
          commentsLoading: false,
        })
      } else {
        set({ commentsLoading: false })
      }
    } catch {
      set({ commentsLoading: false })
    }
  },

  createComment: async (postId, content) => {
    try {
      const res = await communityApi.createComment(postId, content)
      if (res.code === 0) {
        set({
          comments: [res.data, ...get().comments],
        })
        // Update comment count on current post
        const { currentPost } = get()
        if (currentPost) {
          set({
            currentPost: { ...currentPost, commentCount: currentPost.commentCount + 1 },
          })
        }
      }
    } catch {
      /* handled by HttpClient interceptors */
    }
  },

  createPost: async (data) => {
    try {
      const res = await communityApi.createPost(data)
      if (res.code === 0) {
        return res.data
      }
    } catch {
      /* handled by HttpClient interceptors */
    }
    return null
  },

  loadCircles: async () => {
    try {
      const res = await communityApi.getCircles()
      if (res.code === 0) {
        set({ circles: res.data })
      }
    } catch {
      /* silent */
    }
  },

  loadCirclePosts: async (circleId, refresh = false) => {
    const page = refresh ? 1 : get().circlePostsPage
    try {
      const res = await communityApi.getCirclePosts(circleId, page)
      if (res.code === 0) {
        set({
          circlePosts: refresh ? res.data.posts : [...get().circlePosts, ...res.data.posts],
          circlePostsPage: page + 1,
          circlePostsHasMore: res.data.hasMore,
        })
      }
    } catch {
      /* silent */
    }
  },

  joinCircle: async (circleId) => {
    try {
      const res = await communityApi.joinCircle(circleId)
      if (res.code === 0) {
        set({
          circles: get().circles.map((c) =>
            c.id === circleId ? { ...c, isMember: res.data.isMember } : c
          ),
        })
      }
    } catch {
      /* silent */
    }
  },
}))
