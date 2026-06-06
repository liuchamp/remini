import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Identity() {
  useLoad(() => {
    console.log('kyc/identity/index loaded')
  })

  return (
    <View className='page'>
      <Text>身份认证</Text>
    </View>
  )
}
