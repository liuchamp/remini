import { View, Text } from '@tarojs/components'
import './index.scss'

interface Props {
  keywords: string[]
  onSelect: (keyword: string) => void
}

export function HotSearches({ keywords, onSelect }: Props) {
  if (keywords.length === 0) return null

  return (
    <View className='hot-searches'>
      <View className='hot-title'>热门搜索</View>
      <View className='hot-chips'>
        {keywords.map((kw) => (
          <View key={kw} className='hot-chip' onClick={() => onSelect(kw)}>
            <Text>{kw}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default HotSearches
