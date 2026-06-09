import { useState, useCallback } from 'react'
import { View, Text, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '@/domains/trade/api'
import { REVIEW_TAGS, RATING_LABELS } from '@/domains/trade/types'
import './index.scss'

export default function ReviewPage() {
  const { t } = useTranslation(['trade', 'common'])
  const router = useRouter()
  const orderId = router.params.id || ''

  const [rating, setRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = useCallback((label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }, [])

  const chooseImage = useCallback(async () => {
    if (images.length >= 3) return
    const remaining = 3 - images.length
    const res = await Taro.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })
    const newImages = res.tempFiles.map((f) => f.tempFilePath)
    setImages((prev) => [...prev, ...newImages].slice(0, 3))
  }, [images.length])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!orderId) return
    setSubmitting(true)
    try {
      await tradeApi.submitReview(orderId, {
        rating,
        tags: selectedTags,
        content,
        images,
      })
      Taro.showToast({ title: t('trade:review.submitSuccess'), icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: t('common:error.submitFailed'), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }, [orderId, rating, selectedTags, content, images, t])

  return (
    <View className='review-page'>
      <View className='section'>
        <Text className='section-title'>{t('trade:review.ratingLabel')}</Text>
        <View className='star-rating'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </Text>
          ))}
        </View>
        <Text className='rating-label'>{RATING_LABELS[rating]}</Text>
      </View>

      <View className='section'>
        <Text className='section-title'>{t('trade:review.tagsLabel')}</Text>
        <View className='tag-list'>
          {REVIEW_TAGS.map((tag) => (
            <Text
              key={tag.id}
              className={`tag ${selectedTags.includes(tag.label) ? 'selected' : ''}`}
              onClick={() => toggleTag(tag.label)}
            >
              {tag.label}
            </Text>
          ))}
        </View>
      </View>

      <View className='section'>
        <Textarea
          className='content-input'
          placeholder={t('trade:review.contentPlaceholder')}
          maxlength={200}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
        />
        <Text className='char-count'>
          {t('trade:review.contentLimit', { count: content.length })}
        </Text>

        <View className='image-grid'>
          {images.map((img, i) => (
            <View key={i} className='image-item'>
              <Image src={img} mode='aspectFill' />
              <Text className='remove-btn' onClick={() => removeImage(i)}>×</Text>
            </View>
          ))}
          {images.length < 3 && (
            <View className='add-image-btn' onClick={chooseImage}>
              <Text>+{'\n'}{t('trade:review.addImage')}</Text>
            </View>
          )}
        </View>
      </View>

      <View className='submit-btn' onClick={handleSubmit}>
        <Text>{submitting ? t('common:app.loading') : t('trade:review.submit')}</Text>
      </View>
    </View>
  )
}
