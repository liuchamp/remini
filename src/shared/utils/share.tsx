import Taro, { useRouter } from '@tarojs/taro'
import React, { useEffect, createContext, useContext } from 'react'

export interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
}

export interface PageShareConfig extends ShareConfig {
  posterTemplate?: string
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  title: 'REMX 二手市场',
  path: '',
  imageUrl: ''
}

export const PAGE_SHARE_CONFIG: Record<string, PageShareConfig> = {
  '/pages/product/detail/index': {
    title: '好货分享',
    path: '',
    imageUrl: ''
  },
  '/pages/community/post/index': {
    title: '精彩帖子',
    path: '',
    imageUrl: ''
  },
  '/pages/invite/index/index': {
    title: '加入 REMX 二手市场',
    path: '',
    imageUrl: '/static/share/invite-default.png'
  },
  '/pages/user/profile/index': {
    title: '个人主页',
    path: '',
    imageUrl: ''
  },
  '/pages/checkin/index/index': {
    title: '每日签到',
    path: '',
    imageUrl: ''
  },
  '/pages/points/index/index': {
    title: '积分中心',
    path: '',
    imageUrl: ''
  }
}

// React Context for share configuration (not Redux)
const ShareContext = createContext<ShareConfig>(DEFAULT_SHARE_CONFIG)

export function ShareConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <ShareContext.Provider value={DEFAULT_SHARE_CONFIG}>
      {children}
    </ShareContext.Provider>
  )
}

export function mergeConfig(base: ShareConfig, override?: Partial<ShareConfig>): ShareConfig {
  return { ...base, ...(override || {}) }
}

export function resolveTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => vars[key] || '')
}

/**
 * ShareProvider HOC — wraps page components with share message registration.
 * Uses React Context (not Redux) for configuration propagation.
 * overrides can be a static object or a function (props: P) => Partial<ShareConfig>
 * for runtime data injection.
 */
export function ShareProvider<P extends object>(
  Component: React.ComponentType<P>,
  overrides?: Partial<ShareConfig> | ((props: P) => Partial<ShareConfig>)
) {
  return function WrappedPage(props: P) {
    const router = useRouter()
    const path = router.path
    const contextConfig = useContext(ShareContext)
    const baseConfig = PAGE_SHARE_CONFIG[path] || DEFAULT_SHARE_CONFIG
    const resolvedOverrides = typeof overrides === 'function' ? overrides(props) : overrides
    const merged = mergeConfig(mergeConfig(baseConfig, contextConfig), resolvedOverrides)

    useEffect(() => {
      Taro.useShareAppMessage?.(() => ({
        title: merged.title,
        path: merged.path || path,
        imageUrl: merged.imageUrl
      }))

      Taro.useShareTimeline?.(() => ({
        title: merged.title || 'REMX 二手市场',
        query: 'from=share_timeline'
      }))

      Taro.showShareMenu?.({
        withShareTicket: true
      })
    }, [path, merged.title, merged.path, merged.imageUrl])

    return <Component {...props} />
  }
}
