import { View, Text, Input, Textarea, Picker, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { productApi } from '@/domains/product/api'
import MediaUploader from '@/shared/components/common/MediaUploader'
import './index.scss'

const CONDITION_OPTIONS = [
  { label: '全新', value: 'new' },
  { label: '几乎全新', value: 'like_new' },
  { label: '良好', value: 'good' },
  { label: '一般', value: 'fair' },
  { label: '较差', value: 'poor' }
]

export default function Publish() {
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

  useLoad(() => {
    loadCategories()
  })

  const loadCategories = async () => {
    try {
      const res = await productApi.getCategories()
      if (res.code === 0) {
        setCategories(res.data)
      }
    } catch {
      /* silent */
    }
  }

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
      Taro.showToast({ title: '请输入商品标题', icon: 'none' })
      return
    }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      Taro.showToast({ title: '请输入有效价格', icon: 'none' })
      return
    }
    if (images.length === 0) {
      Taro.showToast({ title: '请至少添加一张图片', icon: 'none' })
      return
    }
    if (!categoryId) {
      Taro.showToast({ title: '请选择商品分类', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await productApi.create({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        condition: CONDITION_OPTIONS[conditionIndex].value,
        categoryId,
        images,
        isNegotiable
      })
      if (res.code === 0) {
        Taro.showToast({ title: '发布成功', icon: 'success' })
        Taro.navigateBack()
      }
    } catch {
      /* handled by HttpClient interceptors */
    } finally {
      setSubmitting(false)
    }
  }

  const categoryNames = categories.map((c) => c.name)
  const conditionLabels = CONDITION_OPTIONS.map((c) => c.label)
  const canSubmit = title.trim().length > 0 && parseFloat(price) > 0 && images.length > 0 && !!categoryId

  return (
    <View className='publish-page'>
      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>商品标题</Text>
          <Input
            className='form-input'
            type='text'
            placeholder='请输入商品标题'
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>商品描述</Text>
          <Textarea
            className='form-textarea'
            placeholder='请描述您的商品状况、使用体验等'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>价格</Text>
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
          <Text className='form-label'>商品分类</Text>
          <Picker
            mode='selector'
            range={categoryNames}
            value={categoryIndex}
            onChange={handleCategoryChange}
          >
            <View className={`picker-value ${categoryIndex === -1 ? 'placeholder' : ''}`}>
              {categoryIndex >= 0 ? categoryNames[categoryIndex] : '请选择分类'}
            </View>
          </Picker>
        </View>

        <View className='form-group'>
          <Text className='form-label'>商品成色</Text>
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
          <Text className='form-label'>定价模式</Text>
          <View className='pricing-toggle'>
            <View
              className={`toggle-option ${!isNegotiable ? 'active' : ''}`}
              onClick={() => setIsNegotiable(false)}
            >
              <Text className='toggle-text'>固定价格</Text>
            </View>
            <View
              className={`toggle-option ${isNegotiable ? 'active' : ''}`}
              onClick={() => setIsNegotiable(true)}
            >
              <Text className='toggle-text'>可议价</Text>
            </View>
          </View>
        </View>

        <View className='form-group'>
          <Text className='form-label'>商品图片（最多9张）</Text>
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
          {submitting ? '发布中...' : '发布商品'}
        </Button>
      </View>
    </View>
  )
}
