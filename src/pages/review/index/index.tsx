import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import './index.scss'

export default function Index() {
  const { t } = useTranslation(['common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  useLoad(() => {
    console.log('review/index/index loaded')
  })

  return (
    <View className='page'>
      <Text>评价</Text>
    </View>
  )
}
