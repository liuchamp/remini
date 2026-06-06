import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Feed() {
  useLoad(() => {
    console.log('community/feed/index loaded')
  })

  return (
    <View className='page'>
      <Text>社区动态</Text>
    </View>
  )
}
