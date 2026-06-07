import { tradeApi } from '../api'

export async function payWithH5(orderId: string): Promise<{ success: boolean }> {
  try {
    const res = await tradeApi.getPaymentParams(orderId)
    if (res.code !== 0) throw new Error(res.message || '获取支付参数失败')

    window.location.href = (res.data as any).paymentUrl
    return { success: true }
  } catch {
    return { success: false }
  }
}
