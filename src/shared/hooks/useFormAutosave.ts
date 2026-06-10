import { useEffect, useRef, useCallback } from 'react'
import Taro from '@tarojs/taro'

export interface UseFormAutosaveOptions {
  key: string
  delay?: number
  enabled?: boolean
}

export function useFormAutosave<T>(
  data: T,
  options: UseFormAutosaveOptions
) {
  const { key, delay = 1000, enabled = true } = options
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  const loadSavedData = useCallback((): T | null => {
    try {
      const saved = Taro.getStorageSync(key)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [key])

  const save = useCallback(
    (dataToSave: T) => {
      try {
        Taro.setStorageSync(key, JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    },
    [key]
  )

  const clear = useCallback(() => {
    try {
      Taro.removeStorageSync(key)
    } catch (error) {
      console.error('Autosave clear failed:', error)
    }
  }, [key])

  useEffect(() => {
    if (!enabled) return

    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      save(data)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [data, delay, enabled, save])

  return {
    loadSavedData,
    save,
    clear,
  }
}

export default useFormAutosave
