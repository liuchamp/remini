import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { useAuthStore } from '@/domains/auth/store'

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

  // children 是将要会渲染的页面
  return children
}
  


export default App
