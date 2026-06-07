import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Taro from '@tarojs/taro'

import zhCommon from './resources/zh-CN/common.json'
import zhAuth from './resources/zh-CN/auth.json'
import zhProduct from './resources/zh-CN/product.json'
import zhTrade from './resources/zh-CN/trade.json'
import zhChat from './resources/zh-CN/chat.json'
import zhProfile from './resources/zh-CN/profile.json'
import zhValidation from './resources/zh-CN/validation.json'
import enCommon from './resources/en-US/common.json'
import enAuth from './resources/en-US/auth.json'
import enProduct from './resources/en-US/product.json'
import enTrade from './resources/en-US/trade.json'
import enChat from './resources/en-US/chat.json'
import enProfile from './resources/en-US/profile.json'
import enValidation from './resources/en-US/validation.json'

const STORAGE_KEY = '@remx/locale'

const resources = {
  'zh-CN': { common: zhCommon, auth: zhAuth, product: zhProduct, trade: zhTrade, chat: zhChat, profile: zhProfile, validation: zhValidation },
  'en-US': { common: enCommon, auth: enAuth, product: enProduct, trade: enTrade, chat: enChat, profile: enProfile, validation: enValidation }
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
  ns: ['common', 'auth', 'product', 'trade', 'chat', 'profile', 'validation'],
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
