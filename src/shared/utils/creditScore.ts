import Taro from '@tarojs/taro'

export const CreditScoreService = {
  requestAuth: async (): Promise<string | null> => {
    try {
      const res = await Taro.getAuthCode({
        scopes: 'auth_base'
      })
      return res
    } catch (err) {
      console.error('信用授权失败:', err)
      return null
    }
  }
}
