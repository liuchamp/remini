import Taro from '@tarojs/taro'
import { View, Text, Canvas, Button, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { http } from '@/shared/api/request'
import {
  loadImage,
  getCanvasContext,
  canvasToTempFile,
  saveToAlbum
} from '@/shared/utils/canvas'
import type { PosterGeneratorProps } from './types'
import './index.scss'

const CANVAS_WIDTH = 375
const CANVAS_HEIGHT = 600

export function PosterGenerator({ type, visible, data, onClose }: PosterGeneratorProps) {
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'ready' | 'error'>('idle')
  const [imagePath, setImagePath] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (visible && phase === 'idle') {
      drawPoster()
    }
  }, [visible])

  const drawPoster = async () => {
    setPhase('drawing')
    try {
      const ctx = getCanvasContext('posterCanvas')
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (type === 'product') {
        await drawProduct(ctx, data)
      } else if (type === 'post') {
        await drawPost(ctx, data)
      } else if (type === 'invite') {
        await drawInvite(ctx, data)
      }

      ctx.draw()
      await new Promise(r => setTimeout(r, 500))
      const path = await canvasToTempFile('posterCanvas')
      setImagePath(path)
      setPhase('ready')
    } catch (err) {
      console.error('Canvas draw failed:', err)
      Taro.showToast({ title: '海报生成失败，正在尝试服务端方案', icon: 'none' })
      await fallbackToServer()
    }
  }

  const drawProduct = async (ctx: any, product: any) => {
    if (product.coverImage) {
      const imgPath = await loadImage(product.coverImage)
      ctx.drawImage(imgPath, 20, 20, CANVAS_WIDTH - 40, 240)
    }
    ctx.setFontSize(20)
    ctx.setFillStyle('#333')
    ctx.fillText(product.title || '', 20, 290)
    ctx.setFontSize(28)
    ctx.setFillStyle('#ee0a24')
    ctx.fillText(`¥${product.price || 0}`, 20, 330)
    ctx.setFontSize(14)
    ctx.setFillStyle('#999')
    ctx.fillText('REMX 二手市场', 20, CANVAS_HEIGHT - 30)
  }

  const drawPost = async (ctx: any, post: any) => {
    ctx.setFontSize(18)
    ctx.setFillStyle('#333')
    ctx.fillText(post.authorName || '用户', 20, 40)
    ctx.setFontSize(16)
    ctx.setFillStyle('#666')
    const content = (post.content || '').slice(0, 80)
    ctx.fillText(content, 20, 80, CANVAS_WIDTH - 40)
    if (post.coverImage) {
      const imgPath = await loadImage(post.coverImage)
      ctx.drawImage(imgPath, 20, 140, CANVAS_WIDTH - 40, 200)
    }
  }

  const drawInvite = async (ctx: any, invite: any) => {
    ctx.setFillStyle('#1989fa')
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.setFontSize(32)
    ctx.setFillStyle('#fff')
    ctx.fillText('加入 REMX', 80, 200)
    ctx.setFontSize(20)
    ctx.fillText('邀请码: ' + (invite.code || ''), 80, 240)
  }

  const fallbackToServer = async () => {
    try {
      const res = await http.get<string>('/poster/generate')
      if (res.code === 0) {
        setImagePath(res.data)
        setPhase('ready')
        Taro.previewImage({ urls: [res.data] })
      } else {
        throw new Error('Server poster generate failed')
      }
    } catch (err) {
      Taro.showToast({ title: '海报生成失败', icon: 'none' })
      setErrorMsg('海报生成失败')
      setPhase('error')
    }
  }

  const handleSave = async () => {
    if (!imagePath) return
    try {
      await saveToAlbum(imagePath)
      Taro.showToast({ title: '已保存到相册', icon: 'success' })
      onClose()
    } catch (err) {
      Taro.showToast({ title: '保存失败，请检查权限', icon: 'none' })
    }
  }

  if (!visible) return null

  return (
    <View className='poster-mask' onClick={onClose}>
      <View className='poster-content' onClick={(e) => e.stopPropagation()}>
        <View className='poster-header'>
          <Text className='poster-title'>分享海报</Text>
          <Text className='poster-close' onClick={onClose}>×</Text>
        </View>

        {phase === 'drawing' && (
          <View className='poster-loading'>
            <Text>生成中...</Text>
          </View>
        )}

        {phase === 'ready' && imagePath && (
          <View className='poster-preview'>
            <Image src={imagePath} className='poster-image' mode='widthFix' />
            <Button className='poster-save-btn' onClick={handleSave}>
              保存到相册
            </Button>
          </View>
        )}

        {phase === 'error' && (
          <View className='poster-error'>
            <Text>{errorMsg}</Text>
            <Button onClick={drawPoster}>重试</Button>
          </View>
        )}

        <Canvas
          canvasId='posterCanvas'
          className='poster-canvas'
          style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, position: 'absolute', left: '-9999px' }}
        />
      </View>
    </View>
  )
}

export default PosterGenerator
