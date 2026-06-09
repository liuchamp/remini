import Taro, { navigateBack, chooseImage, useLoad } from '@tarojs/taro'
import { View, Text, Textarea, Image } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateStore } from '@/domains/community/store'
import Loading from '@/shared/components/Loading'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import './index.scss'

const DRAFT_KEY = 'community_create_draft'

interface DraftData {
  content: string
  images: string[]
  savedAt: string
}

function saveDraft(content: string, images: string[]) {
  const draft: DraftData = { content, images, savedAt: new Date().toISOString() }
  Taro.setStorageSync(DRAFT_KEY, draft)
}

function loadDraft(): DraftData | null {
  try {
    const raw = Taro.getStorageSync(DRAFT_KEY)
    return raw ? (raw as DraftData) : null
  } catch {
    return null
  }
}

function clearDraft() {
  Taro.removeStorageSync(DRAFT_KEY)
}

export default function Create() {
  const { t } = useTranslation(['community', 'common'])
  const {
    content,
    images,
    submitting,
    setContent,
    addImage,
    removeImage,
    submit,
  } = useCreateStore()

  const [draftRestored, setDraftRestored] = useState(false)

  // Restore draft on page load
  useLoad(() => {
    if (!draftRestored) {
      const draft = loadDraft()
      if (draft && (draft.content || draft.images.length > 0)) {
        setContent(draft.content)
        draft.images.forEach((img) => addImage(img))
        Taro.showToast({
          title: t('create.draftRestored'),
          icon: 'none',
          duration: 2000,
        })
      }
      setDraftRestored(true)
    }
  })

  // Auto-save draft on content/image changes (debounced)
  useEffect(() => {
    if (!draftRestored) return
    const timer = setTimeout(() => {
      saveDraft(content, images)
    }, 1000)
    return () => clearTimeout(timer)
  }, [content, images, draftRestored])

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
      Taro.showToast({ title: t('create.contentRequired'), icon: 'none' })
      return
    }

    try {
      await submit()
      clearDraft()
      Taro.showToast({ title: t('create.success'), icon: 'success' })
      setTimeout(() => {
        navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Failed to submit:', error)
      Taro.showToast({ title: t('create.failed'), icon: 'none' })
    }
  }

  return (
    <ErrorBoundary>
      <View className='create-page'>
        <View className='header'>
          <Text className='cancel-btn' onClick={() => navigateBack()}>
            {t('common:action.cancel')}
          </Text>
          <Text className='title'>{t('create.title')}</Text>
          <View
            className={`submit-btn ${submitting ? 'disabled' : ''}`}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loading type='spinner' />
            ) : (
              <Text className='submit-text'>{t('create.submit')}</Text>
            )}
          </View>
        </View>

        <View className='content-area'>
          <Textarea
            className='textarea'
            placeholder={t('create.contentPlaceholder')}
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
                <Text className='add-text'>{t('create.addImage')}</Text>
              </View>
            )}
          </View>
        </View>

        <View className='options-section'>
          <View className='option-item'>
            <Text className='option-icon'>🔗</Text>
            <Text className='option-text'>{t('create.linkProduct')}</Text>
          </View>
          <View className='option-item'>
            <Text className='option-icon'>👥</Text>
            <Text className='option-text'>{t('create.selectCircle')}</Text>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  )
}
