import { View, Text, Input, Textarea, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useAuthStore } from '@/domains/auth/store'
import { PlatformAPI } from '@/shared/utils/platform'
import { useTranslation } from 'react-i18next'
import { http } from '@/shared/api/request'
import './index.scss'

export default function EditProfile() {
  const { t } = useTranslation(['profile', 'common'])
  const { user, updateUser } = useAuthStore()
  const [nickname, setNickname] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)

  const handleChooseAvatar = async () => {
    const res = await PlatformAPI.chooseMedia({
      count: 1,
      sourceType: ['album', 'camera'],
      mediaType: ['image']
    })
    if (res.tempFiles.length > 0) {
      setAvatar(res.tempFiles[0].path)
    }
  }

  const handleSave = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: t('profile:nicknamePlaceholder'), icon: 'none' })
      return
    }
    setSaving(true)
    try {
      const res = await http.post('/user/profile', {
        username: nickname.trim(),
        bio: bio.trim(),
        avatar
      })
      if (res.code === 0) {
        updateUser({ username: nickname.trim(), avatar })
        Taro.showToast({ title: t('common:app.saveSuccess'), icon: 'success' })
        Taro.navigateBack()
      }
    } catch {
      /* handled by interceptors */
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className='edit-profile-page'>
      <View className='avatar-section' onClick={handleChooseAvatar}>
        <Image className='avatar' src={avatar || ''} mode='aspectFill' />
        <Text className='avatar-hint'>{t('profile:avatarChangeHint')}</Text>
      </View>

      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>{t('profile:nickname')}</Text>
          <Input
            className='form-input'
            placeholder={t('profile:nicknamePlaceholder')}
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
            maxlength={20}
          />
        </View>
        <View className='form-group'>
          <Text className='form-label'>{t('profile:bio')}</Text>
          <Textarea
            className='form-textarea'
            placeholder={t('profile:bioPlaceholder')}
            value={bio}
            onInput={(e) => setBio(e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className='submit-bar'>
        <Button
          className='submit-btn'
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          {t('common:action.save')}
        </Button>
      </View>
    </View>
  )
}
