import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import './MediaUploader.scss'

const UPLOAD_URL = 'https://api.remx.com/upload'

interface UploadingFile {
  localPath: string
  progress: number
  status: 'uploading' | 'done' | 'error'
  remoteUrl?: string
}

interface MediaUploaderProps {
  maxCount?: number
  images: string[]
  onChange: (urls: string[]) => void
}

export default function MediaUploader({ maxCount = 9, images, onChange }: MediaUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const uploadFile = useCallback(async (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const task = Taro.uploadFile({
        url: UPLOAD_URL,
        filePath,
        name: 'file',
        formData: { type: 'product' },
        success: (res) => {
            try {
              const data = JSON.parse(res.data)
              resolve(data.data?.url || data.url || filePath)
            } catch {
              resolve(`https://api.remx.com/files/${Date.now()}`)
          }
        },
        fail: () => {
          reject(new Error('Upload failed'))
        }
      })

      task.progress((res) => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.localPath === filePath ? { ...f, progress: res.progress } : f
          )
        )
      })
    })
  }, [])

  const handleChooseMedia = useCallback(async () => {
    const remaining = maxCount - images.length - uploadingFiles.length
    if (remaining <= 0) return

    try {
      const res = await Taro.chooseMedia({
        count: remaining,
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
        mediaType: ['image']
      })

      const newFiles: UploadingFile[] = res.tempFiles.map((f) => ({
        localPath: f.tempFilePath,
        progress: 0,
        status: 'uploading' as const
      }))

      setUploadingFiles((prev) => [...prev, ...newFiles])

      const uploadedUrls: string[] = []
      for (const file of newFiles) {
        try {
          const url = await uploadFile(file.localPath)
          uploadedUrls.push(url)
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.localPath === file.localPath
                ? { ...f, status: 'done', remoteUrl: url, progress: 100 }
                : f
            )
          )
        } catch {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.localPath === file.localPath
                ? { ...f, status: 'error' }
                : f
            )
          )
        }
      }

      onChange([...images, ...uploadedUrls])
    } catch {
      /* silent */
    }
  }, [maxCount, images, uploadingFiles.length, uploadFile, onChange])

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    },
    [images, onChange]
  )

  const handleRemoveUploading = useCallback(
    (localPath: string) => {
      setUploadingFiles((prev) => prev.filter((f) => f.localPath !== localPath))
    },
    []
  )

  const totalCount = images.length + uploadingFiles.length
  const canAddMore = totalCount < maxCount

  return (
    <View className='media-uploader'>
      <View className='uploader-grid'>
        {images.map((url, index) => (
          <View key={url} className='uploader-item'>
            <Image className='uploader-image' src={url} mode='aspectFill' />
            <View
              className='remove-btn'
              onClick={() => handleRemove(index)}
            >
              <Text className='remove-icon'>×</Text>
            </View>
          </View>
        ))}

        {uploadingFiles.map((file) => (
          <View key={file.localPath} className='uploader-item'>
            <Image className='uploader-image' src={file.localPath} mode='aspectFill' />
            <View className='upload-overlay'>
              {file.status === 'uploading' && (
                <View className='progress-ring'>
                  <Text className='progress-text'>{file.progress}%</Text>
                </View>
              )}
              {file.status === 'error' && (
                <View className='error-overlay'>
                  <Text className='error-text'>上传失败</Text>
                </View>
              )}
            </View>
            {file.status === 'error' && (
              <View
                className='remove-btn'
                onClick={() => handleRemoveUploading(file.localPath)}
              >
                <Text className='remove-icon'>×</Text>
              </View>
            )}
          </View>
        ))}

        {canAddMore && (
          <View className='uploader-item add-btn' onClick={handleChooseMedia}>
            <Text className='add-icon'>+</Text>
            <Text className='add-text'>
              {totalCount}/{maxCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
