import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { walletApi, Transaction } from '@/domains/wallet/api'
import Empty from '@/shared/components/Empty'
import './index.scss'

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useLoad(() => {
    loadTransactions(true)
  })

  const loadTransactions = async (reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const currentPage = reset ? 1 : page
      const res = await walletApi.getTransactions({ page: currentPage, pageSize: 20 })
      if (res.code === 0) {
        const list = res.data.list || []
        setTransactions(prev => reset ? list : [...prev, ...list])
        setHasMore(list.length >= 20)
        setPage(currentPage + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) loadTransactions()
  }

  return (
    <View className='transactions-page'>
      {transactions.length === 0 && !loading ? (
        <Empty text='暂无交易记录' />
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
