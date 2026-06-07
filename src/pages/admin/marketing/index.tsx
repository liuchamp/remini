import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function AdminMarketing() {
  useLoad(() => {})

  return (
    <View className='admin-marketing-page'>
      <View className='section'>
        <Text className='section-title'>优惠券模板</Text>
        <View className='empty-hint'>暂无优惠券模板</View>
      </View>
      <View className='section'>
        <Text className='section-title'>营销活动</Text>
        <View className='empty-hint'>暂无营销活动</View>
      </View>
    </View>
  )
}
