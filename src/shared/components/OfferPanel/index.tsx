import { useState, useCallback, useMemo } from 'react'
import { View, Text, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { offerApi, type Offer } from '@/domains/trade/offer'
import './index.scss'

interface OfferPanelProps {
  productId: string
  productTitle: string
  productPrice: number
  isNegotiable: boolean
  existingOffers?: Offer[]
}

const OFFER_TTL_MS = 48 * 60 * 60 * 1000

export function isOfferExpired(offer: Offer): boolean {
  if (!offer.expiresAt) return false
  return Date.now() > new Date(offer.expiresAt).getTime()
}

export function isOfferValid(offer: Offer): boolean {
  const created = new Date(offer.createdAt).getTime()
  return Date.now() - created < OFFER_TTL_MS
}

function getCooldownKey(productId: string): string {
  return `offer_cooldown_${productId}`
}

function isInCooldown(productId: string): { blocked: boolean; remaining: number } {
  try {
    const lastTime = Taro.getStorageSync(getCooldownKey(productId))
    if (!lastTime) return { blocked: false, remaining: 0 }
    const elapsed = Date.now() - Number(lastTime)
    const COOLDOWN_MS = 60_000
    if (elapsed < COOLDOWN_MS) {
      return { blocked: true, remaining: Math.ceil((COOLDOWN_MS - elapsed) / 1000) }
    }
    return { blocked: false, remaining: 0 }
  } catch {
    return { blocked: false, remaining: 0 }
  }
}

function setCooldown(productId: string): void {
  try {
    Taro.setStorageSync(getCooldownKey(productId), Date.now())
  } catch {}
}

export default function OfferPanel({
  productId,
  productTitle,
  productPrice,
  isNegotiable,
  existingOffers = []
}: OfferPanelProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const pendingOffer = useMemo(
    () => existingOffers.find(o => o.status === 'pending'),
    [existingOffers]
  )

  const cooldown = useMemo(() => isInCooldown(productId), [productId])

  const isPendingExpired = pendingOffer ? isOfferValid(pendingOffer) === false : false

  const handleAmountInput = useCallback((e: { detail: { value: string } }) => {
    const value = e.detail.value
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      Taro.showToast({ title: '请输入有效的出价金额', icon: 'none' })
      return
    }

    if (amountNum > productPrice * 2) {
      Taro.showToast({ title: '出价不能超过原价的 2 倍', icon: 'none' })
      return
    }

    const { blocked, remaining } = isInCooldown(productId)
    if (blocked) {
      Taro.showToast({ title: `请${remaining}秒后再出价`, icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await offerApi.create({
        productId,
        amount: amountNum,
        note: note || undefined
      })

      if (res.code === 0) {
        setCooldown(productId)
        Taro.showToast({ title: '出价成功', icon: 'success' })
        setAmount('')
        setNote('')
      } else {
        Taro.showToast({ title: res.message || '出价失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '网络异常，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [amount, note, productId, productPrice])

  if (!isNegotiable) {
    return (
      <View className='offer-panel'>
        <View className='offer-header'>
          <Text className='offer-title'>议价</Text>
        </View>
        <View className='offer-readonly'>
          <Text className='offer-readonly-text'>该商品为固定价格，不支持议价</Text>
        </View>
      </View>
    )
  }

  if (pendingOffer) {
    return (
      <View className='offer-panel'>
        <View className='offer-header'>
          <Text className='offer-title'>我的出价</Text>
          {isPendingExpired && (
            <Text className='offer-expired-badge'>已过期</Text>
          )}
        </View>
        <View className='offer-pending'>
          <View className='offer-pending-row'>
            <Text className='offer-pending-label'>出价金额</Text>
            <Text className='offer-pending-value'>{pendingOffer.amount}</Text>
          </View>
          {pendingOffer.note && (
            <View className='offer-pending-row'>
              <Text className='offer-pending-label'>备注</Text>
              <Text className='offer-pending-value'>{pendingOffer.note}</Text>
            </View>
          )}
          <View className='offer-pending-row'>
            <Text className='offer-pending-label'>状态</Text>
            <Text className={`offer-status offer-status--${pendingOffer.status}`}>
              {isPendingExpired ? '已超时(48小时)' : '等待卖家回复'}
            </Text>
          </View>
        </View>
        {isPendingExpired && (
          <View className='offer-expired-hint'>
            <Text className='offer-expired-hint-text'>
              出价已超过 48 小时，卖家未在时限内回复，出价自动失效。您可以重新出价。
            </Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className='offer-panel'>
      <View className='offer-header'>
        <Text className='offer-title'>议价</Text>
        <Text className='offer-hint'>原价 ¥{productPrice}</Text>
      </View>

      <View className='offer-form'>
        <View className='offer-amount-row'>
          <Text className='offer-label'>¥</Text>
          <Input
            className='offer-amount-input'
            type='digit'
            placeholder='输入您的出价'
            value={amount}
            onInput={handleAmountInput}
            placeholderClass='offer-placeholder'
          />
        </View>

        <View className='offer-note-row'>
          <Textarea
            className='offer-note-input'
            placeholder='添加备注（选填）'
            value={note}
            onInput={(e) => setNote(e.detail.value)}
            maxlength={200}
            autoHeight
            placeholderClass='offer-placeholder'
          />
          <Text className='offer-note-count'>{note.length}/200</Text>
        </View>

        <View
          className={`offer-submit ${loading || cooldown.blocked ? 'offer-submit--disabled' : ''}`}
          onClick={loading || cooldown.blocked ? undefined : handleSubmit}
        >
          <Text className='offer-submit-text'>
            {loading
              ? '提交中...'
              : cooldown.blocked
              ? `${cooldown.remaining}秒后可再次出价`
              : '提交出价'}
          </Text>
        </View>
      </View>

      <View className='offer-footer'>
        <Text className='offer-footer-text'>
          出价后卖家将在 48 小时内回复，超时将自动失效
        </Text>
      </View>
    </View>
  )
}
