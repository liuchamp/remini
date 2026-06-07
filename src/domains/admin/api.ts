import { http } from '@/shared/api/request'

export const adminApi = {
  getDashboard() { return http.get('/admin/dashboard') },
  getUsers(params?: any) { return http.get('/admin/users', params) },
  banUser(id: string) { return http.post(`/admin/users/${id}/ban`) },
  unbanUser(id: string) { return http.post(`/admin/users/${id}/unban`) },
  getPendingProducts(page?: number) { return http.get('/admin/products/pending', { page }) },
  approveProduct(id: string) { return http.post(`/admin/products/${id}/approve`) },
  rejectProduct(id: string, reason?: string) { return http.post(`/admin/products/${id}/reject`, { reason }) },
  getWithdrawals(page?: number) { return http.get('/admin/withdrawals', { page }) },
  approveWithdrawal(id: string) { return http.post(`/admin/withdrawals/${id}/approve`) },
  rejectWithdrawal(id: string) { return http.post(`/admin/withdrawals/${id}/reject`) },
  getDisputes(page?: number) { return http.get('/admin/disputes', { page }) },
  resolveDispute(id: string, decision: 'buyer' | 'seller') { return http.post(`/admin/disputes/${id}/resolve`, { decision }) }
}
