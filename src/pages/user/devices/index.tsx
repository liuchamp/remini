import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/domains/auth/api'
import type { DeviceSession } from '@/domains/auth/types'
import './index.scss'

export default function Devices() {
  const { t } = useTranslation(['auth'])
  const [devices, setDevices] = useState<DeviceSession[]>([])

  useLoad(() => {
    loadDevices()
  })

  const loadDevices = async () => {
    try {
      const res = await authApi.getDevices()
      if (res.code === 0) {
        setDevices(res.data)
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  const handleKick = async (device: DeviceSession) => {
    const res = await Taro.showModal({
      title: t('auth:devices.kickTitle'),
      content: t('auth:devices.kickConfirm'),
    })
    if (!res.confirm) return

    try {
      const apiRes = await authApi.kickDevice(device.id)
      if (apiRes.code === 0) {
        Taro.showToast({ title: t('auth:devices.kickSuccess'), icon: 'success' })
        setDevices((prev) => prev.filter((d) => d.id !== device.id))
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
  }

  return (
    <View className='devices-page'>
      {devices.map((device) => (
        <View key={device.id} className='device-card'>
          <View className='device-header'>
            <Text className='device-model'>{device.deviceModel}</Text>
            {device.isCurrent && (
              <Text className='current-badge'>{t('auth:devices.currentDevice')}</Text>
            )}
          </View>
          <View className='device-meta'>
            <Text className='meta-item'>{device.osVersion}</Text>
            <Text className='meta-item'>v{device.appVersion}</Text>
            <Text className='meta-item'>{device.networkType}</Text>
          </View>
          <View className='device-footer'>
            <Text className='last-active'>{formatDate(device.lastActiveAt)}</Text>
            {!device.isCurrent && (
              <View className='kick-btn' onClick={() => handleKick(device)}>
                <Text>{t('auth:devices.kickAction')}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}
