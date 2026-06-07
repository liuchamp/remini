import { View, Image, Text } from '@tarojs/components'
import { useState, useCallback } from 'react'
import './index.scss'

interface LazyImageProps {
  src: string
  className?: string
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'heightFix' | 'scaleToFill'
  style?: React.CSSProperties
  round?: boolean
  showLoading?: boolean
  fallbackSrc?: string
  onClick?: () => void
}

const FALLBACK_IMAGE = '' // empty string lets us show the error placeholder

export default function LazyImage({
  src,
  className = '',
  mode = 'aspectFill',
  style,
  round = false,
  showLoading = true,
  fallbackSrc,
  onClick,
}: LazyImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error'
  )

  const handleLoad = useCallback(() => {
    setStatus('loaded')
  }, [])

  const handleError = useCallback(() => {
    if (fallbackSrc && fallbackSrc !== src) {
      // If fallback is available, the Image's src change will trigger a retry
      // We just set to loaded since the fallback might be a local asset
      setStatus('loaded')
    } else {
      setStatus('error')
    }
  }, [fallbackSrc, src])

  // If fallback is set, use error handler to switch src
  const resolvedSrc =
    status === 'error' && fallbackSrc ? fallbackSrc : src

  return (
    <View
      className={`lazy-image-wrapper ${className} ${round ? 'lazy-image-round' : ''}`}
      style={style}
      onClick={onClick}
    >
      {showLoading && status === 'loading' && (
        <View className='lazy-image-placeholder'>
          <View className='lazy-image-shimmer' />
        </View>
      )}

      {status === 'error' && !fallbackSrc && (
        <View className='lazy-image-error'>
          <Text className='lazy-image-error-icon'>🖼️</Text>
          <Text className='lazy-image-error-text'>加载失败</Text>
        </View>
      )}

      <Image
        className={`lazy-image ${status === 'loaded' ? 'lazy-image-visible' : ''}`}
        src={resolvedSrc}
        mode={mode}
        lazyLoad
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  )
}
