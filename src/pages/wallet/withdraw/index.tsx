import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Withdraw() {
  useLoad(() => {
    console.log('wallet/withdraw/index loaded')
  })

  return (
    <View className='page'>
      <Text>提现</Text>
    </View>
  )
}
