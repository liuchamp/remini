import Taro from '@tarojs/taro'

interface NotificationData {
  [key: string]: string
}

export const SubscribeService = {
  requestPermission: async (templateIds: string[]): Promise<Record<string, string> | null> => {
    try {
      const res = await Taro.requestSubscribeMessage({
        tmplIds: templateIds
      })
      return res as Record<string, string>
    } catch (err) {
      console.error('订阅消息权限请求失败:', err)
      return null
    }
  },

  sendNotification: async (userId: string, templateId: string, data: NotificationData) => {
    console.log('发送订阅消息:', { userId, templateId, data })
  }
}
