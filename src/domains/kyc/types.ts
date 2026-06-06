import type { KycStatus } from './api'
export type { KycStatus }

export type KycTier = 'L0' | 'L1' | 'L2' | 'L3'

export interface KycTierConfig {
  level: KycTier
  label: string
  desc: string
  color: string
}
