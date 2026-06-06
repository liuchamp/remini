import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Taro from '@tarojs/taro'

import zhCommon from './resources/zh-CN/common.json'
import zhAuth from './resources/zh-CN/auth.json'
import enCommon from './resources/en-US/common.json'
import enAuth from './resources/en-US/auth.json'

const STORAGE_KEY = '@remx/locale'

const resources = {
  'zh-CN': { common: zhCommon, auth: zhAuth },
  'en-US': { common: enCommon, auth: enAuth }
}

const getSystemLanguage = (): string => {
  try {
    const sys = Taro.getSystemInfoSync()
    const lang = sys.language || ''
    if (lang.startsWith('zh')) return 'zh-CN'
    if (lang.startsWith('en')) return 'en-US'
    return 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

const savedLocale = Taro.getStorageSync(STORAGE_KEY)
const initialLang = savedLocale || getSystemLanguage()

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
  ns: ['common', 'auth'],
  defaultNS: 'common',
})

export const changeLanguage = (lang: 'zh-CN' | 'en-US') => {
  i18n.changeLanguage(lang)
  Taro.setStorageSync(STORAGE_KEY, lang)
}

export const getCurrentLanguage = (): 'zh-CN' | 'en-US' => {
  return i18n.language as 'zh-CN' | 'en-US'
}

export default i18n
