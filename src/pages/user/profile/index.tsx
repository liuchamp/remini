import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Profile() {
  useLoad(() => {
    console.log('user/profile/index loaded')
  })

  return (
    <View className='page'>
      <Text>用户资料</Text>
    </View>
  )
}
