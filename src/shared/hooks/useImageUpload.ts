import { useState, useCallback } from 'react'
import { PlatformAPI } from '@/shared/utils/platform'

interface UseImageUploadOptions {
  maxCount?: number
  quality?: number
}

export function useImageUpload({ maxCount = 9, quality: _quality = 80 }: UseImageUploadOptions = {}) {
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const addImages = useCallback(async () => {
    const remaining = maxCount - images.length
    if (remaining <= 0) return

    setUploading(true)
    try {
      const res = await PlatformAPI.chooseMedia({
        count: remaining,
        sourceType: ['album', 'camera'],
        mediaType: ['image']
      })

      const newImages = res.tempFiles.map(f => f.path)
      setImages(prev => [...prev, ...newImages].slice(0, maxCount))
    } finally {
      setUploading(false)
    }
  }, [images.length, maxCount])

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearImages = useCallback(() => setImages([]), [])

  return { images, setImages, uploading, addImages, removeImage, clearImages }
}
