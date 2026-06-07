import { useState, useCallback } from 'react'
import Taro from '@tarojs/taro'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
}

export function usePullToRefresh({ onRefresh }: UsePullToRefreshOptions) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }
  }, [onRefresh])

  return { refreshing, handleRefresh }
}
