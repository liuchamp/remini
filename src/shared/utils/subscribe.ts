import Taro from '@tarojs/taro'

export const SubscribeService = {
  requestPermission: async (templateIds: string[]) => {
    try {
      const res = await Taro.requestSubscribeMessage({
        entityIds: templateIds
      })
      return res
    } catch (err) {
      console.error('订阅消息权限请求失败:', err)
      return null
    }
  },

  sendNotification: async (userId: string, templateId: string, data: any) => {
    console.log('发送订阅消息:', { userId, templateId, data })
  }
}
