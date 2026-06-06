import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Login() {
  useLoad(() => {
    console.log('auth/login/index loaded')
  })

  return (
    <View className='page'>
      <Text>登录</Text>
    </View>
  )
}
