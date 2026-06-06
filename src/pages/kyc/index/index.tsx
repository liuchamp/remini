import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('kyc/index/index loaded')
  })

  return (
    <View className='page'>
      <Text>实名认证</Text>
    </View>
  )
}
