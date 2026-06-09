import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, Input, Textarea, Picker, Button } from '@tarojs/components'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productApi } from '@/domains/product/api'
import MediaUploader from '@/shared/components/common/MediaUploader'
import './index.scss'

const CONDITION_OPTIONS = [
  { labelKey: 'conditions.new', value: 'new' },
  { labelKey: 'conditions.likeNew', value: 'like_new' },
  { labelKey: 'conditions.good', value: 'good' },
  { labelKey: 'conditions.fair', value: 'fair' },
  { labelKey: 'conditions.poor', value: 'poor' }
]

export default function Edit() {
  const { t } = useTranslation(['product', 'common'])
  const [productId, setProductId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [conditionIndex, setConditionIndex] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [categoryIndex, setCategoryIndex] = useState(-1)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useLoad(async (options) => {
    const id = options?.id
    if (!id) {
      Taro.showToast({ title: t('loadFailed'), icon: 'none' })
      Taro.navigateBack()
      return
    }
    setProductId(id)

    try {
      const [productRes, catRes] = await Promise.all([
        productApi.getDetail(id),
        productApi.getCategories()
      ])

      if (catRes.code === 0) {
        setCategories(catRes.data)
      }

      if (productRes.code === 0) {
        const p = productRes.data
        setTitle(p.title || '')
        setDescription(p.description || '')
        setPrice(String(p.price || ''))
        setImages(p.images || [])
        setIsNegotiable(p.isNegotiable ?? false)
        setCategoryId(p.categoryId || '')

        const condIdx = CONDITION_OPTIONS.findIndex((c) => c.value === p.condition)
        setConditionIndex(condIdx >= 0 ? condIdx : 0)

        if (catRes.code === 0 && p.categoryId) {
          const catIdx = catRes.data.findIndex((c: Category) => c.id === p.categoryId)
          setCategoryIndex(catIdx >= 0 ? catIdx : -1)
        }
      }
    } catch {
      Taro.showToast({ title: t('loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  })

  const handleCategoryChange = (e: any) => {
    const index = e.detail.value as number
    setCategoryIndex(index)
    setCategoryId(categories[index]?.id || '')
  }

  const handleConditionChange = (e: any) => {
    setConditionIndex(e.detail.value as number)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: t('publishTitleRequired'), icon: 'none' })
      return
    }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      Taro.showToast({ title: t('publishPriceInvalid'), icon: 'none' })
      return
    }
    if (images.length === 0) {
      Taro.showToast({ title: t('publishImageRequired'), icon: 'none' })
      return
    }
    if (!categoryId) {
      Taro.showToast({ title: t('publishCategoryRequired'), icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await productApi.update(productId, {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        condition: CONDITION_OPTIONS[conditionIndex].value,
        categoryId,
        images,
        isNegotiable
      })
      if (res.code === 0) {
        Taro.showToast({ title: t('publishSuccess'), icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 800)
      }
    } catch {
      /* handled by HttpClient interceptors */
    } finally {
      setSubmitting(false)
    }
  }

  const categoryNames = categories.map((c) => c.name)
  const conditionLabels = CONDITION_OPTIONS.map((c) => t(c.labelKey))
  const canSubmit = title.trim().length > 0 && parseFloat(price) > 0 && images.length > 0 && !!categoryId

  if (loading) {
    return (
      <View className='edit-loading'>
        <Text className='loading-text'>{t('loadingMore')}</Text>
      </View>
    )
  }

  return (
    <View className='edit-page'>
      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>{t('productTitle')}</Text>
          <Input
            className='form-input'
            type='text'
            placeholder={t('publishTitlePlaceholder')}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('productDesc')}</Text>
          <Textarea
            className='form-textarea'
            placeholder={t('publishDescPlaceholder')}
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('productPrice')}</Text>
          <View className='price-input-wrap'>
            <Text className='price-currency'>¥</Text>
            <Input
              className='price-input'
              type='digit'
              placeholder='0.00'
              value={price}
              onInput={(e) => setPrice(e.detail.value)}
            />
          </View>
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('productCategory')}</Text>
          <Picker
            mode='selector'
            range={categoryNames}
            value={categoryIndex}
            onChange={handleCategoryChange}
          >
            <View className={`picker-value ${categoryIndex === -1 ? 'placeholder' : ''}`}>
              {categoryIndex >= 0 ? categoryNames[categoryIndex] : t('publishCategoryPlaceholder')}
            </View>
          </Picker>
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('productCondition')}</Text>
          <Picker
            mode='selector'
            range={conditionLabels}
            value={conditionIndex}
            onChange={handleConditionChange}
          >
            <View className='picker-value'>
              {conditionLabels[conditionIndex]}
            </View>
          </Picker>
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('pricingMode')}</Text>
          <View className='pricing-toggle'>
            <View
              className={`toggle-option ${!isNegotiable ? 'active' : ''}`}
              onClick={() => setIsNegotiable(false)}
            >
              <Text className='toggle-text'>{t('fixedPriceMode')}</Text>
            </View>
            <View
              className={`toggle-option ${isNegotiable ? 'active' : ''}`}
              onClick={() => setIsNegotiable(true)}
            >
              <Text className='toggle-text'>{t('negotiableMode')}</Text>
            </View>
          </View>
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('publishImageSectionTitle')}</Text>
          <MediaUploader
            maxCount={9}
            images={images}
            onChange={setImages}
          />
        </View>
      </View>

      <View className='submit-bar'>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit || submitting}
        >
          {submitting ? t('publishing') : t('app.save', { ns: 'common' })}
        </Button>
      </View>
    </View>
  )
}
