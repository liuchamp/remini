import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Edit() {
  useLoad(() => {
    console.log('address/edit/index loaded')
  })

  return (
    <View className='page'>
      <Text>编辑地址</Text>
    </View>
  )
}
