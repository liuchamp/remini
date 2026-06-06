import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Detail() {
  useLoad(() => {
    console.log('product/detail/index loaded')
  })

  return (
    <View className='page'>
      <Text>商品详情</Text>
    </View>
  )
}
