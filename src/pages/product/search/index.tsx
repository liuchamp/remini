import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Search() {
  useLoad(() => {
    console.log('product/search/index loaded')
  })

  return (
    <View className='page'>
      <Text>搜索</Text>
    </View>
  )
}
