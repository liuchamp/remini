import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { View, Text, Image, Swiper, SwiperItem, Input, Button } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useProductStore } from '@/domains/product/store'
import { useAuthStore } from '@/domains/auth/store'
import { offerApi } from '@/domains/trade/offer'
import { ShareProvider } from '@/shared/utils/share'
import { NavigationService } from '@/shared/utils/navigation'
import { PosterGenerator } from '@/shared/components/share/PosterGenerator'
import Loading from '@/shared/components/Loading'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { Breadcrumb } from '@/shared/components/Breadcrumb'
import './index.scss'

function Detail() {
  const { t } = useTranslation(['product', 'common'])
  const [id, setId] = useState('')
  const [currentSwiperIndex, setCurrentSwiperIndex] = useState(0)
  const [showOfferPanel, setShowOfferPanel] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const [posterVisible, setPosterVisible] = useState(false)

  const { currentProduct, loading, loadDetail, toggleFavorite, isFavorited } = useProductStore()
  const { isLoggedIn } = useAuthStore()

  useLoad((options) => {
    const productId = options?.id
    if (productId) {
      setId(productId)
      loadDetail(productId)
    }
  })

  useDidShow(() => {
    if (id && !currentProduct) {
      loadDetail(id)
    }
  })

  const handleSwiperChange = useCallback(
    (e: { detail: { current: number } }) => {
      setCurrentSwiperIndex(e.detail.current)
    },
    []
  )

  const handleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      NavigationService.safeNavigateTo('/pages/auth/login/index')
      return
    }
    if (!id || favoriting) return
    setFavoriting(true)
    try {
      await toggleFavorite(id)
    } finally {
      setFavoriting(false)
    }
  }, [id, isLoggedIn, favoriting, toggleFavorite])

  const handleBuyNow = useCallback(async () => {
    if (!isLoggedIn) {
      NavigationService.safeNavigateTo('/pages/auth/login/index')
      return
    }
    NavigationService.safeNavigateTo(`/pages/order/create/index?productId=${id}`)
  }, [id, isLoggedIn])

  const handleSubmitOffer = useCallback(async () => {
    const amountNum = parseFloat(offerAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      Taro.showToast({ title: t('offerAmountInvalid'), icon: 'none' })
      return
    }
    if (currentProduct && amountNum >= currentProduct.price) {
      Taro.showToast({ title: t('offerLessThanPrice'), icon: 'none' })
      return
    }

    setSubmittingOffer(true)
    try {
      const res = await offerApi.create({
        productId: id,
        amount: amountNum,
        note: offerNote.trim() || undefined
      })
      if (res.code === 0) {
        Taro.showToast({ title: t('offerSubmitSuccess'), icon: 'success' })
        setShowOfferPanel(false)
        setOfferAmount('')
        setOfferNote('')
      }
    } catch {
      /* handled by HttpClient interceptors */
    } finally {
      setSubmittingOffer(false)
    }
  }, [offerAmount, offerNote, id, currentProduct])

  const handleChat = useCallback(() => {
    if (!isLoggedIn) {
      NavigationService.safeNavigateTo('/pages/auth/login/index')
      return
    }
    if (currentProduct?.seller?.id) {
      NavigationService.safeNavigateTo(`/pages/chat/conversation/index?userId=${currentProduct.seller.id}&productId=${id}`)
    }
  }, [id, currentProduct, isLoggedIn])

  const handleShare = useCallback(() => {
    if (!currentProduct) return
    setPosterVisible(true)
  }, [currentProduct])

  const formatDistance = (km: number | undefined): string => {
    if (km == null) return ''
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
  }

  const conditionLabel: Record<string, string> = {
    new: t('conditions.new'),
    like_new: t('conditions.likeNew'),
    good: t('conditions.good'),
    fair: t('conditions.fair'),
    poor: t('conditions.poor')
  }

  const product = currentProduct
  const productImages = product?.images || []
  const hasFavorite = isFavorited

  if (loading && !product) {
    return (
      <View>
        <Breadcrumb items={[
          { label: '首页', path: '/pages/index/index' },
          { label: '分类', path: '/pages/category/index' },
          { label: '商品详情' }
        ]} />
        <View className='detail-page'>
          <Loading type='skeleton' rows={4} />
        </View>
      </View>
    )
  }

  if (!product) {
    return (
      <View>
        <Breadcrumb items={[
          { label: '首页', path: '/pages/index/index' },
          { label: '分类', path: '/pages/category/index' },
          { label: '商品详情' }
        ]} />
        <View className='detail-page'>
          <View className='detail-loading'>
            <Text className='empty-text'>{t('notFound')}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View>
      <Breadcrumb items={[
        { label: '首页', path: '/pages/index/index' },
        { label: '分类', path: '/pages/category/index' },
        { label: '商品详情' }
      ]} />
      <View className='detail-page'>
        <View className='swiper-wrap'>
          {productImages.length > 0 ? (
            <Swiper
              className='detail-swiper'
              current={currentSwiperIndex}
              indicatorDots={productImages.length > 1}
              indicatorColor='rgba(255,255,255,0.5)'
              indicatorActiveColor='#FF6B35'
              autoplay={false}
              circular
              onChange={handleSwiperChange}
            >
              {productImages.map((img, idx) => (
                <SwiperItem key={idx}>
                  <Image
                    className='swiper-image'
                    src={img}
                    mode='aspectFill'
                    onClick={() => {
                      Taro.previewImage({
                        current: img,
                        urls: productImages
                      })
                    }}
                  />
                </SwiperItem>
              ))}
            </Swiper>
          ) : (
            <View className='swiper-placeholder'>
              <Text className='placeholder-icon'>📷</Text>
            </View>
          )}
          {productImages.length > 1 && (
            <View className='image-counter'>
              {currentSwiperIndex + 1}/{productImages.length}
            </View>
          )}
        </View>

        <View className='info-section'>
          <View className='price-row'>
            <Text className='detail-price'>¥{product.price}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text className='original-price'>¥{product.originalPrice}</Text>
            )}
            {product.isNegotiable && (
              <Text className='negotiable-badge'>{t('negotiable')}</Text>
            )}
          </View>
          <Text className='detail-title'>{product.title}</Text>
          <View className='meta-row'>
            <Text className='meta-item'>{conditionLabel[product.condition] || product.condition}</Text>
            <Text className='meta-divider'>|</Text>
            <Text className='meta-item'>{t('viewCount', { count: product.viewCount })}</Text>
            <Text className='meta-divider'>|</Text>
            <Text className='meta-item'>{t('favoriteCount', { count: product.favoriteCount })}</Text>
          </View>
          {product.distance != null && (
            <View className='distance-row'>
              <Text className='distance-icon'>📍</Text>
              <Text className='distance-text'>
                {product.location ? `${product.location} · ` : ''}{formatDistance(product.distance)}
              </Text>
            </View>
          )}
        </View>

        {product.description && (
          <View className='desc-section'>
            <Text className='section-title'>{t('productDesc')}</Text>
            <Text className='desc-content'>{product.description}</Text>
          </View>
        )}

        <View className='seller-section'>
          <Text className='section-title'>{t('sellerInfo')}</Text>
          <View className='seller-card' onClick={handleChat}>
            <Image
              className='seller-avatar'
              src={product.seller?.avatar || ''}
              mode='aspectFill'
            />
            <View className='seller-info'>
              <Text className='seller-name'>{product.seller?.username || t('anonymous')}</Text>
              <View className='seller-stats'>
                <Text className='seller-stat'>
                  {t('common:trustScore', { ns: 'common' }) || t('common:app.name', { ns: 'common' })} {product.seller?.trustScore || 0}
                </Text>
                {product.seller?.isVerified && (
                  <Text className='verified-tag'>已认证</Text>
                )}
              </View>
            </View>
            <View className='chat-btn-c'>
              <Text className='chat-btn-text'>联系卖家</Text>
            </View>
          </View>
        </View>

        <View className='action-bar'>
          <View className='action-left'>
            <View className='action-item' onClick={handleFavorite}>
              <Text className={`action-icon ${hasFavorite ? 'favorited' : ''}`}>
                {hasFavorite ? '❤️' : '🤍'}
              </Text>
              <Text className='action-label'>收藏</Text>
            </View>
            <View className='action-item' onClick={handleChat}>
              <Text className='action-icon'>💬</Text>
              <Text className='action-label'>聊天</Text>
            </View>
            <View className='action-item' onClick={handleShare}>
              <Text className='action-icon'>↗️</Text>
              <Text className='action-label'>分享</Text>
            </View>
          </View>
          <View className='action-right'>
            {product.isNegotiable && (
              <Button
                className='offer-btn'
                onClick={() => {
                  if (!isLoggedIn) {
                    NavigationService.safeNavigateTo('/pages/auth/login/index')
                    return
                  }
                  setShowOfferPanel(true)
                  setOfferAmount('')
                  setOfferNote('')
                }}
              >
                我要出价
              </Button>
            )}
            <Button className='buy-btn' onClick={handleBuyNow}>
              立即购买
            </Button>
          </View>
        </View>

        {showOfferPanel && (
          <View className='offer-overlay' onClick={() => setShowOfferPanel(false)}>
            <View className='offer-panel' onClick={(e) => e.stopPropagation()}>
              <View className='offer-header'>
                <Text className='offer-title'>出价</Text>
                <Text
                  className='offer-close'
                  onClick={() => setShowOfferPanel(false)}
                >
                  ✕
                </Text>
              </View>
              <View className='offer-body'>
                <View className='offer-price-hint'>
                  <Text className='hint-label'>卖家标价</Text>
                  <Text className='hint-value'>¥{product.price}</Text>
                </View>
                <View className='offer-input-row'>
                  <Text className='offer-currency'>¥</Text>
                  <Input
                    className='offer-input'
                    type='digit'
                    placeholder='输入你的出价'
                    value={offerAmount}
                    onInput={(e) => setOfferAmount(e.detail.value)}
                    focus
                  />
                </View>
                <Input
                  className='offer-note'
                  type='text'
                  placeholder='备注信息（选填）'
                  value={offerNote}
                  onInput={(e) => setOfferNote(e.detail.value)}
                  maxlength={100}
                />
                <Button
                  className='submit-offer-btn'
                  onClick={handleSubmitOffer}
                  loading={submittingOffer}
                  disabled={!offerAmount || submittingOffer}
                >
                  {submittingOffer ? '提交中...' : '提交出价'}
                </Button>
              </View>
            </View>
          </View>
        )}

        <PosterGenerator
          type='product'
          visible={posterVisible}
          data={product}
          onClose={() => setPosterVisible(false)}
        />
      </View>
    </View>
  )
}

export default ShareProvider(Detail)
