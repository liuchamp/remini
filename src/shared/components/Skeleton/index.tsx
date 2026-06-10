import { View } from '@tarojs/components'
import './index.scss'

export interface SkeletonProps {
  variant?: 'card' | 'list' | 'detail' | 'profile' | 'product'
  count?: number
  animated?: boolean
  className?: string
}

export function Skeleton({
  variant = 'card',
  count = 1,
  animated = true,
  className = ''
}: SkeletonProps) {
  const renderCardSkeleton = () => (
    <View className='skeleton-card'>
      <View className='skeleton-card-image' />
      <View className='skeleton-card-content'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-subtitle' />
        <View className='skeleton-card-footer'>
          <View className='skeleton-line skeleton-line-price' />
          <View className='skeleton-line skeleton-line-button' />
        </View>
      </View>
    </View>
  )

  const renderListSkeleton = () => (
    <View className='skeleton-list-item'>
      <View className='skeleton-avatar' />
      <View className='skeleton-list-content'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
    </View>
  )

  const renderDetailSkeleton = () => (
    <View className='skeleton-detail'>
      <View className='skeleton-detail-image' />
      <View className='skeleton-detail-info'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-price' />
        <View className='skeleton-line skeleton-line-subtitle' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
    </View>
  )

  const renderProfileSkeleton = () => (
    <View className='skeleton-profile'>
      <View className='skeleton-avatar-large' />
      <View className='skeleton-profile-info'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
      <View className='skeleton-profile-stats'>
        <View className='skeleton-stat' />
        <View className='skeleton-stat' />
        <View className='skeleton-stat' />
      </View>
    </View>
  )

  const renderProductSkeleton = () => (
    <View className='skeleton-product'>
      <View className='skeleton-product-swiper' />
      <View className='skeleton-product-info'>
        <View className='skeleton-line skeleton-line-title' />
        <View className='skeleton-line skeleton-line-price' />
        <View className='skeleton-line skeleton-line-subtitle' />
      </View>
    </View>
  )

  const renderers = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    detail: renderDetailSkeleton,
    profile: renderProfileSkeleton,
    product: renderProductSkeleton,
  }

  return (
    <View className={`skeleton ${animated ? 'skeleton-animated' : ''} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className='skeleton-item'>
          {renderers[variant]()}
        </View>
      ))}
    </View>
  )
}

export default Skeleton
