import Taro from '@tarojs/taro'

/** 首页路径 */
const HOME_PATH = '/pages/index/index'

/** 页面栈最大深度（小程序限制为 10） */
const MAX_PAGE_STACK_DEPTH = 10

/**
 * 小程序页面导航服务
 */
export const NavigationService = {
  /**
   * 安全的页面跳转（带深度检查）
   * 当页面栈达到上限时自动降级为 redirectTo
   */
  safeNavigateTo: async (url: string): Promise<TaroGeneral.CallbackResult> => {
    try {
      const pages = Taro.getCurrentPages()
      if (pages.length >= MAX_PAGE_STACK_DEPTH) {
        console.warn('页面栈已满，使用 redirectTo')
        return await Taro.redirectTo({ url })
      }
      return await Taro.navigateTo({ url })
    } catch (error) {
      console.error(`导航失败: ${url}`, error)
      throw error
    }
  },

  /**
   * 智能返回（根据来源判断）
   * 在栈底时自动跳转到首页
   */
  smartNavigateBack: (delta = 1): Promise<TaroGeneral.CallbackResult> => {
    try {
      const pages = Taro.getCurrentPages()
      if (pages.length <= 1) {
        return Taro.switchTab({ url: HOME_PATH })
      }
      return Taro.navigateBack({ delta })
    } catch (error) {
      console.error('返回导航失败', error)
      throw error
    }
  },

  /**
   * 获取当前页面栈深度
   */
  getPageStackDepth: (): number => {
    return Taro.getCurrentPages().length
  },

  /**
   * 检查是否可以返回
   */
  canGoBack: (): boolean => {
    return Taro.getCurrentPages().length > 1
  }
}
