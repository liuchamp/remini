import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { adminApi } from '@/domains/admin/api'
import Empty from '@/shared/components/Empty'
import { useAuth } from '@/shared/hooks/useAuth'
import './index.scss'

interface Withdrawal {
  id: string
  userName: string
  amount: number
  bankName: string
  cardNumber: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const { requireAdmin } = useAuth()

  useEffect(() => {
    requireAdmin()
  }, [])

  useLoad(() => {
    loadWithdrawals()
  })

  const loadWithdrawals = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getWithdrawals()
      if (res.code === 0) setWithdrawals(res.data.list || [])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    const res = await adminApi.approveWithdrawal(id)
    if (res.code === 0) loadWithdrawals()
  }

  const handleReject = async (id: string) => {
    const res = await adminApi.rejectWithdrawal(id)
    if (res.code === 0) loadWithdrawals()
  }

  return (
    <View className='admin-withdrawals-page'>
      {withdrawals.length === 0 && !loading ? (
        <Empty text='暂无提现申请' />
      ) : (
        <View className='withdrawal-list'>
          {withdrawals.map((w) => (
            <View key={w.id} className='withdrawal-card'>
              <View className='withdrawal-header'>
                <Text className='withdrawal-user'>{w.userName}</Text>
                <Text className='withdrawal-amount'>¥{w.amount}</Text>
              </View>
              <View className='withdrawal-info'>
                <Text>{w.bankName} {w.cardNumber.slice(-4)}</Text>
                <Text className='withdrawal-time'>{w.createdAt}</Text>
              </View>
              {w.status === 'pending' && (
                <View className='withdrawal-actions'>
                  <Button className='action-btn approve' onClick={() => handleApprove(w.id)}>通过</Button>
                  <Button className='action-btn reject' onClick={() => handleReject(w.id)}>拒绝</Button>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
