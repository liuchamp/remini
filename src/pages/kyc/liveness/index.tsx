import { useState } from 'react'
import { View, Text, Button, Camera } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { kycApi } from '@/domains/kyc/api'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

type Step = 'permission' | 'idle' | 'starting' | 'recording' | 'uploading' | 'success' | 'failed'

const CHALLENGE_KEYS: Record<string, string> = {
  blink: 'liveness.challenge_blink',
  nod: 'liveness.challenge_nod',
  open_mouth: 'liveness.challenge_open_mouth'
}

const MAX_ATTEMPTS = 4
const RECORD_MS = 4000

export default function Liveness() {
  const { t } = useTranslation('kyc')
  const { updateUser } = useAuthStore()

  const [step, setStep] = useState<Step>('permission')
  const [attempts, setAttempts] = useState(0)
  const [challengeId, setChallengeId] = useState('')
  const [challenges, setChallenges] = useState<string[]>([])

  function handleRequestPermission() {
    Taro.authorize({ scope: 'scope.camera' })
      .then(() => {
        setStep('idle')
      })
      .catch(() => {
        Taro.showModal({
          title: t('liveness.cameraPermissionTitle'),
          content: t('liveness.cameraPermissionDesc'),
          confirmText: t('liveness.goToSettings'),
          success: (res) => {
            if (res.confirm) {
              Taro.openSetting({
                success: (setting) => {
                  if (setting.authSettings['scope.camera']) {
                    setStep('idle')
                  }
                }
              })
            }
          }
        })
      })
  }

  async function handleStartDetection() {
    setAttempts((n) => n + 1)
    setStep('starting')
    try {
      const res = await kycApi.startLiveness()
      if (res.code !== 0) throw new Error(res.message)
      setChallengeId(res.data.challengeId)
      setChallenges(res.data.challenges)
      await doRecording()
    } catch {
      Taro.showToast({ title: t('liveness.networkError'), icon: 'none' })
      setStep('failed')
    }
  }

  async function doRecording() {
    setStep('recording')
    try {
      const cameraContext = Taro.createCameraContext()
      await new Promise<void>((resolve, reject) => {
        cameraContext.startRecord({
          success: () => resolve(),
          fail: (err) => reject(new Error(typeof err === 'string' ? err : err?.errMsg || 'start record failed'))
        })
      })
      await new Promise((resolve) => setTimeout(resolve, RECORD_MS))
      const recordRes = await new Promise<{ tempVideoPath: string }>((resolve, reject) => {
        cameraContext.stopRecord({
          success: (res) => resolve(res),
          fail: (err) => reject(new Error(typeof err === 'string' ? err : err?.errMsg || 'stop record failed'))
        })
      })
      await uploadAndSubmit(recordRes.tempVideoPath)
    } catch {
      handleFailure()
    }
  }

  async function uploadVideo(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: 'https://api.remx.com/upload',
        filePath,
        name: 'file',
        formData: { type: 'liveness' },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            resolve(data.data?.url || data.url || filePath)
          } catch {
            resolve(filePath)
          }
        },
        fail: reject
      })
    })
  }

  async function uploadAndSubmit(videoPath: string) {
    setStep('uploading')
    try {
      const videoUrl = await uploadVideo(videoPath)
      const res = await kycApi.submitLiveness({ challengeId, videoUrl, challenges })
      if (res.code !== 0) throw new Error(res.message)
      setStep('success')
      Taro.showToast({ title: t('liveness.submitSuccess'), icon: 'success' })
      updateUser({ currentKycTier: 'L3' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      handleFailure()
    }
  }

  function handleFailure() {
    if (attempts < MAX_ATTEMPTS) {
      Taro.showToast({
        title: `${t('liveness.submitFailed')}，${t('liveness.retryCount', { count: MAX_ATTEMPTS - attempts })}`,
        icon: 'none',
        duration: 3000
      })
    } else {
      Taro.showToast({ title: t('liveness.retryExhausted'), icon: 'none', duration: 3000 })
    }
    setStep('failed')
  }

  function handleRetry() {
    setStep('idle')
    setChallengeId('')
    setChallenges([])
  }

  if (step === 'permission') {
    return (
      <View className='kyc-liveness-page'>
        <View className='permission-wrap'>
          <Text className='permission-title'>{t('liveness.cameraPermissionTitle')}</Text>
          <Text className='permission-desc'>{t('liveness.cameraPermissionDesc')}</Text>
          <Button className='permission-btn' onClick={handleRequestPermission}>
            {t('liveness.goToSettings')}
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className='kyc-liveness-page'>
      <Camera
        id='livenessCamera'
        className='camera-preview'
        devicePosition='front'
        flash='off'
      />
      <View className='camera-overlay'>
        <View className='overlay-header'>
          <Text className='overlay-title'>{t('liveness.title')}</Text>
          <Text className='overlay-subtitle'>{t('liveness.subtitle')}</Text>
        </View>

        <View className='face-frame'>
          <View className='face-frame-inner' />
        </View>

        <View className='instruction-area'>
          {step === 'idle' && (
            <Text className='instruction-text'>{t('liveness.subtitle')}</Text>
          )}
          {(step === 'starting' || step === 'recording') && challenges.length > 0 && (
            <Text className='instruction-text challenge-text'>
              {t(CHALLENGE_KEYS[challenges[0]] || 'liveness.challenge_blink')}
            </Text>
          )}
          {step === 'recording' && (
            <Text className='recording-hint'>{t('liveness.recordHint')}</Text>
          )}
          {step === 'failed' && attempts < MAX_ATTEMPTS && (
            <Text className='instruction-text error-text'>{t('liveness.submitFailed')}</Text>
          )}
          {step === 'failed' && attempts >= MAX_ATTEMPTS && (
            <Text className='instruction-text error-text'>{t('liveness.retryExhausted')}</Text>
          )}
          {step === 'uploading' && (
            <Text className='instruction-text'>{t('liveness.uploading')}</Text>
          )}
        </View>

        {step === 'recording' && (
          <View className='recording-indicator'>
            <View className='recording-dot' />
            <Text className='recording-label'>{t('liveness.recording')}</Text>
          </View>
        )}

        <View className='action-area'>
          {step === 'idle' && (
            <Button className='action-btn' onClick={handleStartDetection}>
              {t('liveness.startDetect')}
            </Button>
          )}
          {(step === 'starting' || step === 'recording') && (
            <Button className='action-btn loading-btn' loading disabled>
              {step === 'starting' ? t('liveness.detecting') : t('liveness.recording')}
            </Button>
          )}
          {step === 'uploading' && (
            <Button className='action-btn loading-btn' loading disabled>
              {t('liveness.uploading')}
            </Button>
          )}
          {step === 'failed' && attempts < MAX_ATTEMPTS && (
            <View>
              <Button className='action-btn retry-btn' onClick={handleRetry}>
                {t('liveness.retry')}
              </Button>
              <Text className='retry-count'>
                {t('liveness.retryCount', { count: MAX_ATTEMPTS - attempts })}
              </Text>
            </View>
          )}
          {step === 'failed' && attempts >= MAX_ATTEMPTS && (
            <View className='retry-exhausted'>
              <Button className='action-btn' onClick={() => Taro.navigateBack()}>
                返回
              </Button>
            </View>
          )}
        </View>
      </View>

      {step === 'success' && (
        <View className='success-overlay'>
          <View className='success-icon'>✓</View>
          <Text className='success-text'>{t('liveness.submitSuccess')}</Text>
        </View>
      )}
    </View>
  )
}
