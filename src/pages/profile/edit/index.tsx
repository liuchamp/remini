import { View, Text, Input, Textarea, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useAuthStore } from '@/domains/auth/store'
import { PlatformAPI } from '@/shared/utils/platform'
import { http } from '@/shared/api/request'
import './index.scss'

export default function EditProfile() {
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
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
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
        Taro.showToast({ title: '保存成功', icon: 'success' })
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
        <Text className='avatar-hint'>点击更换头像</Text>
      </View>

      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>昵称</Text>
          <Input
            className='form-input'
            placeholder='请输入昵称'
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
            maxlength={20}
          />
        </View>
        <View className='form-group'>
          <Text className='form-label'>简介</Text>
          <Textarea
            className='form-textarea'
            placeholder='写点什么介绍下自己...'
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
          保存
        </Button>
      </View>
    </View>
  )
}
