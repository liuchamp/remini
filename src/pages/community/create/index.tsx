import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Create() {
  useLoad(() => {
    console.log('community/create/index loaded')
  })

  return (
    <View className='page'>
      <Text>发布帖子</Text>
    </View>
  )
}
