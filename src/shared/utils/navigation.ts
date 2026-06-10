import Taro from '@tarojs/taro'

export const NavigationService = {
  /**
   * 安全的页面跳转（带深度检查）
   */
  safeNavigateTo: async (url: string) => {
    const pages = Taro.getCurrentPages()
    if (pages.length >= 10) {
      // 达到栈深度限制，使用 redirectTo
      console.warn('页面栈已满，使用 redirectTo')
      return Taro.redirectTo({ url })
    }
    return Taro.navigateTo({ url })
  },

  /**
   * 智能返回（根据来源判断）
   */
  smartNavigateBack: (delta = 1) => {
    const pages = Taro.getCurrentPages()
    if (pages.length <= 1) {
      // 栈底，跳转到首页
      return Taro.switchTab({ url: '/pages/index/index' })
    }
    return Taro.navigateBack({ delta })
  },

  /**
   * 获取当前页面栈深度
   */
  getPageStackDepth: () => {
    return Taro.getCurrentPages().length
  },

  /**
   * 检查是否可以返回
   */
  canGoBack: () => {
    return Taro.getCurrentPages().length > 1
  }
}
