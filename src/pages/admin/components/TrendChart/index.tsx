import { View, Text } from '@tarojs/components'
import './index.scss'

interface TrendChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
}

export default function TrendChart({ title, data, color = '#FF6B35' }: TrendChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <View className='trend-chart'>
      <Text className='trend-chart-title'>{title}</Text>
      <View className='trend-chart-bars'>
        {data.map((item, i) => (
          <View key={i} className='trend-chart-bar-wrapper'>
            <Text className='trend-chart-value'>{item.value}</Text>
            <View
              className='trend-chart-bar'
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                background: color,
              }}
            />
            <Text className='trend-chart-label'>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
