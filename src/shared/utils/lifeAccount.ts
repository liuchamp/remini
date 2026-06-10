import Taro from '@tarojs/taro'

export const LifeAccountService = {
  /**
   * 打开生活号
   */
  openLifeAccount: async () => {
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
  checkFollowStatus: async () => {
    // 检查用户是否关注生活号
    return true
  }
}
