export interface CheckinData {
  checkinDays: number[]
  continuousDays: number
  todayChecked: boolean
  rewards: {
    base: number
    continuous: number
  }
}

export interface CheckinResult {
  points: number
  continuousDays: number
  rewards: {
    base: number
    continuous: number
  }
}

export interface PointsData {
  totalPoints: number
  todayEarned: number
  monthEarned: number
}

export interface PointsRecord {
  id: string
  title: string
  points: number
  category: 'checkin' | 'order' | 'invite' | 'exchange' | 'other'
  createdAt: string
}

export interface Coupon {
  id: string
  title: string
  type: '满减' | '折扣' | '无门槛'
  value: number
  minSpend: number
  startTime: string
  endTime: string
  status: 'active' | 'used' | 'expired'
  usedAt?: string
  applicableProducts?: string[]
}
