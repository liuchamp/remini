import { create } from 'zustand'
import { communityApi } from './api'
import type { Post, Comment, FeedTab } from './types'

interface FeedState {
  posts: Post[]
  activeTab: FeedTab
  page: number
  hasMore: boolean
  loading: boolean

  loadPosts: (tab: FeedTab, refresh?: boolean) => Promise<void>
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  activeTab: 'recommended' as FeedTab,
  page: 1,
  hasMore: true,
  loading: false,

  loadPosts: async (tab, refresh = false) => {
    const { loading } = get()
    if (loading) return

    const page = refresh ? 1 : get().page
    set({ activeTab: tab, loading: true })
    try {
      const res = await communityApi.getFeed({ tab, page })
      if (res.code === 0) {
        set({
          posts: refresh ? res.data.posts : [...get().posts, ...res.data.posts],
          page: page + 1,
          hasMore: res.data.hasMore,
          loading: false,
        })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },

  refresh: async () => {
    const { activeTab, loading } = get()
    if (loading) return

    set({ loading: true })
    try {
      const res = await communityApi.getFeed({ tab: activeTab, page: 1 })
      if (res.code === 0) {
        set({
          posts: res.data.posts,
          page: 2,
          hasMore: res.data.hasMore,
          loading: false,
        })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },

  loadMore: async () => {
    const { activeTab, page, hasMore, loading } = get()
    if (loading || !hasMore) return

    set({ loading: true })
    try {
      const res = await communityApi.getFeed({ tab: activeTab, page })
      if (res.code === 0) {
        set({
          posts: [...get().posts, ...res.data.posts],
          page: page + 1,
          hasMore: res.data.hasMore,
          loading: false,
        })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },
}))

interface PostState {
  currentPost: Post | null
  comments: Comment[]
  loading: boolean

  loadPost: (id: string) => Promise<void>
  likePost: (postId: string) => Promise<void>
  likeComment: (commentId: string) => Promise<void>
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>
  collectPost: (postId: string) => Promise<void>
  loadComments: (postId: string) => Promise<void>
}

export const usePostStore = create<PostState>((set, get) => ({
  currentPost: null,
  comments: [],
  loading: false,

  loadPost: async (id) => {
    set({ loading: true, comments: [] })
    try {
      const res = await communityApi.getPostDetail(id)
      if (res.code === 0) {
        set({ currentPost: res.data, loading: false })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },

  likePost: async (postId) => {
    const { currentPost } = get()
    if (currentPost) {
      set({
        currentPost: {
          ...currentPost,
          isLiked: !currentPost.isLiked,
          likeCount: currentPost.isLiked
            ? currentPost.likeCount - 1
            : currentPost.likeCount + 1,
        },
      })
    }

    try {
      const res = await communityApi.likePost(postId)
      if (res.code === 0 && get().currentPost) {
        set({
          currentPost: {
            ...get().currentPost!,
            isLiked: res.data.isLiked,
            likeCount: res.data.likeCount,
          },
        })
      }
    } catch {
      if (currentPost) {
        set({ currentPost })
      }
    }
  },

  likeComment: async (commentId) => {
    const { comments } = get()
    const updateComment = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === commentId) {
          return { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 }
        }
        if (c.replies) {
          return { ...c, replies: updateComment(c.replies) }
        }
        return c
      })

    set({ comments: updateComment(comments) })

    try {
      const res = await communityApi.likeComment(commentId)
      if (res.code === 0) {
        const syncState = (list: Comment[]): Comment[] =>
          list.map((c) => {
            if (c.id === commentId) {
              return { ...c, isLiked: res.data.isLiked, likeCount: res.data.likeCount }
            }
            if (c.replies) {
              return { ...c, replies: syncState(c.replies) }
            }
            return c
          })
        set({ comments: syncState(get().comments) })
      }
    } catch {
      set({ comments })
    }
  },

  addComment: async (postId, content, parentId?) => {
    try {
      const res = await communityApi.addComment(postId, content, parentId)
      if (res.code === 0) {
        const { comments, currentPost } = get()
        set({
          comments: [...comments, res.data],
        })
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

  collectPost: async (postId) => {
    const { currentPost } = get()
    if (!currentPost) return

    const previous = currentPost
    set({
      currentPost: { ...currentPost, isCollected: !currentPost.isCollected },
    })

    try {
      await communityApi.collectPost(postId)
    } catch {
      set({ currentPost: previous })
    }
  },

  loadComments: async (postId) => {
    const { loading } = get()
    if (loading) return

    set({ loading: true })
    try {
      const res = await communityApi.getComments(postId)
      if (res.code === 0) {
        set({ comments: res.data.comments, loading: false })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },
}))

interface CreateState {
  content: string
  images: string[]
  submitting: boolean
  setContent: (content: string) => void
  addImage: (path: string) => void
  removeImage: (index: number) => void
  submit: () => Promise<void>
}

export const useCreateStore = create<CreateState>((set, get) => ({
  content: '',
  images: [],
  submitting: false,

  setContent: (content) => {
    set({ content })
  },

  addImage: (path) => {
    const { images } = get()
    if (images.length < 9) {
      set({ images: [...images, path] })
    }
  },

  removeImage: (index) => {
    const { images } = get()
    set({ images: images.filter((_, i) => i !== index) })
  },

  submit: async () => {
    const { content, images } = get()
    set({ submitting: true })
    try {
      await communityApi.createPost({ content, images })
      set({ content: '', images: [], submitting: false })
    } catch (error) {
      set({ submitting: false })
      throw error
    }
  },
}))
