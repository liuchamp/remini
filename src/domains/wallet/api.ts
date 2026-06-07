import { http } from '@/shared/api/request'

export interface WithdrawRequest {
  amount: number
  paymentAccountId: string
  note?: string
}

export interface PaymentAccount {
  id: string
  type: 'alipay' | 'wechat' | 'bank'
  accountNo: string
  accountName: string
  isDefault: boolean
}

export interface BindPaymentAccountRequest {
  type: 'alipay' | 'wechat' | 'bank'
  accountNo: string
  accountName: string
  setDefault?: boolean
}

export const walletApi = {
  getBalance() {
    return http.get<EscrowBalance>('/escrow/balance')
  },

  getTransactions(page?: number) {
    return http.get<{ transactions: TransactionRecord[]; total: number; hasMore: boolean }>(
      '/escrow/transactions',
      { page }
    )
  },

  createWithdraw(data: WithdrawRequest) {
    return http.post<{ withdrawId: string }>('/withdraw', data)
  },

  getPaymentAccounts() {
    return http.get<PaymentAccount[]>('/payment-accounts')
  },

  bindPaymentAccount(data: BindPaymentAccountRequest) {
    return http.post<PaymentAccount>('/payment-accounts', data)
  }
}
