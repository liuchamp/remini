import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Phone() {
  useLoad(() => {
    console.log('kyc/phone/index loaded')
  })

  return (
    <View className='page'>
      <Text>手机认证</Text>
    </View>
  )
}
