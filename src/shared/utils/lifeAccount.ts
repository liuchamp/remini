import Taro from '@tarojs/taro'

export const LifeAccountService = {
  /**
   * 打开生活号
   */
  openLifeAccount: async (): Promise<boolean> => {
    try {
      await Taro.openLifeAccount({})
      return true
    } catch (err) {
      console.error('打开生活号失败:', err)
      return false
    }
  },

  /**
   * 检查是否关注
   */
  checkFollowStatus: async (): Promise<boolean> => {
    // TODO: 调用 Alipay getFollowStatus API
    // 暂时返回 true 以保持接口稳定
    return true
  }
}
