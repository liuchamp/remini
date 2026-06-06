import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Conversation() {
  useLoad(() => {
    console.log('chat/conversation/index loaded')
  })

  return (
    <View className='page'>
      <Text>聊天</Text>
    </View>
  )
}
