import Taro from '@tarojs/taro'

/**
 * 触觉反馈工具
 * 在支持的平台上提供触觉反馈
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

/**
 * 触发触觉反馈
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  // 微信小程序
  if (Taro.canIUse('vibrateShort')) {
    switch (type) {
      case 'light':
        Taro.vibrateShort({ type: 'light' })
        break
      case 'medium':
        Taro.vibrateShort({ type: 'medium' })
        break
      case 'heavy':
        Taro.vibrateShort({ type: 'heavy' })
        break
      case 'success':
        Taro.vibrateShort({ type: 'light' })
        break
      case 'warning':
        Taro.vibrateShort({ type: 'medium' })
        break
      case 'error':
        Taro.vibrateLong()
        break
    }
  }
}

/**
 * 成功反馈
 */
export function hapticSuccess(): void {
  triggerHaptic('success')
}

/**
 * 错误反馈
 */
export function hapticError(): void {
  triggerHaptic('error')
}

/**
 * 轻触反馈
 */
export function hapticLight(): void {
  triggerHaptic('light')
}
