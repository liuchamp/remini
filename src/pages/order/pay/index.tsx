import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Pay() {
  useLoad(() => {
    console.log('order/pay/index loaded')
  })

  return (
    <View className='page'>
      <Text>支付</Text>
    </View>
  )
}
