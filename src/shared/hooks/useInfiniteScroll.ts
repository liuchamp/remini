import { useEffect, useState } from 'react'

export function useInfiniteScroll(
  callback: () => Promise<void>,
  hasMore: boolean,
  loading: boolean
) {
  const [reachBottom, setReachBottom] = useState(false)

  useEffect(() => {
    if (!hasMore || loading || !reachBottom) return
    callback()
    setReachBottom(false)
  }, [reachBottom, hasMore, loading])

  return {
    onReachBottom: () => setReachBottom(true),
    onScrollToLower: () => setReachBottom(true)
  }
}
