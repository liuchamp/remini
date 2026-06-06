import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Create() {
  useLoad(() => {
    console.log('order/create/index loaded')
  })

  return (
    <View className='page'>
      <Text>创建订单</Text>
    </View>
  )
}
