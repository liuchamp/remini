export interface ShippingTracking {
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered';
  events: Array<{ time: number; description: string }>;
}