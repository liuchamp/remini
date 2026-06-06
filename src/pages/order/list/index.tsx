import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function List() {
  useLoad(() => {
    console.log('order/list/index loaded')
  })

  return (
    <View className='page'>
      <Text>订单列表</Text>
    </View>
  )
}
