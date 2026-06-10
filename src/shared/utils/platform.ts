import Taro from '@tarojs/taro'

type TaroEnv = 'WEAPP' | 'ALIPAY' | 'WEB' | 'SWAN' | 'TT' | 'QQ' | 'JD'

export const isWeapp = Taro.getEnv() === Taro.Env.WEAPP
export const isAlipay = Taro.getEnv() === Taro.Env.ALIPAY
export const isH5 = Taro.getEnv() === Taro.Env.WEB

export const PlatformAPI = {
  login(): Promise<{ code: string; errMsg: string }> {
    if (isWeapp) {
      return new Promise((resolve, reject) => {
        Taro.login({
          success: (res) => resolve({ code: res.code, errMsg: res.errMsg }),
          fail: reject
        })
      })
    } else if (isAlipay) {
      return new Promise((resolve, reject) => {
        Taro.login({
          success: (res) => resolve({ code: res.code, errMsg: res.errMsg }),
          fail: reject
        })
      })
    } else {
      return Promise.reject(new Error('Platform not supported'))
    }
  },

  async chooseMedia(options?: {
    count?: number
    sourceType?: ('album' | 'camera')[]
    mediaType?: ('image' | 'video')[]
  }): Promise<{ tempFiles: { path: string; size: number }[] }> {
    return Taro.chooseMedia({
      count: options?.count || 1,
      sourceType: options?.sourceType || ['album', 'camera'],
      mediaType: options?.mediaType || ['image']
    })
  },

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      const res = await Taro.getLocation({ type: 'gcj02' })
      return { latitude: res.latitude, longitude: res.longitude }
    } catch {
      Taro.showToast({ title: '获取位置失败', icon: 'none' })
      throw new Error('Location permission denied')
    }
  },

  async requestPayment(params: {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }): Promise<boolean> {
    try {
      await Taro.requestPayment(params)
      return true
    } catch (err: any) {
      if (err.errMsg?.includes('cancel')) {
        return false
      }
      throw err
    }
  },

  setNavigationBarTitle(title: string) {
    Taro.setNavigationBarTitle({ title })
  },

  showToast(title: string, icon: 'success' | 'error' | 'none' = 'none') {
    Taro.showToast({ title, icon, duration: 2000 })
  },

  showLoading(title: string = '加载中...') {
    Taro.showLoading({ title })
  },

  hideLoading() {
    Taro.hideLoading()
  },

  makePhoneCall(phoneNumber: string) {
    Taro.makePhoneCall({ phoneNumber })
  },

  setClipboardData(text: string) {
    Taro.setClipboardData({ data: text })
  }
}

export interface PlatformFeatures {
  share: {
    shareCard: boolean
    shareImage: boolean
    shareTimeline: boolean
  }
  favorite: {
    addCard: boolean
    addFavorite: boolean
  }
  subscription: {
    templateMessage: boolean
    subscribeMessage: boolean
  }
  payment: {
    wechatPay: boolean
    alipay: boolean
  }
  social: {
    lifeAccount: boolean
    creditScore: boolean
  }
  distributed: {
    serviceWidget: boolean
    distributedData: boolean
  }
}

export function getPlatformFeatures(): PlatformFeatures {
  // 微信小程序
  if (process.env.TARO_ENV === 'weapp') {
    return {
      share: { shareCard: true, shareImage: true, shareTimeline: true },
      favorite: { addCard: true, addFavorite: true },
      subscription: { templateMessage: true, subscribeMessage: true },
      payment: { wechatPay: true, alipay: false },
      social: { lifeAccount: false, creditScore: false },
      distributed: { serviceWidget: false, distributedData: false },
    }
  }

  // 支付宝
  if (process.env.TARO_ENV === 'alipay') {
    return {
      share: { shareCard: true, shareImage: true, shareTimeline: false },
      favorite: { addCard: false, addFavorite: true },
      subscription: { templateMessage: false, subscribeMessage: false },
      payment: { wechatPay: false, alipay: true },
      social: { lifeAccount: true, creditScore: true },
      distributed: { serviceWidget: false, distributedData: false },
    }
  }

  // 鸿蒙
  if (process.env.TARO_ENV === 'harmony-hybrid') {
    return {
      share: { shareCard: true, shareImage: true, shareTimeline: false },
      favorite: { addCard: false, addFavorite: true },
      subscription: { templateMessage: false, subscribeMessage: false },
      payment: { wechatPay: false, alipay: false },
      social: { lifeAccount: false, creditScore: false },
      distributed: { serviceWidget: true, distributedData: true },
    }
  }

  // H5/其他
  return {
    share: { shareCard: false, shareImage: true, shareTimeline: false },
    favorite: { addCard: false, addFavorite: true },
    subscription: { templateMessage: false, subscribeMessage: false },
    payment: { wechatPay: false, alipay: false },
    social: { lifeAccount: false, creditScore: false },
    distributed: { serviceWidget: false, distributedData: false },
  }
}
