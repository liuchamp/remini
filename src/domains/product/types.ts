export interface ProductListState {
  products: Product[]
  page: number
  hasMore: boolean
  loading: boolean
}

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'newest' | 'distance'
