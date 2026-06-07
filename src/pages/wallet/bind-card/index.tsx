import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { walletApi } from '@/domains/wallet/api'
import './index.scss'

export default function BindCard() {
  const [bankName, setBankName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [holderName, setHolderName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!bankName || !cardNumber || !holderName || !phone) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const res = await walletApi.bindPaymentAccount({
        bankName,
        cardNumber,
        holderName,
        phone
      })
      if (res.code === 0) {
        Taro.showToast({ title: '绑定成功', icon: 'success' })
        Taro.navigateBack()
      }
    } catch {
      /* handled by interceptors */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='bind-card-page'>
      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>开户银行</Text>
          <Input
            className='form-input'
            placeholder='请输入开户银行名称'
            value={bankName}
            onInput={(e) => setBankName(e.detail.value)}
          />
        </View>
        <View className='form-group'>
          <Text className='form-label'>银行卡号</Text>
          <Input
            className='form-input'
            type='number'
            placeholder='请输入银行卡号'
            value={cardNumber}
            onInput={(e) => setCardNumber(e.detail.value)}
          />
        </View>
        <View className='form-group'>
          <Text className='form-label'>持卡人姓名</Text>
          <Input
            className='form-input'
            placeholder='请输入持卡人姓名'
            value={holderName}
            onInput={(e) => setHolderName(e.detail.value)}
          />
        </View>
        <View className='form-group'>
          <Text className='form-label'>预留手机号</Text>
          <Input
            className='form-input'
            type='number'
            maxlength={11}
            placeholder='请输入预留手机号'
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>
      </View>
      <View className='submit-bar'>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          确认绑定
        </Button>
      </View>
    </View>
  )
}
