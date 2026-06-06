import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('points/index/index loaded')
  })

  return (
    <View className='page'>
      <Text>积分中心</Text>
    </View>
  )
}
