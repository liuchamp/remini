import { create } from 'zustand'
import { AdminDashboardData } from './types'

interface AdminState {
  dashboardData: AdminDashboardData | null
  isLoading: boolean
  setDashboardData: (data: AdminDashboardData) => void
  setLoading: (loading: boolean) => void
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboardData: null,
  isLoading: false,
  setDashboardData: (data) => set({ dashboardData: data }),
  setLoading: (loading) => set({ isLoading: loading })
}))
