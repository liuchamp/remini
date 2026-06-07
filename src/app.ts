import { PropsWithChildren, createElement } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { useAuthStore } from '@/domains/auth/store'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

import './shared/i18n'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')

    const token = Taro.getStorageSync('auth-storage')
    if (token) {
      useAuthStore.getState().checkAuth()
    }
  })

  return createElement(ErrorBoundary, null, children)
}

export default App
