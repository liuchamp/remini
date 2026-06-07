import { View, Text, Input, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { walletApi, PaymentAccount } from '@/domains/wallet/api'
import './index.scss'

const BANKS = [
  { label: '中国工商银行', value: 'ICBC' },
  { label: '中国建设银行', value: 'CCB' },
  { label: '中国农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
  { label: '招商银行', value: 'CMB' },
  { label: '中国邮政储蓄银行', value: 'PSBC' },
  { label: '中信银行', value: 'CITIC' },
  { label: '中国光大银行', value: 'CEB' },
  { label: '华夏银行', value: 'HXB' },
  { label: '中国民生银行', value: 'CMBC' },
  { label: '平安银行', value: 'PAB' },
  { label: '兴业银行', value: 'CIB' },
  { label: '上海浦东发展银行', value: 'SPDB' },
  { label: '北京银行', value: 'BOB' },
]

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  const groups: string[] = []
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4))
  }
  return groups.join(' ')
}

function unformatCardNumber(value: string): string {
  return value.replace(/\s/g, '')
}

function maskCardNumber(cardNo: string): string {
  if (cardNo.length < 8) return cardNo
  return cardNo.slice(0, 4) + ' **** **** ' + cardNo.slice(-4)
}

export default function BindCard() {
  const { t } = useTranslation('wallet')

  const [bankIndex, setBankIndex] = useState(-1)
  const [cardNumber, setCardNumber] = useState('')
  const [holderName, setHolderName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true)
    try {
      const res = await walletApi.getPaymentAccounts()
      if (res.code === 0) {
        setAccounts(res.data.filter(a => a.type === 'bank'))
      }
    } catch {
      /* handled by interceptors */
    } finally {
      setAccountsLoading(false)
    }
  }, [])

  useLoad(() => {
    loadAccounts()
  })

  useDidShow(() => {
    loadAccounts()
  })

  const handleBankChange = (e: any) => {
    setBankIndex(e.detail.value as number)
  }

  const handleCardNumberInput = (e: any) => {
    const raw = e.detail.value
    const digits = raw.replace(/\D/g, '')
    if (digits.length > 19) return
    setCardNumber(formatCardNumber(digits))
  }

  const handlePhoneInput = (e: any) => {
    const raw = e.detail.value
    const digits = raw.replace(/\D/g, '')
    if (digits.length > 11) return
    setPhone(digits)
  }

  const validate = (): boolean => {
    if (bankIndex < 0) {
      Taro.showToast({ title: t('bindCard.pleaseFillAll'), icon: 'none' })
      return false
    }
    const rawCard = unformatCardNumber(cardNumber)
    if (!rawCard || rawCard.length < 15) {
      Taro.showToast({ title: t('bindCard.invalidCardNumber'), icon: 'none' })
      return false
    }
    if (!holderName.trim()) {
      Taro.showToast({ title: t('bindCard.pleaseFillAll'), icon: 'none' })
      return false
    }
    if (!phone || phone.length !== 11) {
      Taro.showToast({ title: t('bindCard.invalidPhone'), icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await walletApi.bindPaymentAccount({
        type: 'bank',
        accountNo: unformatCardNumber(cardNumber),
        accountName: holderName.trim(),
        bankName: BANKS[bankIndex].label,
        phone,
        setDefault: accounts.length === 0,
      })
      if (res.code === 0) {
        Taro.showToast({ title: t('bindCard.bindSuccess'), icon: 'success' })
        Taro.navigateBack()
      }
    } catch {
      Taro.showToast({ title: t('bindCard.bindFailed'), icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: t('bindCard.deleteConfirm'),
      content: '',
      success: async (res) => {
        if (!res.confirm) return
        setDeletingId(id)
        try {
          const delRes = await walletApi.deletePaymentAccount(id)
          if (delRes.code === 0) {
            Taro.showToast({ title: t('bindCard.deleteSuccess'), icon: 'success' })
            loadAccounts()
          }
        } catch {
          Taro.showToast({ title: t('bindCard.deleteFailed'), icon: 'none' })
        } finally {
          setDeletingId(null)
        }
      },
    })
  }

  return (
    <ScrollView className='bind-card-page' scrollY>
      {/* Existing Cards */}
      <View className='section-card'>
        <Text className='section-title'>{t('bindCard.existingCards')}</Text>
        {accountsLoading && accounts.length === 0 ? (
          <View className='loading-state'>
            <Text className='loading-text'>{t('wallet.loadingMore')}</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-text'>{t('bindCard.noCards')}</Text>
          </View>
        ) : (
          <View className='card-list'>
            {accounts.map(acc => (
              <View key={acc.id} className='card-item'>
                <View className='card-info'>
                  <View className='card-row'>
                    <Text className='card-bank'>{acc.bankName || acc.accountNo}</Text>
                    {acc.isDefault && (
                      <Text className='card-default-tag'>{t('bindCard.defaultCard')}</Text>
                    )}
                  </View>
                  <Text className='card-number'>{maskCardNumber(acc.accountNo)}</Text>
                  <Text className='card-name'>{acc.accountName}</Text>
                </View>
                <Button
                  className='card-delete-btn'
                  onClick={() => handleDelete(acc.id)}
                  loading={deletingId === acc.id}
                  disabled={deletingId !== null}
                >
                  {t('bindCard.deleteCard')}
                </Button>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bind New Card Form */}
      <View className='section-card'>
        <Text className='section-title'>{t('bindCard.title')}</Text>

        <View className='form-group'>
          <Text className='form-label'>{t('bindCard.bankName')}</Text>
          <Picker
            mode='selector'
            range={BANKS}
            rangeKey='label'
            value={bankIndex >= 0 ? bankIndex : 0}
            onChange={handleBankChange}
          >
            <View className={`form-picker ${bankIndex < 0 ? 'placeholder' : ''}`}>
              {bankIndex >= 0 ? BANKS[bankIndex].label : t('bindCard.bankNamePlaceholder')}
            </View>
          </Picker>
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('bindCard.cardNumber')}</Text>
          <Input
            className='form-input'
            placeholder={t('bindCard.cardNumberPlaceholder')}
            value={cardNumber}
            onInput={handleCardNumberInput}
            maxlength={23}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('bindCard.holderName')}</Text>
          <Input
            className='form-input'
            placeholder={t('bindCard.holderNamePlaceholder')}
            value={holderName}
            onInput={(e) => setHolderName(e.detail.value)}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>{t('bindCard.phone')}</Text>
          <Input
            className='form-input'
            type='number'
            maxlength={11}
            placeholder={t('bindCard.phonePlaceholder')}
            value={phone}
            onInput={handlePhoneInput}
          />
        </View>
      </View>

      {/* Submit */}
      <View className='submit-bar'>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          {submitting ? t('bindCard.binding') : t('bindCard.nextStep')}
        </Button>
      </View>
    </ScrollView>
  )
}
