export interface ShippingTracking {
  trackingNumber: string
  carrier: string
  status: 'pending' | 'shipped' | 'picked_up' | 'in_transit' | 'delivering' | 'delivered' | 'failed'
  events: Array<{ time: number; description: string }>
}