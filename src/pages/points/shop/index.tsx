import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Shop() {
  useLoad(() => {
    console.log('points/shop/index loaded')
  })

  return (
    <View className='page'>
      <Text>积分商城</Text>
    </View>
  )
}
