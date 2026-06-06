import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('settings/index/index loaded')
  })

  return (
    <View className='page'>
      <Text>设置</Text>
    </View>
  )
}
