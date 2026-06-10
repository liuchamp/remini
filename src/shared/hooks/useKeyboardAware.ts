import { useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'

export interface UseKeyboardAwareOptions {
  offset?: number
  animation?: boolean
}

export function useKeyboardAware(
  containerRef: React.RefObject<any>,
  options: UseKeyboardAwareOptions = {}
) {
  const { offset = 80, animation = true } = options

  useEffect(() => {
    const handleKeyboardChange = (res: any) => {
      if (res.height > 0) {
        const query = Taro.createSelectorQuery()
        query
          .select('.taro-textarea:focus, .taro-input:focus')
          .boundingClientRect((rect) => {
            if (rect && containerRef.current) {
              const scrollTop = containerRef.current.scrollTop || 0
              const elementTop = rect.top + scrollTop
              const viewportHeight = Taro.getSystemInfoSync().windowHeight

              if (elementTop + rect.height + offset > viewportHeight) {
                const scrollTo = elementTop - viewportHeight + rect.height + offset
                containerRef.current.scrollTo({
                  top: scrollTo,
                  animated: animation,
                })
              }
            }
          })
          .exec()
      }
    }

    Taro.onKeyboardHeightChange(handleKeyboardChange)

    return () => {
      Taro.offKeyboardHeightChange(handleKeyboardChange)
    }
  }, [containerRef, offset, animation])
}

export default useKeyboardAware
