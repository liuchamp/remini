import { useState, useRef, useCallback, useMemo } from 'react'
import { ScrollView, View } from '@tarojs/components'
import './index.scss'

interface VirtualListProps<T> {
  data: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  onScroll?: (e: any) => void
}

export function VirtualList<T>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  onScroll
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + 2, data.length)

  const visibleData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  const totalHeight = data.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e) => {
    setScrollTop(e.detail.scrollTop)
    onScroll?.(e)
  }, [onScroll])

  return (
    <ScrollView
      className='virtual-list'
      scrollY
      onScroll={handleScroll}
      style={{ height: `${containerHeight}px` }}
    >
      <View className='virtual-list__phantom' style={{ height: `${totalHeight}px` }} />
      <View className='virtual-list__content' style={{ transform: `translateY(${offsetY}px)` }}>
        {visibleData.map((item, index) => (
          <View key={startIndex + index} className='virtual-list__item' style={{ height: `${itemHeight}px` }}>
            {renderItem(item, startIndex + index)}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
