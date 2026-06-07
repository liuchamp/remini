import { View, Text } from '@tarojs/components'
import './index.scss'

interface EmptyProps {
  text?: string
  icon?: string
}

export default function Empty({ text = '暂无数据', icon }: EmptyProps) {
  return (
    <View className='empty-component'>
      {icon ? (
        <View className='empty-icon-img' style={{ backgroundImage: `url(${icon})` }} />
      ) : (
        <View className='empty-icon'>📭</View>
      )}
      <Text className='empty-text'>{text}</Text>
    </View>
  )
}
