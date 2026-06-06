import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Post() {
  useLoad(() => {
    console.log('community/post/index loaded')
  })

  return (
    <View className='page'>
      <Text>帖子详情</Text>
    </View>
  )
}
