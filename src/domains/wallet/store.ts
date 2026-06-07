import { create } from 'zustand'
import { walletApi } from './api'

interface WalletState {
  // Balance
  balance: EscrowBalance | null

  // Transactions
  transactions: TransactionRecord[]
  transactionsPage: number
  transactionsHasMore: boolean

  // Payment accounts
  paymentAccounts: PaymentAccount[]

  // Withdraw
  withdrawLoading: boolean
  withdrawSuccess: boolean

  // Loading
  loading: boolean
  refreshing: boolean

  // Actions
  loadBalance: () => Promise<void>
  loadTransactions: (refresh?: boolean) => Promise<void>
  loadPaymentAccounts: () => Promise<void>
  submitWithdraw: (amount: number, paymentAccountId: string, note?: string) => Promise<boolean>
  resetWithdraw: () => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: null,
  transactions: [],
  transactionsPage: 1,
  transactionsHasMore: true,
  paymentAccounts: [],
  withdrawLoading: false,
  withdrawSuccess: false,
  loading: false,
  refreshing: false,

  loadBalance: async () => {
    set({ refreshing: true })
    try {
      const res = await walletApi.getBalance()
      if (res.code === 0) {
        set({ balance: res.data, refreshing: false })
      }
    } catch {
      set({ refreshing: false })
    }
  },

  loadTransactions: async (refresh = false) => {
    const page = refresh ? 1 : get().transactionsPage
    set(refresh ? { refreshing: true } : { loading: true })
    try {
      const res = await walletApi.getTransactions(page)
      if (res.code === 0) {
        set({
          transactions: refresh
            ? res.data.transactions
            : [...get().transactions, ...res.data.transactions],
          transactionsPage: page + 1,
          transactionsHasMore: res.data.hasMore,
          refreshing: false,
          loading: false
        })
      }
    } catch {
      set({ loading: false, refreshing: false })
    }
  },

  loadPaymentAccounts: async () => {
    try {
      const res = await walletApi.getPaymentAccounts()
      if (res.code === 0) set({ paymentAccounts: res.data })
    } catch { /* silent */ }
  },

  submitWithdraw: async (amount, paymentAccountId, note?) => {
    set({ withdrawLoading: true, withdrawSuccess: false })
    try {
      const res = await walletApi.createWithdraw({ amount, paymentAccountId, note })
      if (res.code === 0) {
        set({ withdrawLoading: false, withdrawSuccess: true })
        // Refresh balance after successful withdraw
        get().loadBalance()
        return true
      }
      set({ withdrawLoading: false })
      return false
    } catch {
      set({ withdrawLoading: false })
      return false
    }
  },

  resetWithdraw: () => set({ withdrawSuccess: false })
}))
