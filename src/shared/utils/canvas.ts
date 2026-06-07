import Taro from '@tarojs/taro'

export async function loadImage(url: string): Promise<string> {
  try {
    const res = await Taro.getImageInfo({ src: url })
    return res.path
  } catch (err) {
    console.error('Failed to load image:', url, err)
    throw err
  }
}

export function getCanvasContext(canvasId: string): Taro.CanvasContext {
  return Taro.createCanvasContext(canvasId)
}

export async function canvasToTempFile(canvasId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      canvasId,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err)
    })
  })
}

export async function saveToAlbum(tempPath: string): Promise<void> {
  const setting = await Taro.getSetting()
  if (!setting.authSetting['scope.writePhotosAlbum']) {
    await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
  }
  await Taro.saveImageToPhotosAlbum({ filePath: tempPath })
}

export async function generateWxacode(path: string): Promise<string> {
  return '/static/qrcode-placeholder.png'
}
