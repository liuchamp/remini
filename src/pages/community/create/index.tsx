import Taro, { navigateBack, chooseImage } from '@tarojs/taro'
import { View, Text, Textarea, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import { useCreateStore } from '@/domains/community/store'
import Loading from '@/shared/components/Loading'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

export default function Create() {
  const { t } = useTranslation(['community', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const {
    content,
    images,
    submitting,
    setContent,
    addImage,
    removeImage,
    submit,
  } = useCreateStore()

  const handleChooseImage = async () => {
    try {
      const res = await chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      res.tempFilePaths.forEach((path) => {
        addImage(path)
      })
    } catch (error) {
      console.error('Failed to choose image:', error)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    try {
      await submit()
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Failed to submit:', error)
      Taro.showToast({ title: '发布失败', icon: 'none' })
    }
  }

  return (
    <ErrorBoundary>
      <View className='create-page'>
        <View className='header'>
          <Text className='cancel-btn' onClick={() => navigateBack()}>
            取消
          </Text>
          <Text className='title'>发布帖子</Text>
          <View
            className={`submit-btn ${submitting ? 'disabled' : ''}`}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loading type='spinner' />
            ) : (
              <Text className='submit-text'>发布</Text>
            )}
          </View>
        </View>

        <View className='content-area'>
          <Textarea
            className='textarea'
            placeholder='分享你的想法...'
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
          />
          <Text className='char-count'>{content.length}/500</Text>
        </View>

        <View className='image-section'>
          <View className='image-grid'>
            {images.map((image, index) => (
              <View key={index} className='image-item'>
                <Image className='image' src={image} mode='aspectFill' />
                <View
                  className='delete-btn'
                  onClick={() => removeImage(index)}
                >
                  <Text className='delete-icon'>×</Text>
                </View>
              </View>
            ))}

            {images.length < 9 && (
              <View className='add-image' onClick={handleChooseImage}>
                <Text className='add-icon'>+</Text>
                <Text className='add-text'>添加图片</Text>
              </View>
            )}
          </View>
        </View>

        <View className='options-section'>
          <View className='option-item'>
            <Text className='option-icon'>🔗</Text>
            <Text className='option-text'>关联商品</Text>
          </View>
          <View className='option-item'>
            <Text className='option-icon'>👥</Text>
            <Text className='option-text'>选择圈子</Text>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  )
}
