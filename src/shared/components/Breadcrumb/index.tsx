import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
}

export const Breadcrumb = ({
  items,
  separator = '/'
}: BreadcrumbProps) => {
  const handleClick = (path: string) => {
    if (path) {
      Taro.navigateTo({ url: path })
    }
  }

  return (
    <View className='breadcrumb'>
      {items.map((item, index) => (
        <View key={index} className='breadcrumb-item'>
          {index > 0 && <Text className='breadcrumb-separator'>{separator}</Text>}
          {item.path ? (
            <Text
              className='breadcrumb-link'
              onClick={() => handleClick(item.path!)}
            >
              {item.label}
            </Text>
          ) : (
            <Text className='breadcrumb-current'>{item.label}</Text>
          )}
        </View>
      ))}
    </View>
  )
}
