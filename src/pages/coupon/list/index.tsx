import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function List() {
  useLoad(() => {
    console.log('coupon/list/index loaded')
  })

  return (
    <View className='page'>
      <Text>优惠券</Text>
    </View>
  )
}
