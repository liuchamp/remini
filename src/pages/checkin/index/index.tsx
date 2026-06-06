import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('checkin/index/index loaded')
  })

  return (
    <View className='page'>
      <Text>签到</Text>
    </View>
  )
}
