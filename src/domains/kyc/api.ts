import { http } from '@/shared/api/request'

export interface KycStatus {
  currentTier: 'L0' | 'L1' | 'L2' | 'L3'
  phoneVerified: boolean
  identityVerified: boolean
  livenessVerified: boolean
  nextStep: 'phone' | 'identity' | 'liveness' | null
}

export interface IdentityOcrResult {
  name: string
  idNumber: string
  issueDate?: string
  expiryDate?: string
}

export const kycApi = {
  getStatus() {
    return http.get<KycStatus>('/kyc/status')
  },
  sendPhoneCode(phone: string) {
    return http.post('/kyc/phone/send', { phone })
  },
  verifyPhone(phone: string, code: string) {
    return http.post<{ newTier: 'L1' }>('/kyc/phone/verify', { phone, code })
  },
  ocrIdCard(imageUrl: string, side: 'front' | 'back') {
    return http.post<IdentityOcrResult>('/kyc/identity/ocr', { imageUrl, side })
  },
  submitIdentity(data: { frontImageUrl: string; backImageUrl: string; name: string; idNumber: string }) {
    return http.post<{ verificationId: string }>('/kyc/identity/submit', data)
  },
  startLiveness() {
    return http.post<{ challengeId: string; challenges: string[] }>('/kyc/liveness/start')
  },
  submitLiveness(data: { challengeId: string; videoUrl: string; challenges: string[] }) {
    return http.post<{ newTier: 'L3' }>('/kyc/liveness/submit', data)
  }
}
