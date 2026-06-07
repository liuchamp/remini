/** API response envelope */
interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

/** Paginated list response */
interface PaginatedList<T> {
  items: T[]
  total: number
  hasMore: boolean
  page: number
  limit: number
}

/** User */
interface User {
  id: string
  username: string
  avatar: string
  phone: string
  email?: string
  bio?: string
  trustScore: number
  currentKycTier: 'L0' | 'L1' | 'L2' | 'L3'
  isVerified: boolean
  role?: 'user' | 'admin'
  sellerLevel?: string
  createdAt: string
}

/** Product */
interface Product {
  id: string
  userId: string
  title: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  condition: string
  categoryId: string
  category?: Category
  location?: string
  latitude?: number
  longitude?: number
  distance?: number
  isNegotiable: boolean
  status: ProductStatus
  viewCount: number
  favoriteCount: number
  seller: UserBrief
  createdAt: string
  updatedAt: string
}

interface UserBrief {
  id: string
  username: string
  avatar: string
  trustScore: number
  productCount: number
  isVerified: boolean
  isCreator?: boolean
}

type ProductStatus = 'active' | 'locked' | 'sold' | 'paused' | 'flagged' | 'archived' | 'draft' | 'pending_review'

interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  icon?: string
  children?: Category[]
}

/** Order */
interface Order {
  id: string
  orderNo: string
  productId: string
  product: ProductBrief
  buyerId: string
  sellerId: string
  buyer: UserBrief
  seller: UserBrief
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: OrderStatus
  address?: Address
  shippingOrder?: ShippingOrder
  note?: string
  createdAt: string
  paidAt?: string
  shippedAt?: string
  deliveredAt?: string
  completedAt?: string
}

interface ProductBrief {
  id: string
  title: string
  image: string
  price: number
}

type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunding' | 'refunded' | 'disputed'

/** Offer */
interface Offer {
  id: string
  productId: string
  product: ProductBrief
  buyerId: string
  sellerId: string
  amount: number
  counterPrice?: number
  status: OfferStatus
  note?: string
  parentOfferId?: string
  orderId?: string
  createdAt: string
  expiresAt: string
}

type OfferStatus = 'pending' | 'countered' | 'accepted' | 'rejected' | 'withdrawn' | 'expired' | 'cancelled'

/** Shipping */
interface ShippingOrder {
  id: string
  orderId: string
  provider: LogisticsProvider
  trackingNo: string
  status: ShippingStatus
  tracks: ShippingTrack[]
}

interface LogisticsProvider {
  id: string
  name: string
  code: string
}

type ShippingStatus = 'pending' | 'shipped' | 'picked_up' | 'in_transit' | 'delivering' | 'delivered' | 'failed'

interface ShippingTrack {
  status: string
  location: string
  message: string
  createdAt: string
}

/** Address */
interface Address {
  id: string
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  tag?: string
  isDefault: boolean
}

/** Wallet */
interface EscrowBalance {
  heldBalance: number
  availableBalance: number
  withdrawnBalance: number
  totalEarned: number
}

interface TransactionRecord {
  id: string
  type: 'hold' | 'release' | 'refund' | 'withdraw'
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId?: string
  note: string
  createdAt: string
}

/** Community */
interface Post {
  id: string
  userId: string
  user: UserBrief
  content: string
  images: string[]
  shareType: 'normal' | 'product_share' | 'order_showcase' | 'commission'
  product?: ProductBrief
  circleId?: string
  likeCount: number
  commentCount: number
  viewCount: number
  isLiked: boolean
  createdAt: string
}

interface Comment {
  id: string
  user: UserBrief
  content: string
  likeCount: number
  isLiked: boolean
  parentId?: string
  replyTo?: UserBrief
  createdAt: string
}

interface Circle {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  postCount: number
  isPrivate: boolean
  isMember: boolean
}

/** Chat */
interface ChatThread {
  id: string
  participant: UserBrief
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  product?: ProductBrief
  isBlocked?: boolean
}

interface ChatMessage {
  id: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'product' | 'order' | 'system'
  isRead: boolean
  readAt?: string
  createdAt: string
  product?: ProductBrief
  order?: Order
}

/** Notification */
interface Notification {
  id: string
  type: 'system' | 'trade' | 'marketing' | 'negotiation'
  title: string
  content: string
  linkUrl?: string
  isRead: boolean
  createdAt: string
}

/** Coupon */
interface Coupon {
  id: string
  name: string
  type: 'fixed_discount' | 'percentage_discount' | 'free_shipping'
  value: number
  minAmount: number
  status: 'active' | 'used' | 'expired'
  validFrom: string
  validTo: string
  usedAt?: string
  orderId?: string
}

/** Points */
interface PointsAccount {
  balance: number
  totalEarned: number
  totalSpent: number
}

interface PointsTransaction {
  id: string
  type: 'earn' | 'redeem' | 'expire' | 'admin_adjust'
  amount: number
  source: string
  note: string
  createdAt: string
}

/** KYC */
interface KycStatus {
  currentTier: 'L0' | 'L1' | 'L2' | 'L3'
  phoneVerified: boolean
  identityVerified: boolean
  livenessVerified: boolean
  nextStep: 'phone' | 'identity' | 'liveness' | null
  pendingVerification?: {
    id: string
    status: 'pending' | 'approved' | 'rejected'
    submittedAt: string
  }
}

/** Referral */
interface ReferralCode {
  code: string
  link: string
  usedCount: number
  maxCount: number
  isActive: boolean
}

interface ReferralLeaderboardEntry {
  rank: number
  user: UserBrief
  inviteCount: number
  completedCount: number
}
