import { View, Text, Button } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import './index.scss'

interface Props {
  onRetry: () => void
  loading?: boolean
  text?: string
}

export function RetryButton({ onRetry, loading = false, text }: Props) {
  const { t } = useTranslation(['common'])
  return (
    <View className='retry-button-container'>
      <Text className='retry-icon'>⚠️</Text>
      <Text className='retry-message'>{text || t('common:error.network')}</Text>
      <Button 
        className='retry-action' 
        onClick={onRetry} 
        loading={loading}
        disabled={loading}
      >
        {t('common:action.retry')}
      </Button>
    </View>
  )
}

export default RetryButton
