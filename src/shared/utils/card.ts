import Taro from '@tarojs/taro'

interface CardInfo {
  cardId: string
  cardExt: string
}

export const CardService = {
  /** 添加卡到卡包 */
  addCard: async (cardInfo: CardInfo): Promise<boolean> => {
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
