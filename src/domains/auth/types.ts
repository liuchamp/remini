import type { ReactNode } from 'react'

export interface LoginFormData {
  phone: string
  code: string
}

export interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
  phone: string
  code: string
  referralCode?: string
}

export interface AuthGuardProps {
  children: ReactNode
  required?: boolean
  requiredKycTier?: 'L1' | 'L2' | 'L3'
  fallback?: ReactNode
}
