import Taro from '@tarojs/taro'

export const CardService = {
  addCard: async (cardInfo: {
    cardId: string
    cardExt: string
  }) => {
    try {
      await Taro.addCard({
        cardList: [{
          cardId: cardInfo.cardId,
          cardExt: cardInfo.cardExt
        }]
      })
      return true
    } catch (err) {
      console.error('添加卡失败:', err)
      return false
    }
  }
}
