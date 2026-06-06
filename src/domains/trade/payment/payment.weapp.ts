import Taro from '@tarojs/taro'
import { tradeApi } from '../api'

export async function payWithWechat(orderId: string): Promise<{ success: boolean }> {
  try {
    const res = await tradeApi.getPaymentParams(orderId)
    if (res.code !== 0) throw new Error(res.message || '获取支付参数失败')
    await Taro.requestPayment({
      timeStamp: res.data.timeStamp,
      nonceStr: res.data.nonceStr,
      package: res.data.package,
      signType: res.data.signType as keyof Taro.requestPayment.SignType,
      paySign: res.data.paySign
    })
    return { success: true }
  } catch (err: any) {
    if (err.errMsg?.includes('cancel')) return { success: false }
    throw err
  }
}
