import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Profile() {
  useLoad(() => {
    console.log('profile/index loaded')
  })

  return (
    <View className='page'>
      <Text>我的</Text>
    </View>
  )
}
