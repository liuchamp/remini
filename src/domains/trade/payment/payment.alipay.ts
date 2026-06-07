import Taro from '@tarojs/taro'
import { tradeApi } from '../api'

export async function payWithAlipay(orderId: string): Promise<{ success: boolean }> {
  try {
    const res = await tradeApi.getPaymentParams(orderId)
    if (res.code !== 0) throw new Error(res.message || '获取支付参数失败')

    await Taro.tradePay({
      tradeNO: (res.data as any).tradeNO
    })
    return { success: true }
  } catch (err: any) {
    if (err.errMsg?.includes('cancel')) return { success: false }
    throw err
  }
}
