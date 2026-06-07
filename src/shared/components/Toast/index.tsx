import Taro from '@tarojs/taro'

interface ToastOptions {
  title: string
  icon?: 'success' | 'error' | 'none'
  duration?: number
}

export const Toast = {
  show(options: ToastOptions) {
    Taro.showToast({
      title: options.title,
      icon: options.icon || 'none',
      duration: options.duration || 2000
    })
  },
  success(title: string) {
    Taro.showToast({ title, icon: 'success', duration: 2000 })
  },
  error(title: string) {
    Taro.showToast({ title, icon: 'error', duration: 2000 })
  },
  hide() {
    Taro.hideToast()
  }
}
