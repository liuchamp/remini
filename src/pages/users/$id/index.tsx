import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import { useUserStore } from '@/domains/user/store'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

export default function UserProfile() {
  const router = useRouter()
  const { id: userId } = router.params as { id: string }
  const { isLoggedIn } = useAuthStore()
  const {
    profile,
    userProducts,
    userProductsHasMore,
    userReviews,
    userReviewsHasMore,
    profileLoading,
    loading,
    loadProfile,
    loadUserProducts,
    loadUserReviews,
    toggleFollow,
    clearProfile,
  } = useUserStore()

  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products')

  useLoad(() => {
    if (!userId) {
      Taro.showToast({ title: '参数错误', icon: 'none' })
      Taro.navigateBack()
      return
    }
    loadProfile(userId)
    loadUserProducts(userId, true)
    loadUserReviews(userId, true)
  })

  useEffect(() => {
    return () => clearProfile()
  }, [])

  const handleFollow = () => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/auth/login/index' })
      return
    }
    toggleFollow(userId)
  }

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${productId}` })
  }

  const handleLoadMore = () => {
    if (!loading) {
      if (activeTab === 'products' && userProductsHasMore) {
        loadUserProducts(userId)
      } else if (activeTab === 'reviews' && userReviewsHasMore) {
        loadUserReviews(userId)
      }
    }
  }

  const renderStars = (rating: number) => {
    const filled = Math.floor(rating)
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} className={`star ${i < filled ? 'filled' : ''}`}>
          {i < filled ? '★' : '☆'}
        </Text>
      )
    }
    return stars
  }

  if (profileLoading && !profile) {
    return (
      <View className='user-profile-page'>
        <View className='status-text'>加载中...</View>
      </View>
    )
  }

  if (!profile) {
    return (
      <View className='user-profile-page'>
        <View className='status-text'>用户不存在</View>
      </View>
    )
  }

  const trustPercent = Math.min(profile.trustScore, 100)
  const trustColor =
    trustPercent >= 80 ? '#00B894' : trustPercent >= 50 ? '#FDCB6E' : '#E17055'

  return (
    <View className='user-profile-page'>
      <View className='profile-header'>
        <Image
          className='profile-avatar'
          src={profile.avatar}
          mode='aspectFill'
        />
        <View className='profile-meta'>
          <View className='name-row'>
            <Text className='profile-name'>{profile.username}</Text>
            {profile.isVerified && (
              <Text className='verified-icon'>✓</Text>
            )}
          </View>
          {profile.bio && (
            <Text className='profile-bio'>{profile.bio}</Text>
          )}
          <View className='trust-row'>
            <Text className='trust-label'>信用分</Text>
            <View className='trust-bar-bg'>
              <View
                className='trust-bar-fill'
                style={{
                  width: `${trustPercent}%`,
                  backgroundColor: trustColor,
                }}
              />
            </View>
            <Text className='trust-value' style={{ color: trustColor }}>
              {profile.trustScore}
            </Text>
          </View>
        </View>
      </View>

      <View className='stats-row'>
        <View className='stat-item'>
          <Text className='stat-value'>{profile.productCount}</Text>
          <Text className='stat-label'>商品</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{profile.followerCount}</Text>
          <Text className='stat-label'>粉丝</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{profile.followingCount}</Text>
          <Text className='stat-label'>关注</Text>
        </View>
      </View>

      <View className='follow-btn-wrap'>
        <View
          className={`follow-btn ${profile.isFollowed ? 'followed' : ''}`}
          onClick={handleFollow}
        >
          <Text>
            {profile.isFollowed ? '已关注' : '+ 关注'}
          </Text>
        </View>
      </View>

      <View className='tab-bar'>
        <View
          className={`tab-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Text>商品</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Text>评价</Text>
        </View>
      </View>

      <ScrollView
        className='content-scroll'
        scrollY
        onScrollToLower={handleLoadMore}
        lowerThreshold={100}
      >
        {activeTab === 'products' && (
          <View className='products-tab'>
            {userProducts.length === 0 && !loading ? (
              <View className='empty-hint'>暂无商品</View>
            ) : (
              <View className='product-grid'>
                {userProducts.map((product) => (
                  <View
                    key={product.id}
                    className='product-card'
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Image
                      className='product-image'
                      src={product.images?.[0] || ''}
                      mode='aspectFill'
                      lazyLoad
                    />
                    <View className='product-info'>
                      <Text className='product-title'>{product.title}</Text>
                      <View className='product-price-row'>
                        <Text className='product-price'>¥{product.price}</Text>
                        {product.isNegotiable && (
                          <Text className='negotiable-tag'>可议价</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className='reviews-tab'>
            {userReviews.length === 0 && !loading ? (
              <View className='empty-hint'>暂无评价</View>
            ) : (
              <View className='reviews-list'>
                {userReviews.map((review) => (
                  <View key={review.id} className='review-card'>
                    <View className='review-header'>
                      <Image
                        className='reviewer-avatar'
                        src={review.reviewerAvatar}
                        mode='aspectFill'
                        lazyLoad
                      />
                      <View className='reviewer-info'>
                        <Text className='reviewer-name'>
                          {review.reviewerName}
                        </Text>
                        <View className='review-stars'>
                          {renderStars(review.rating)}
                        </View>
                      </View>
                      <Text className='review-date'>
                        {review.createdAt?.slice(0, 10)}
                      </Text>
                    </View>
                    {review.content && (
                      <Text className='review-content'>{review.content}</Text>
                    )}
                    {review.images && review.images.length > 0 && (
                      <View className='review-images'>
                        {review.images.map((img, idx) => (
                          <Image
                            key={idx}
                            className='review-image'
                            src={img}
                            mode='aspectFill'
                            lazyLoad
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {loading && <View className='loading-more'>加载中...</View>}
      </ScrollView>
    </View>
  )
}
