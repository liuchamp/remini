import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { changeLanguage } from '@/shared/i18n'
import i18n from 'i18next'
import './index.scss'

interface Props {
  type?: 'list-item' | 'inline'
}

export function LanguageSwitcher({ type = 'list-item' }: Props) {
  const [currentLang, setCurrentLang] = useState<'zh-CN' | 'en-US'>(
    (i18n.language as 'zh-CN' | 'en-US') || 'zh-CN'
  )

  const toggle = () => {
    const next = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN'
    changeLanguage(next)
    setCurrentLang(next)
  }

  if (type === 'inline') {
    return (
      <View className='lang-switcher-inline' onClick={toggle}>
        <Text className='lang-text'>{currentLang === 'zh-CN' ? '中文' : 'English'}</Text>
      </View>
    )
  }

  return (
    <View className='lang-switcher-list-item' onClick={toggle}>
      <Text className='lang-label'>{i18n.t('common:action.share')}</Text>
      <Text className='lang-value'>{currentLang === 'zh-CN' ? '简体中文' : 'English'}</Text>
    </View>
  )
}

export default LanguageSwitcher
