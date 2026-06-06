import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Track() {
  useLoad(() => {
    console.log('logistics/track/index loaded')
  })

  return (
    <View className='page'>
      <Text>物流追踪</Text>
    </View>
  )
}
