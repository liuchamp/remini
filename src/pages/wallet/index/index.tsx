import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useWalletStore } from '@/domains/wallet/store'
import './index.scss'

const TX_TYPE_CONFIG: Record<string, { color: string; prefix: string }> = {
  hold: { color: '#FF6B35', prefix: '-' },
  release: { color: '#07C160', prefix: '+' },
  refund: { color: '#4A90D9', prefix: '+' },
  withdraw: { color: '#E02020', prefix: '-' },
}

export default function WalletIndex() {
  const { t } = useTranslation(['wallet', 'common'])
  const {
    balance,
    transactions,
    transactionsHasMore,
    loading,
    refreshing,
    loadBalance,
    loadTransactions
  } = useWalletStore()

  const [transactionsPage, setTransactionsPage] = useState(1)

  useLoad(() => {
    loadBalance()
    loadTransactions(true)
  })

  useDidShow(() => {
    loadBalance()
  })

  const handleScrollToLower = useCallback(() => {
    if (transactionsHasMore && !loading) {
      loadTransactions(false)
    }
  }, [transactionsHasMore, loading])

  const handleWithdraw = () => {
    Taro.navigateTo({ url: '/pages/wallet/withdraw/index' })
  }

  const handleBindCard = () => {
    Taro.navigateTo({ url: '/pages/wallet/bind-card/index' })
  }

  const formatAmount = (amount: number) => {
    return amount.toFixed(2)
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const m = d.getMonth() + 1
    const day = d.getDate()
    const h = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    return `${m}-${day} ${h}:${min}`
  }

  const getTxInfo = (record: TransactionRecord) => {
    const cfg = TX_TYPE_CONFIG[record.type] || { color: '#999', prefix: '' }
    const labelMap: Record<string, string> = { hold: 'wallet:wallet.heldBalance', release: 'wallet:wallet.totalEarned', refund: 'wallet:wallet.totalEarned', withdraw: 'wallet:wallet.withdraw' }
    const label = t(labelMap[record.type] || 'wallet:wallet.transactions')
  }

  return (
    <View className='wallet-page'>
      {/* Balance Header */}
      <View className='balance-header'>
        <View className='balance-card'>
          <Text className='balance-label'>{t('wallet:wallet.availableBalanceLabel')}</Text>
          <View className='balance-amount'>
            <Text className='amount-symbol'>¥</Text>
            <Text className='amount-value'>
              {balance ? formatAmount(balance.availableBalance) : '--'}
            </Text>
          </View>
          <View className='balance-details'>
            <View className='detail-item'>
              <Text className='detail-label'>{t('wallet:wallet.heldBalance')}</Text>
              <Text className='detail-value'>
                ¥{balance ? formatAmount(balance.heldBalance) : '--'}
              </Text>
            </View>
            <View className='detail-item'>
              <Text className='detail-label'>{t('wallet:wallet.totalEarned')}</Text>
              <Text className='detail-value'>
                ¥{balance ? formatAmount(balance.totalEarned) : '--'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className='quick-actions'>
        <View className='action-btn primary' onClick={handleWithdraw}>
          <Text className='action-icon'>💳</Text>
          <Text className='action-text'>{t('wallet:wallet.withdraw')}</Text>
        </View>
        <View className='action-btn' onClick={handleBindCard}>
          <Text className='action-icon'>🔗</Text>
          <Text className='action-text'>{t('wallet:wallet.bindAccount')}</Text>
        </View>
        <View className='action-btn'>
          <Text className='action-icon'>📊</Text>
          <Text className='action-text'>{t('wallet:wallet.bill')}</Text>
        </View>
        <View className='action-btn'>
          <Text className='action-icon'>🔒</Text>
          <Text className='action-text'>{t('wallet:wallet.security')}</Text>
        </View>
      </View>

      {/* Transaction List */}
      <View className='tx-section'>
        <View className='section-header'>
          <Text className='section-title'>{t('wallet:wallet.transactions')}</Text>
        </View>

        <ScrollView
          className='tx-scroll'
          scrollY
          onScrollToLower={handleScrollToLower}
          lowerThreshold={100}
        >
          {transactions.length === 0 && !loading && (
            <View className='empty-state'>
              <Text className='empty-icon'>📭</Text>
              <Text className='empty-text'>{t('wallet:wallet.noTransactions')}</Text>
            </View>
          )}

          {transactions.map(record => {
            const tx = getTxInfo(record)
            return (
              <View key={record.id} className='tx-item'>
                <View className='tx-left'>
                  <View className={`tx-type-badge ${record.type}`}>
                    <Text className='tx-type-text'>{tx.label}</Text>
                  </View>
                  <View className='tx-info'>
                    <Text className='tx-note'>{record.note}</Text>
                    <Text className='tx-time'>{formatTime(record.createdAt)}</Text>
                  </View>
                </View>
                <Text className='tx-amount' style={{ color: tx.color }}>
                  {tx.prefix}¥{formatAmount(record.amount)}
                </Text>
              </View>
            )
          })}

          {loading && (
            <View className='loading-more'>
              <Text>{t('common:loading')}</Text>
            </View>
          )}

          {!transactionsHasMore && transactions.length > 0 && (
            <View className='no-more'>
              <Text>{t('common:app.noMore')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}
