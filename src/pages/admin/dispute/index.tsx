import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { adminApi } from '@/domains/admin/api'
import Empty from '@/shared/components/Empty'
import { useAuth } from '@/shared/hooks/useAuth'
import './index.scss'

interface Dispute {
  id: string
  orderId: string
  buyerName: string
  sellerName: string
  reason: string
  status: 'pending' | 'resolved'
  createdAt: string
}

export default function AdminDispute() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(false)
  const { requireAdmin } = useAuth()

  useEffect(() => {
    requireAdmin()
  }, [])

  useLoad(() => {
    loadDisputes()
  })

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getDisputes()
      if (res.code === 0) setDisputes(res.data.list || [])
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id: string, decision: 'buyer' | 'seller') => {
    const res = await adminApi.resolveDispute(id, decision)
    if (res.code === 0) {
      loadDisputes()
    }
  }

  return (
    <View className='admin-dispute-page'>
      {disputes.length === 0 && !loading ? (
        <Empty text='暂无纠纷' />
      ) : (
        <View className='dispute-list'>
          {disputes.map((d) => (
            <View key={d.id} className='dispute-card'>
              <View className='dispute-header'>
                <Text className='dispute-id'>#{d.id.slice(-6)}</Text>
                <Text className={`dispute-status ${d.status}`}>{d.status === 'pending' ? '待处理' : '已解决'}</Text>
              </View>
              <Text className='dispute-reason'>{d.reason}</Text>
              <View className='dispute-parties'>
                <Text>买家: {d.buyerName}</Text>
                <Text>卖家: {d.sellerName}</Text>
              </View>
              {d.status === 'pending' && (
                <View className='dispute-actions'>
                  <Button className='action-btn buyer' onClick={() => handleResolve(d.id, 'buyer')}>支持买家</Button>
                  <Button className='action-btn seller' onClick={() => handleResolve(d.id, 'seller')}>支持卖家</Button>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
