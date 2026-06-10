import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { walletApi, Transaction } from '@/domains/wallet/api'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Empty from '@/shared/components/Empty'
import './index.scss'

export default function Transactions() {
  const { t } = useTranslation(['wallet', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(false)

  const loadTransactions = async (reset = false) => {
    if (loading) return
    setLoading(true)
    setError(false)
    try {
      const currentPage = reset ? 1 : page
      const res = await walletApi.getTransactions({ page: currentPage, pageSize: 20 })
      if (res.code === 0) {
        const list = res.data.list || []
        setTransactions(prev => reset ? list : [...prev, ...list])
        setHasMore(list.length >= 20)
        setPage(currentPage + 1)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    setError(false)
    setTransactions([])
    setPage(1)
    setHasMore(true)
    loadTransactions(true)
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) loadTransactions()
  }

  return (
    <View className='transactions-page'>
      {loading && transactions.length === 0 ? (
        <Skeleton variant='list' count={5} />
      ) : error ? (
        <RetryButton onRetry={refresh} />
      ) : transactions.length === 0 ? (
        <Empty text={t('common:empty.list')} />
      ) : (
        <View className='transaction-list'>
          {transactions.map((t) => (
            <View key={t.id} className='transaction-item'>
              <View className='transaction-info'>
                <Text className='transaction-title'>{t.description}</Text>
                <Text className='transaction-time'>{t.createdAt}</Text>
              </View>
              <Text className={`transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}`}>
                {t.amount > 0 ? '+' : ''}{t.amount}
              </Text>
            </View>
          ))}
          {hasMore && (
            <View className='load-more' onClick={handleLoadMore}>
              <Text>{loading ? '加载中...' : '加载更多'}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
