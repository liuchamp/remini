import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Message() {
  useLoad(() => {
    console.log('message/index loaded')
  })

  return (
    <View className='page'>
      <Text>消息</Text>
    </View>
  )
}
