import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useAddressStore } from '@/domains/address/store'
import './index.scss'

export default function List() {
  const { t } = useTranslation(['logistics', 'common'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void t
  const { addresses, loading, loadList, remove, setDefault } = useAddressStore()

  useLoad(() => {
    loadList()
  })

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/address/edit/index?id=${id}` })
  }

  const handleAdd = () => {
    if (addresses.length >= 20) {
      Taro.showToast({ title: '最多可添加20个地址', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/address/edit/index' })
  }

  const handleDelete = (id: string, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          remove(id).then((ok) => {
            if (ok) Taro.showToast({ title: '删除成功', icon: 'success' })
          })
        }
      }
    })
  }

  const handleSetDefault = (id: string, e: any) => {
    e.stopPropagation()
    setDefault(id).then(() => {
      Taro.showToast({ title: '已设为默认', icon: 'success' })
    })
  }

  return (
    <View className='address-list-page'>
      {addresses.length === 0 && !loading ? (
        <View className='empty-state'>
          <View className='empty-icon' />
          <Text className='empty-text'>暂无收货地址</Text>
          <View className='add-btn' onClick={handleAdd}>
            <Text>添加新地址</Text>
          </View>
        </View>
      ) : (
        <>
          <ScrollView className='address-list' scrollY>
            {addresses.map((addr) => (
              <View
                key={addr.id}
                className='address-card'
                onClick={() => handleEdit(addr.id)}
              >
                <View className='card-header'>
                  <View className='card-left'>
                    <Text className='recipient'>{addr.recipient}</Text>
                    <Text className='phone'>{addr.phone}</Text>
                  </View>
                  <View className='card-right'>
                    {addr.isDefault && (
                      <View className='default-badge'>默认</View>
                    )}
                  </View>
                </View>

                <View className='address-detail'>
                  <Text className='address-text'>
                    {addr.province}{addr.city}{addr.district}{addr.detail}
                  </Text>
                  {addr.label && (
                    <View className='label-tag'>
                      <Text>{addr.label}</Text>
                    </View>
                  )}
                </View>

                <View className='card-actions'>
                  {!addr.isDefault && (
                    <View
                      className='action-btn default-action'
                      onClick={(e) => handleSetDefault(addr.id, e)}
                    >
                      <Text>设为默认</Text>
                    </View>
                  )}
                  <View
                    className='action-btn delete-action'
                    onClick={(e) => handleDelete(addr.id, e)}
                  >
                    <Text>删除</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className='bottom-bar'>
            <View
              className={`add-address-btn ${addresses.length >= 20 ? 'disabled' : ''}`}
              onClick={handleAdd}
            >
              <Text className='add-icon'>+</Text>
              <Text>{addresses.length >= 20 ? `地址数量已达上限（${addresses.length}/20）` : '添加新地址'}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
