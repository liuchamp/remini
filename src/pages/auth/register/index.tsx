import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Register() {
  useLoad(() => {
    console.log('auth/register/index loaded')
  })

  return (
    <View className='page'>
      <Text>注册</Text>
    </View>
  )
}
