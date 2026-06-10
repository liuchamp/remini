import { View, Icon } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface BackTopProps {
  threshold?: number
  duration?: number
}

export const BackTop = ({
  threshold = 300,
  duration = 300
}: BackTopProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const page = Taro.getCurrentInstance().page
    if (!page) return

    const handleScroll = (e: { detail: { scrollTop: number } }) => {
      const scrollTop = e.detail.scrollTop
      setVisible(scrollTop > threshold)
    }

    // Note: Direct assignment to page.onScroll is a Taro-specific pattern.
    // Only one component should use this; multiple assignments will overwrite each other.
    page.onScroll = handleScroll

    return () => {
      page.onScroll = undefined
    }
  }, [threshold])

  const scrollToTop = () => {
    Taro.pageScrollTo({
      scrollTop: 0,
      duration
    })
  }

  if (!visible) return null

  return (
    <View className='back-top' onClick={scrollToTop} role='button' aria-label='返回顶部'>
      <Icon type='scrollTop' size={24} color='#fff' />
    </View>
  )
}
