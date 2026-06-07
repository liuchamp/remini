import { PropsWithChildren, createElement } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { useAuthStore } from '@/domains/auth/store'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { ShareConfigProvider } from '@/shared/utils/share'

import './shared/i18n'
import './app.scss'

/**
 * App wrapper order:
 *   ConfigProvider → ShareConfigProvider → ErrorBoundary → children
 *
 * ShareConfigProvider provides share configuration context to all pages.
 * When ConfigProvider is added, it should go before ShareConfigProvider.
 */
function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')

    const token = Taro.getStorageSync('auth-storage')
    if (token) {
      useAuthStore.getState().checkAuth()
    }
  })

  return createElement(ShareConfigProvider, null,
    createElement(ErrorBoundary, null, children)
  )
}

export default App
