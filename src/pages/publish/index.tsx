import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Publish() {
  useLoad(() => {
    console.log('publish/index loaded')
  })

  return (
    <View className='page'>
      <Text>发布</Text>
    </View>
  )
}
