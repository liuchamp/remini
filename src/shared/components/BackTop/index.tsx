import { View, Icon } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface BackTopProps {
  threshold?: number
  duration?: number
  visibilityHeight?: number
}

export const BackTop = ({
  threshold = 300,
  duration = 300,
  visibilityHeight = 300
}: BackTopProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const page = Taro.getCurrentInstance().page
    if (!page) return

    const handleScroll = (e) => {
      const scrollTop = e.detail.scrollTop
      setVisible(scrollTop > threshold)
    }

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
    <View className='back-top' onClick={scrollToTop}>
      <Icon type='scrollTop' size={24} color='#fff' />
    </View>
  )
}
