import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Detail() {
  useLoad(() => {
    console.log('order/detail/index loaded')
  })

  return (
    <View className='page'>
      <Text>订单详情</Text>
    </View>
  )
}
