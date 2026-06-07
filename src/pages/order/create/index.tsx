import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useRouter } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { tradeApi } from '@/domains/trade/api'
import { productApi } from '@/domains/product/api'
import { addressApi } from '@/domains/address/api'
import './index.scss'

export default function Create() {
  const { t } = useTranslation(['trade', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLoad(() => {
    const productId = router.params.productId
    if (productId) {
      loadProduct(productId)
    } else {
      Taro.showToast({ title: '参数错误', icon: 'none' })
    }
    loadAddresses()
  })

  const loadProduct = async (id: string) => {
    try {
      const res = await productApi.getDetail(id)
      if (res.code === 0) {
        setProduct(res.data as Product)
      }
    } catch {
      Taro.showToast({ title: '商品信息加载失败', icon: 'none' })
    }
  }

  const loadAddresses = async () => {
    try {
      const res = await addressApi.getList()
      if (res.code === 0) {
        const data = res.data as { addresses: Address[] }
        setAddresses(data.addresses)
        const defaultAddr = data.addresses.find(a => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id)
        }
      }
    } catch {}
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId)

  const handleSelectAddress = () => {
    Taro.navigateTo({
      url: '/pages/address/list/index',
      events: {
        onSelectAddress: (addr: Address) => {
          setSelectedAddressId(addr.id)
          setAddresses(prev => {
            const exists = prev.some(a => a.id === addr.id)
            return exists ? prev : [...prev, addr]
          })
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (!product) return
    if (!selectedAddressId) {
      Taro.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const res = await tradeApi.createOrder({
        productId: product.id,
        addressId: selectedAddressId,
      })
      if (res.code === 0) {
        const data = res.data as { id: string }
        Taro.redirectTo({ url: `/pages/order/pay/index?orderId=${data.id}` })
      }
    } catch {
      Taro.showToast({ title: '创建订单失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='create-page'>
      <View className='create-scroll'>
        <View className='section address-section' onClick={handleSelectAddress}>
          {selectedAddress ? (
            <View className='address-info'>
              <View className='address-top'>
                <Text className='address-name'>{selectedAddress.recipientName}</Text>
                <Text className='address-phone'>{selectedAddress.phone}</Text>
                {selectedAddress.isDefault && (
                  <Text className='default-badge'>默认</Text>
                )}
              </View>
              <Text className='address-detail'>
                {selectedAddress.province}{selectedAddress.city}{selectedAddress.district}{selectedAddress.detail}
              </Text>
            </View>
          ) : (
            <View className='address-empty'>
              <Text className='add-address-text'>请选择收货地址</Text>
              <Text className='arrow'>&gt;</Text>
            </View>
          )}
        </View>

        {product && (
          <View className='section product-section'>
            <View className='product-card'>
              <Image className='product-image' src={product.images[0]} mode='aspectFill' />
              <View className='product-info'>
                <Text className='product-title' numberOfLines={2}>{product.title}</Text>
                <Text className='product-price'>¥{product.price.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        <View className='section summary-section'>
          <View className='summary-row'>
            <Text className='summary-label'>商品金额</Text>
            <Text className='summary-value'>¥{product ? product.price.toFixed(2) : '0.00'}</Text>
          </View>
          <View className='summary-row'>
            <Text className='summary-label'>运费</Text>
            <Text className='summary-value free'>免运费</Text>
          </View>
          <View className='summary-divider' />
          <View className='summary-row total'>
            <Text className='summary-label'>合计</Text>
            <Text className='summary-value total-amount'>
              ¥{product ? product.price.toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>

        <View className='section note-section'>
          <View className='note-row'>
            <Text className='note-label'>备注</Text>
            <Text
              className='note-input'
              onClick={() => {
                Taro.showModal({
                  title: '订单备注',
                  content: '请输入备注信息',
                  placeholderText: '选填，如有特殊要求可备注',
                  editable: true,
                  success: (res) => {
                    if (res.confirm && res.content) {
                      setNote(res.content)
                    }
                  }
                })
              }}
            >
              {note || '选填，如有特殊要求可备注'}
            </Text>
          </View>
        </View>
      </View>

      <View className='bottom-bar'>
        <View className='total-display'>
          <Text className='total-label'>合计: </Text>
          <Text className='total-amount'>¥{product ? product.price.toFixed(2) : '0.00'}</Text>
        </View>
        <View
          className={`submit-btn ${submitting || !selectedAddressId ? 'disabled' : ''}`}
          onClick={handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '提交订单'}</Text>
        </View>
      </View>
    </View>
  )
}
