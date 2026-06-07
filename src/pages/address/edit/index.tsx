import { View, Text, Input, Switch } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { addressApi } from '@/domains/address/api'
import { useTranslation } from 'react-i18next'
import { useAddressStore } from '@/domains/address/store'
import './index.scss'

export default function Edit() {
  const { t } = useTranslation(['logistics', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const router = useRouter()
  const id = router.params.id
  const isEdit = !!id
  const [saving, setSaving] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const { loadList } = useAddressStore()

  const [form, setForm] = useState({
    recipient: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
    label: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useLoad(() => {
    if (id) {
      setLoadingDetail(true)
      addressApi.getDetail(id).then((res) => {
        if (res.code === 0 && res.data) {
          const d = res.data
          setForm({
            recipient: d.recipient || '',
            phone: d.phone || '',
            province: d.province || '',
            city: d.city || '',
            district: d.district || '',
            detail: d.detail || '',
            isDefault: d.isDefault || false,
            label: d.label || ''
          })
        }
        setLoadingDetail(false)
      }).catch(() => setLoadingDetail(false))
    } else {
      loadList().then(() => {
        const currentAddresses = useAddressStore.getState().addresses
        const hasDefault = currentAddresses.some((addr) => addr.isDefault)
        if (!hasDefault) {
          setForm((prev) => ({ ...prev, isDefault: true }))
        }
      })
    }
  })

  const setField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.recipient.trim()) errs.recipient = '请输入收货人姓名'
    if (!form.phone.trim()) errs.phone = '请输入手机号'
    else if (!/^1\d{10}$/.test(form.phone.trim())) errs.phone = '手机号格式不正确'
    if (!form.province.trim()) errs.province = '请输入省份'
    if (!form.city.trim()) errs.city = '请输入城市'
    if (!form.district.trim()) errs.district = '请输入区/县'
    if (!form.detail.trim()) errs.detail = '请输入详细地址'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data = {
        recipient: form.recipient.trim(),
        phone: form.phone.trim(),
        province: form.province.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        detail: form.detail.trim(),
        isDefault: form.isDefault,
        label: form.label.trim() || undefined
      }

      const res = isEdit
        ? await addressApi.update(id!, data)
        : await addressApi.create(data)

      if (res.code === 0) {
        Taro.showToast({ title: isEdit ? '保存成功' : '添加成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 1500)
      }
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!id) return
    Taro.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          addressApi.delete(id).then((r) => {
            if (r.code === 0) {
              Taro.showToast({ title: '删除成功', icon: 'success' })
              setTimeout(() => Taro.navigateBack(), 1500)
            }
          })
        }
      }
    })
  }

  if (loadingDetail) {
    return (
      <View className='edit-page'>
        <View className='loading-state'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='edit-page'>
      <View className='form-section'>
        <View className='form-group'>
          <Text className='form-label'>收货人</Text>
          <Input
            className={`form-input ${errors.recipient ? 'has-error' : ''}`}
            placeholder='请输入收货人姓名'
            value={form.recipient}
            onInput={(e) => setField('recipient', e.detail.value)}
          />
          {errors.recipient && <Text className='error-text'>{errors.recipient}</Text>}
        </View>

        <View className='form-group'>
          <Text className='form-label'>手机号</Text>
          <Input
            className={`form-input ${errors.phone ? 'has-error' : ''}`}
            placeholder='请输入手机号'
            type='number'
            maxlength={11}
            value={form.phone}
            onInput={(e) => setField('phone', e.detail.value)}
          />
          {errors.phone && <Text className='error-text'>{errors.phone}</Text>}
        </View>

        <View className='form-row'>
          <View className='form-group flex-1'>
            <Text className='form-label'>省份</Text>
            <Input
              className={`form-input ${errors.province ? 'has-error' : ''}`}
              placeholder='省份'
              value={form.province}
              onInput={(e) => setField('province', e.detail.value)}
            />
            {errors.province && <Text className='error-text'>{errors.province}</Text>}
          </View>
          <View className='form-group flex-1'>
            <Text className='form-label'>城市</Text>
            <Input
              className={`form-input ${errors.city ? 'has-error' : ''}`}
              placeholder='城市'
              value={form.city}
              onInput={(e) => setField('city', e.detail.value)}
            />
            {errors.city && <Text className='error-text'>{errors.city}</Text>}
          </View>
        </View>

        <View className='form-group'>
          <Text className='form-label'>区/县</Text>
          <Input
            className={`form-input ${errors.district ? 'has-error' : ''}`}
            placeholder='请输入区/县'
            value={form.district}
            onInput={(e) => setField('district', e.detail.value)}
          />
          {errors.district && <Text className='error-text'>{errors.district}</Text>}
        </View>

        <View className='form-group'>
          <Text className='form-label'>详细地址</Text>
          <Input
            className={`form-input ${errors.detail ? 'has-error' : ''}`}
            placeholder='街道、楼栋、门牌号等'
            value={form.detail}
            onInput={(e) => setField('detail', e.detail.value)}
          />
          {errors.detail && <Text className='error-text'>{errors.detail}</Text>}
        </View>

        <View className='form-group'>
          <Text className='form-label'>标签（可选）</Text>
          <Input
            className='form-input'
            placeholder='如：家、公司、学校'
            value={form.label}
            onInput={(e) => setField('label', e.detail.value)}
          />
        </View>

        <View className='form-group form-group-switch'>
          <Text className='form-label'>设为默认地址</Text>
          <Switch
            color='#FF6B35'
            checked={form.isDefault}
            onChange={(e) => setField('isDefault', e.detail.value)}
          />
        </View>
      </View>

      <View className='form-actions'>
        <View
          className={`save-btn ${saving ? 'disabled' : ''}`}
          onClick={handleSave}
        >
          <Text>{saving ? '保存中...' : isEdit ? '保存地址' : '添加地址'}</Text>
        </View>
        {isEdit && (
          <View className='delete-btn' onClick={handleDelete}>
            <Text>删除地址</Text>
          </View>
        )}
      </View>
    </View>
  )
}
