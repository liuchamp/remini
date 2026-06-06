import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Category() {
  useLoad(() => {
    console.log('category/index loaded')
  })

  return (
    <View className='page'>
      <Text>分类</Text>
    </View>
  )
}
