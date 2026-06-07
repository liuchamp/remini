import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWalletStore } from '@/domains/wallet/store'
import { PaymentAccount } from '@/domains/wallet/api'
import { useAuthStore } from '@/domains/auth/store'
import './index.scss'

const KYC_LIMITS: Record<'L0' | 'L1' | 'L2' | 'L3', number> = {
  L0: 0,
  L1: 0,
  L2: 5000,
  L3: 50000
}

export default function Withdraw() {
  const { t, i18n } = useTranslation('wallet')
  const isZh = i18n.language?.startsWith('zh')

  const user = useAuthStore((s) => s.user)
  const currentTier = user?.currentKycTier || 'L0'

  const {
    balance,
    paymentAccounts,
    withdrawLoading,
    withdrawSuccess,
    loadBalance,
    loadPaymentAccounts,
    submitWithdraw,
    resetWithdraw
  } = useWalletStore()

  const [amount, setAmount] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [amountError, setAmountError] = useState<string>('')

  useEffect(() => {
    loadBalance()
    loadPaymentAccounts()
  }, [])

  useEffect(() => {
    if (withdrawSuccess) {
      Taro.showToast({ title: t('wallet.withdrawSuccess'), icon: 'success' })
      resetWithdraw()
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }, [withdrawSuccess, resetWithdraw, t])

  const availableBalance = balance?.availableBalance || 0
  const maxWithdraw = Math.min(availableBalance, KYC_LIMITS[currentTier])

  const validateAmount = useCallback((value: string) => {
    if (KYC_LIMITS[currentTier] === 0) {
      setAmountError(isZh ? '当前等级可提现额度为0，请先完成L2实名认证' : 'Current limit is 0. L2 verification required.')
      return false
    }
    const num = parseFloat(value)
    if (value === '' || isNaN(num)) {
      setAmountError('')
      return true
    }
    if (num < 10) {
      setAmountError(t('wallet.minAmount'))
      return false
    }
    if (num > maxWithdraw) {
      if (availableBalance < KYC_LIMITS[currentTier]) {
        setAmountError(t('wallet.exceedBalance'))
      } else {
        setAmountError(
          isZh
            ? `单笔最大提现限额为 ¥${KYC_LIMITS[currentTier]}`
            : `Maximum withdraw limit is ¥${KYC_LIMITS[currentTier]}`
        )
      }
      return false
    }
    setAmountError('')
    return true
  }, [availableBalance, maxWithdraw, currentTier, t, isZh])

  const handleAmountChange = (e: any) => {
    const value = e.detail.value
    setAmount(value)
    validateAmount(value)
  }

  const handleWithdraw = async () => {
    if (!validateAmount(amount)) return
    if (!selectedAccountId) {
      Taro.showToast({ title: t('wallet.selectAccount'), icon: 'none' })
      return
    }
    const numAmount = parseFloat(amount)
    await submitWithdraw(numAmount, selectedAccountId)
  }

  const formatAmount = (amt: number) => amt.toFixed(2)

  const getAccountTypeLabel = (type: PaymentAccount['type']) => {
    switch (type) {
      case 'alipay': return '支付宝'
      case 'wechat': return '微信'
      case 'bank': return '银行卡'
      default: return type
    }
  }

  const maskAccountNo = (accountNo: string) => {
    if (accountNo.length <= 4) return accountNo
    return '**** **** **** ' + accountNo.slice(-4)
  }

  const isSubmitDisabled = withdrawLoading || !amount || !!amountError || !selectedAccountId || maxWithdraw === 0

  return (
    <View className='withdraw-page'>
      <ScrollView className='withdraw-scroll' scrollY>
        {/* KYC Upgrade Banner */}
        {(currentTier === 'L0' || currentTier === 'L1') && (
          <View className='kyc-warning-banner'>
            <View className='banner-content'>
              <Text className='banner-icon'>🔒</Text>
              <View className='banner-text-group'>
                <Text className='banner-title'>
                  {isZh ? '提现功能受限' : 'Withdrawal Restricted'}
                </Text>
                <Text className='banner-desc'>
                  {isZh
                    ? '根据合规要求，您需要完成 L2 实名认证后才能进行提现。'
                    : 'To comply with regulations, L2 verification is required to withdraw funds.'}
                </Text>
              </View>
            </View>
            <Button
              className='banner-action-btn'
              onClick={() => Taro.navigateTo({ url: '/pages/kyc/index/index' })}
            >
              {isZh ? '去认证' : 'Verify Now'}
            </Button>
          </View>
        )}

        {/* Available Balance */}
        <View className='balance-section'>
          <View className='balance-card'>
            <Text className='balance-label'>{t('wallet.availableBalanceLabel')}</Text>
            <View className='balance-amount'>
              <Text className='amount-symbol'>¥</Text>
              <Text className='amount-value'>{formatAmount(availableBalance)}</Text>
            </View>
          </View>
        </View>

        {/* Withdraw Amount Input */}
        <View className='form-section'>
          <View className='form-group'>
            <Text className='form-label'>{t('wallet.withdrawAmount')}</Text>
            <View className='amount-input-wrapper'>
              <Text className='currency-symbol'>¥</Text>
              <Input
                className='amount-input'
                type='digit'
                placeholder={t('wallet.withdrawAmountPlaceholder')}
                value={amount}
                onInput={handleAmountChange}
                maxlength={8}
                disabled={withdrawLoading || maxWithdraw === 0}
              />
            </View>
            {maxWithdraw === 0 ? (
              <Text className='error-text'>
                {isZh ? '当前等级可提现额度为0，请先完成L2实名认证' : 'Current limit is 0. L2 verification required.'}
              </Text>
            ) : (
              amountError && <Text className='error-text'>{amountError}</Text>
            )}
            <View className='limit-hints'>
              <Text className='hint-item'>{t('wallet.minAmount')}</Text>
              <Text className='hint-item'>
                {availableBalance < KYC_LIMITS[currentTier]
                  ? t('wallet.exceedBalance')
                  : isZh
                    ? `最大提现金额为 ¥${KYC_LIMITS[currentTier]}`
                    : `Max withdraw limit is ¥${KYC_LIMITS[currentTier]}`
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Bank Card Selection */}
        <View className='form-section'>
          <Text className='section-title'>{t('wallet.selectAccount')}</Text>
          {paymentAccounts.length === 0 ? (
            <View className='empty-account'>
              <Text className='empty-text'>{t('wallet.noAccount')}</Text>
              <Button
                className='add-account-btn'
                onClick={() => Taro.navigateTo({ url: '/pages/wallet/bind-card/index' })}
                size='mini'
                type='primary'
              >
                {t('wallet.addAccount')}
              </Button>
            </View>
          ) : (
            <View className='account-list'>
              {paymentAccounts.map((account: PaymentAccount) => (
                <View
                  key={account.id}
                  className={`account-item ${selectedAccountId === account.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAccountId(account.id)}
                >
                  <View className='account-info'>
                    <View className='account-type'>
                      <Text className='type-badge'>{getAccountTypeLabel(account.type)}</Text>
                      {account.isDefault && <Text className='default-badge'>{t('bindCard.defaultCard')}</Text>}
                    </View>
                    <View className='account-details'>
                      <Text className='account-name'>{account.accountName}</Text>
                      <Text className='account-no'>{maskAccountNo(account.accountNo)}</Text>
                    </View>
                  </View>
                  <View className={`radio-icon ${selectedAccountId === account.id ? 'checked' : ''}`} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Admin Review Note */}
        <View className='note-section'>
          <Text className='note-icon'>⚠️</Text>
          <Text className='note-text'>{t('wallet.adminReviewNote')}</Text>
        </View>

        {/* Confirm Button */}
        <View className='submit-bar'>
          <Button
            className='submit-btn'
            onClick={handleWithdraw}
            loading={withdrawLoading}
            disabled={isSubmitDisabled}
          >
            {withdrawLoading ? t('wallet.withdrawing') : t('wallet.confirmWithdraw')}
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}
