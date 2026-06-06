import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function List() {
  useLoad(() => {
    console.log('offer/list/index loaded')
  })

  return (
    <View className='page'>
      <Text>出价列表</Text>
    </View>
  )
}
