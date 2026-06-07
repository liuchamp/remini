import { useState, useCallback } from 'react'
import { View, Text, Button, Canvas, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { marketingApi, type ReferralInfo } from '@/domains/marketing/api'
import { useAuthStore } from '@/domains/auth/store'
import { PlatformAPI } from '@/shared/utils/platform'
import './index.scss'

export default function ReferralPage() {
  const [info, setInfo] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPoster, setShowPoster] = useState(false)
  const [posterPath, setPosterPath] = useState('')
  const { user } = useAuthStore()
  const { t } = useTranslation('marketing')

  useLoad(() => {
    loadReferralInfo()
  })

  const loadReferralInfo = async () => {
    try {
      const res = await marketingApi.getReferralInfo()
      if (res.code === 0) {
        setInfo(res.data)
      }
    } catch (err) {
      console.error('Failed to load referral info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = useCallback(() => {
    if (!info?.code) return
    PlatformAPI.setClipboardData(info.code)
    PlatformAPI.showToast(t('copied'))
  }, [info, t])

  const handleShareLink = useCallback(() => {
    if (!info?.link) return
    PlatformAPI.setClipboardData(info.link)
    PlatformAPI.showToast(t('copyLink'))
  }, [info, t])

  const drawPoster = useCallback(async () => {
    if (!info || !user) return

    PlatformAPI.showLoading(t('posterGenerating'))
    setShowPoster(true)

    try {
      const ctx = Taro.createCanvasContext('posterCanvas')
      const w = 600
      const h = 900

      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, '#FF6B35')
      gradient.addColorStop(0.5, '#FF8C5A')
      gradient.addColorStop(1, '#FFF0E0')
      ctx.setFillStyle(gradient)
      ctx.fillRect(0, 0, w, h)

      ctx.setFillStyle('#FFFFFF')
      ctx.setShadow(0, 4, 20, 'rgba(0,0,0,0.08)')
      roundRect(ctx, 40, 160, 520, 680, 20)
      ctx.fill()
      ctx.setShadow(0, 0, 0, 'transparent')

      ctx.save()
      ctx.beginPath()
      ctx.arc(300, 120, 44, 0, 2 * Math.PI)
      ctx.setFillStyle('#fff')
      ctx.fill()
      ctx.setStrokeStyle('#fff')
      ctx.setLineWidth(3)
      ctx.stroke()
      ctx.clip()
      if (user.avatar) {
        ctx.drawImage(user.avatar, 256, 76, 88, 88)
      }
      ctx.restore()

      ctx.setFillStyle('#FFFFFF')
      ctx.setFontSize(36)
      ctx.setTextAlign('center')
      ctx.fillText('RE Marketplace', 300, 240)
      ctx.setFontSize(24)
      ctx.setFillStyle('rgba(255,255,255,0.85)')
      ctx.fillText('二手好物，尽在 REMX', 300, 275)

      ctx.setFillStyle('#333333')
      ctx.setFontSize(32)
      ctx.fillText(user.username, 300, 220)

      ctx.setFontSize(24)
      ctx.setFillStyle('#666666')
      ctx.fillText(t('myInviteCode'), 300, 400)

      ctx.setFontSize(48)
      ctx.setFillStyle('#FF6B35')
      ctx.fillText(info.code, 300, 460)

      ctx.setStrokeStyle('#FF6B35')
      ctx.setLineWidth(2)
      ctx.setLineDash([8, 4], 0)
      roundRect(ctx, 150, 430, 300, 55, 8)
      ctx.stroke()
      ctx.setLineDash([], 0)

      ctx.setFontSize(22)
      ctx.setFillStyle('#999999')
      ctx.fillText('邀请好友注册并完成首单', 300, 500)
      ctx.fillText('双方各得 100 积分 + 优惠券', 300, 528)

      const statY = 580
      ctx.setFontSize(20)
      ctx.setFillStyle('#999999')
      ctx.fillText(t('totalInvited'), 220, statY)
      ctx.fillText(t('totalRewards'), 380, statY)
      ctx.setFontSize(32)
      ctx.setFillStyle('#333333')
      ctx.fillText(String(info.totalReferrals), 220, statY + 36)
      ctx.fillText(String(info.totalRewards), 380, statY + 36)

      ctx.setStrokeStyle('#E5E5E5')
      ctx.setLineWidth(0.5)
      ctx.beginPath()
      ctx.moveTo(320, statY - 5)
      ctx.lineTo(320, statY + 42)
      ctx.stroke()

      ctx.setFontSize(18)
      ctx.setFillStyle('#BDBDBD')
      ctx.fillText(t('scanToDownload'), 300, 800)
      ctx.fillText(t('joinCommunity'), 300, 825)

      await ctx.draw()

      setTimeout(() => {
        Taro.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          success: (res) => {
            setPosterPath(res.tempFilePath)
            PlatformAPI.hideLoading()
          },
          fail: (err) => {
            console.error('Canvas export failed:', err)
            PlatformAPI.hideLoading()
            PlatformAPI.showToast(t('posterFailed'), 'error')
          }
        })
      }, 800)
    } catch (err) {
      console.error('Poster generation failed:', err)
      PlatformAPI.hideLoading()
      PlatformAPI.showToast(t('posterFailed'), 'error')
    }
  }, [info, user, t])

  const handleSavePoster = useCallback(() => {
    if (!posterPath) return
    Taro.saveImageToPhotosAlbum({
      filePath: posterPath,
      success: () => {
        Taro.showToast({ title: t('saveSuccess'), icon: 'success' })
      },
      fail: (err) => {
        if (err.errMsg?.includes('auth')) {
          Taro.showModal({
            title: t('common:app.confirm'),
            content: t('albumPermission'),
            success: (res) => {
              if (res.confirm) {
                Taro.openSetting()
              }
            }
          })
        } else {
          Taro.showToast({ title: t('saveFailed'), icon: 'none' })
        }
      }
    })
  }, [posterPath, t])

  const handleSharePoster = useCallback(() => {
    if (!posterPath) return
    Taro.showShareImageMenu({
      path: posterPath,
      fail: () => {
        Taro.showToast({ title: t('shareFailed'), icon: 'none' })
      }
    })
  }, [posterPath, t])

  const roundRect = (ctx: any, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  if (loading) {
    return (
      <View className='referral-page'>
        <View className='loading-state'>
          <Text>{t('common:app.loading')}</Text>
        </View>
      </View>
    )
  }

  if (showPoster) {
    return (
      <View className='poster-preview-page'>
        <View className='poster-overlay' onClick={() => setShowPoster(false)} />
        <View className='poster-container'>
          {posterPath ? (
            <Image
              className='poster-image'
              src={posterPath}
              mode='widthFix'
            />
          ) : (
            <Canvas
              className='poster-canvas'
              canvasId='posterCanvas'
              style={{ width: '300px', height: '450px' }}
            />
          )}
          <View className='poster-actions'>
            <Button className='poster-btn save' onClick={handleSavePoster}>
              {t('saveToAlbum')}
            </Button>
            <Button className='poster-btn share' onClick={handleSharePoster}>
              {t('shareToFriend')}
            </Button>
            <Button className='poster-btn cancel' onClick={() => setShowPoster(false)}>
              {t('close')}
            </Button>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='referral-page'>
      <View className='referral-header'>
        <Text className='header-icon'>🎁</Text>
        <Text className='header-title'>{t('referral')}</Text>
        <Text className='header-desc'>{t('referralDesc')}</Text>
      </View>

      <View className='invite-code-section'>
        <Text className='code-label'>{t('myInviteCode')}</Text>
        <View className='code-box'>
          <Text className='code-value'>{info?.code ?? '--'}</Text>
          <View className='code-action' onClick={handleCopyCode}>
            <Text className='code-action-text'>{t('copy')}</Text>
          </View>
        </View>
        <View className='link-box' onClick={handleShareLink}>
          <Text className='link-label'>{t('inviteLink')}{info?.link ?? ''}</Text>
          <Text className='link-copy'>{t('copy')}</Text>
        </View>
      </View>

      <View className='stats-section'>
        <View className='stat-card'>
          <Text className='stat-num'>{info?.totalReferrals ?? 0}</Text>
          <Text className='stat-label'>{t('totalInvited')}</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-card'>
          <Text className='stat-num'>{info?.totalRewards ?? 0}</Text>
          <Text className='stat-label'>{t('totalRewards')}</Text>
        </View>
      </View>

      <View className='poster-section'>
        <View className='poster-generate-btn' onClick={drawPoster}>
          <Text className='poster-btn-icon'>🖼️</Text>
          <Text className='poster-btn-text'>{t('generatePoster')}</Text>
        </View>
      </View>

      {info && info.leaderboard && info.leaderboard.length > 0 && (
        <View className='leaderboard-section'>
          <Text className='section-title'>🏆 {t('leaderboard')}</Text>
          <View className='leaderboard-list'>
            {info.leaderboard.map((entry, idx) => (
              <View key={idx} className='leaderboard-item'>
                <Text className={`lb-rank rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </Text>
                <Image className='lb-avatar' src={entry.avatar} mode='aspectFill' />
                <Text className='lb-name'>{entry.name}</Text>
                <Text className='lb-count'>{entry.referrals} 人</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
