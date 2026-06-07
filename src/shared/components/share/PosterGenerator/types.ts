export type PosterType = 'product' | 'post' | 'invite'

export interface PosterData {
  id?: string
  title?: string
  price?: number
  coverImage?: string
  content?: string
  authorName?: string
  code?: string
  [key: string]: any
}

export interface PosterGeneratorProps {
  type: PosterType
  visible: boolean
  data: PosterData
  onClose: () => void
}
