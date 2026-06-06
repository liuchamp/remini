import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { productApi } from '@/domains/product/api'
import './index.scss'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const debouncedKeyword = useDebounce(keyword, 500)

  useEffect(() => {
    try {
      const history = Taro.getStorageSync(HISTORY_KEY)
      setSearchHistory(Array.isArray(history) ? history : [])
    } catch {
      setSearchHistory([])
    }
  }, [])

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      performSearch(debouncedKeyword.trim())
    } else {
      setResults([])
      setHasSearched(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword])

  const saveToHistory = (kw: string) => {
    const updated = [kw, ...searchHistory.filter((h) => h !== kw)].slice(
      0,
      MAX_HISTORY
    )
    setSearchHistory(updated)
    try {
      Taro.setStorageSync(HISTORY_KEY, updated)
    } catch {
      // storage full or unavailable
    }
  }

  const performSearch = async (kw: string) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await productApi.search({ keyword: kw, page: 1, limit: 20 })
      if (res.code === 0) {
        setResults(res.data.products)
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) return
    saveToHistory(trimmed)
    performSearch(trimmed)
  }

  const handleConfirm = (e: { detail: { value: string } }) => {
    handleSearch(e.detail.value)
  }

  const handleHistoryTagClick = (kw: string) => {
    setKeyword(kw)
    handleSearch(kw)
  }

  const clearHistory = () => {
    setSearchHistory([])
    try {
      Taro.setStorageSync(HISTORY_KEY, [])
    } catch {
      /* empty */
    }
  }

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <Input
          className='search-input'
          type='text'
          placeholder='搜索商品'
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleConfirm}
          focus
          confirmType='search'
        />
        <Text
          className='search-cancel'
          onClick={() => Taro.navigateBack()}
        >
          取消
        </Text>
      </View>

      {!hasSearched && searchHistory.length > 0 && (
        <View className='search-history'>
          <View className='history-header'>
            <Text className='history-title'>搜索历史</Text>
            <Text className='history-clear' onClick={clearHistory}>
              清除
            </Text>
          </View>
          <View className='history-tags'>
            {searchHistory.map((item) => (
              <Text
                key={item}
                className='history-tag'
                onClick={() => handleHistoryTagClick(item)}
              >
                {item}
              </Text>
            ))}
          </View>
        </View>
      )}

      {hasSearched && (
        <ScrollView className='search-results' scrollY>
          {loading ? (
            <View className='status-text'>加载中...</View>
          ) : results.length > 0 ? (
            <View className='product-grid'>
              {results.map((product) => (
                <View
                  key={product.id}
                  className='product-card'
                  onClick={() => handleProductClick(product.id)}
                >
                  <Image
                    src={product.images?.[0] || ''}
                    className='product-image'
                    mode='aspectFill'
                    lazyLoad
                  />
                  <View className='product-info'>
                    <Text className='product-title'>{product.title}</Text>
                    <View className='product-price-row'>
                      <Text className='product-price'>
                        ¥{product.price}
                      </Text>
                      {product.isNegotiable && (
                        <Text className='negotiable-tag'>可议价</Text>
                      )}
                    </View>
                    {product.distance != null && (
                      <Text className='product-distance'>
                        {product.distance < 1
                          ? `${Math.round(product.distance * 1000)}m`
                          : `${product.distance.toFixed(1)}km`}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className='status-text'>暂无搜索结果</View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
