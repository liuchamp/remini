import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { kycApi, type IdentityOcrResult } from '@/domains/kyc/api'
import { useAuthStore } from '@/domains/auth/store'
import MediaUploader from '@/shared/components/common/MediaUploader'
import './index.scss'

export default function Identity() {
  const { t } = useTranslation('kyc')
  const { updateUser } = useAuthStore()

  const [frontImage, setFrontImage] = useState<string>('')
  const [backImage, setBackImage] = useState<string>('')
  const [name, setName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [frontOcrLoading, setFrontOcrLoading] = useState(false)
  const [backOcrLoading, setBackOcrLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFrontUpload = useCallback(async (urls: string[]) => {
    setFrontImage(urls[0] || '')
    if (urls[0]) {
      await recognizeIdCard(urls[0], 'front')
    }
  }, [])

  const handleBackUpload = useCallback(async (urls: string[]) => {
    setBackImage(urls[0] || '')
    if (urls[0]) {
      await recognizeIdCard(urls[0], 'back')
    }
  }, [])

  const recognizeIdCard = async (imageUrl: string, side: 'front' | 'back') => {
    if (side === 'front') setFrontOcrLoading(true)
    else setBackOcrLoading(true)

    try {
      const res = await kycApi.ocrIdCard(imageUrl, side)
      if (res.code === 0 && res.data) {
        const data = res.data as IdentityOcrResult
        if (data.name && !name) setName(data.name)
        if (data.idNumber && !idNumber) setIdNumber(data.idNumber)
        Taro.showToast({ title: t('identity.ocrSuccess'), icon: 'success' })
      } else {
        Taro.showToast({ title: t('identity.ocrFailed'), icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: t('identity.ocrFailed'), icon: 'none' })
    } finally {
      if (side === 'front') setFrontOcrLoading(false)
      else setBackOcrLoading(false)
    }
  }

  const validateIdNumber = (id: string): boolean => {
    return /(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(id)
  }

  const handleSubmit = async () => {
    if (!frontImage) {
      Taro.showToast({ title: t('identity.frontImageRequired'), icon: 'none' })
      return
    }
    if (!backImage) {
      Taro.showToast({ title: t('identity.backImageRequired'), icon: 'none' })
      return
    }
    if (!name.trim()) {
      Taro.showToast({ title: t('identity.nameRequired'), icon: 'none' })
      return
    }
    if (!idNumber.trim()) {
      Taro.showToast({ title: t('identity.idNumberRequired'), icon: 'none' })
      return
    }
    if (!validateIdNumber(idNumber)) {
      Taro.showToast({ title: t('identity.idNumberInvalid'), icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await kycApi.submitIdentity({
        frontImageUrl: frontImage,
        backImageUrl: backImage,
        name: name.trim(),
        idNumber: idNumber.trim()
      })
      if (res.code === 0) {
        Taro.showToast({ title: t('identity.submitSuccess'), icon: 'success' })
        updateUser({ currentKycTier: 'L1' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch {
      /* handled by interceptors */
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = frontImage && backImage && name.trim() && idNumber.trim() && validateIdNumber(idNumber)

  return (
    <View className='kyc-identity-page'>
      <View className='page-header'>
        <Text className='page-title'>{t('identity.title')}</Text>
        <Text className='page-desc'>{t('identity.subtitle')}</Text>
      </View>

      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>{t('identity.frontSide')}</Text>
          <Text className='form-hint'>{t('identity.frontSideDesc')}</Text>
          <MediaUploader
            maxCount={1}
            images={frontImage ? [frontImage] : []}
            onChange={handleFrontUpload}
          />
          {frontOcrLoading && (
            <View className='ocr-loading'>
              <Text className='ocr-loading-text'>{t('identity.ocrProcessing')}</Text>
            </View>
          )}
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('identity.backSide')}</Text>
          <Text className='form-hint'>{t('identity.backSideDesc')}</Text>
          <MediaUploader
            maxCount={1}
            images={backImage ? [backImage] : []}
            onChange={handleBackUpload}
          />
          {backOcrLoading && (
            <View className='ocr-loading'>
              <Text className='ocr-loading-text'>{t('identity.ocrProcessing')}</Text>
            </View>
          )}
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('identity.name')}</Text>
          <Input
            className='form-input'
            type='text'
            placeholder={t('identity.namePlaceholder')}
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('identity.idNumber')}</Text>
          <Input
            className='form-input'
            type='text'
            placeholder={t('identity.idNumberPlaceholder')}
            value={idNumber}
            onInput={(e) => setIdNumber(e.detail.value.toUpperCase())}
            maxlength={18}
          />
        </View>
      </View>

      <View className='review-notice'>
        <Text className='notice-icon'>⏱</Text>
        <Text className='notice-text'>{t('identity.reviewNotice')}</Text>
      </View>

      <View className='submit-bar'>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit || submitting || frontOcrLoading || backOcrLoading}
        >
          {submitting ? t('identity.submitting') : t('identity.submit')}
        </Button>
      </View>
    </View>
  )
}
