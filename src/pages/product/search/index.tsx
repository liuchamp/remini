import Taro from '@tarojs/taro'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { productApi } from '@/domains/product/api'
import { HotSearches } from '@/shared/components/product/HotSearches'
import { FilterPanel, type FilterState } from '@/shared/components/product/FilterPanel'
import { Skeleton } from '@/shared/components/Skeleton'
import { RetryButton } from '@/shared/components/RetryButton'
import Empty from '@/shared/components/Empty'
import { useTranslation } from 'react-i18next'
import './index.scss'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10
const HOT_CACHE_MS = 5 * 60 * 1000

export default function Search() {
  const { t } = useTranslation(['common'])
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [hotSearches, setHotSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})
  const lastHotFetch = useRef<number>(0)

  const debouncedKeyword = useDebounce(keyword, 300)

  useEffect(() => {
    try {
      const history = Taro.getStorageSync(HISTORY_KEY)
      setSearchHistory(Array.isArray(history) ? history : [])
    } catch {
      setSearchHistory([])
    }
    fetchHotSearches()
  }, [fetchHotSearches])

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      fetchSuggest(debouncedKeyword.trim())
      performSearch(debouncedKeyword.trim(), filters)
    } else {
      setSuggestions([])
      setResults([])
      setHasSearched(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword])

  const fetchHotSearches = useCallback(async () => {
    if (Date.now() - lastHotFetch.current < HOT_CACHE_MS) return
    try {
      const res = await productApi.getHotSearches()
      if (res.code === 0) {
        setHotSearches((res.data as { keywords: string[] }).keywords || [])
        lastHotFetch.current = Date.now()
      }
    } catch { /* silent */ }
  }, [])

  const fetchSuggest = useCallback(async (kw: string) => {
    try {
      const res = await productApi.searchSuggest(kw)
      if (res.code === 0) {
        setSuggestions((res.data as { suggestions: string[] }).suggestions || [])
      }
    } catch { setSuggestions([]) }
  }, [])

  const saveToHistory = useCallback((kw: string) => {
    setSearchHistory(prev => {
      const updated = [kw, ...prev.filter((h) => h !== kw)].slice(0, MAX_HISTORY)
      try { Taro.setStorageSync(HISTORY_KEY, updated) } catch { /* */ }
      return updated
    })
  }, [])

  const performSearch = useCallback(async (kw: string, f: FilterState) => {
    setLoading(true)
    setHasSearched(true)
    setError(false)
    try {
      const res = await productApi.search({
        keyword: kw,
        page: 1,
        limit: 20,
        ...f
      })
      if (res.code === 0) {
        setResults((res.data as { products: Product[] }).products || [])
      }
    } catch {
      setResults([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback((kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) return
    saveToHistory(trimmed)
    setSuggestions([])
  }, [saveToHistory])

  const handleConfirm = useCallback((e: { detail: { value: string } }) => {
    handleSearch(e.detail.value)
  }, [handleSearch])

  const handleSelect = useCallback((kw: string) => {
    setKeyword(kw)
    handleSearch(kw)
  }, [handleSearch])

  const handleApplyFilter = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setFilterVisible(false)
    if (debouncedKeyword.trim()) {
      performSearch(debouncedKeyword.trim(), newFilters)
    }
  }, [debouncedKeyword, performSearch])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    try { Taro.setStorageSync(HISTORY_KEY, []) } catch { /* */ }
  }, [])

  const handleProductClick = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  }, [])

  return (
    <View className='search-page'>
      <View className='search-header'>
        <Input
          className='search-input'
          placeholder='搜索商品'
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleConfirm}
        />
        <View className='search-cancel' onClick={() => Taro.navigateBack()}>
          <Text>取消</Text>
        </View>
      </View>

      {!hasSearched && (
        <ScrollView scrollY className='search-suggestions-area'>
          <HotSearches keywords={hotSearches} onSelect={handleSelect} />
          {searchHistory.length > 0 && (
            <View className='search-history'>
              <View className='history-header'>
                <Text className='history-title'>历史记录</Text>
                <Text className='history-clear' onClick={clearHistory}>× 清空</Text>
              </View>
              <View className='history-chips'>
                {searchHistory.map((h) => (
                  <View key={h} className='history-chip' onClick={() => handleSelect(h)}>
                    <Text>{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {hasSearched && suggestions.length > 0 && (
        <View className='search-suggestions'>
          {suggestions.map((s) => (
            <View key={s} className='suggestion-item' onClick={() => handleSelect(s)}>
              <Text>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {hasSearched && (
        <View className='search-results'>
          <View className='results-toolbar'>
            <Text className='toolbar-text'>共 {results.length} 条结果</Text>
            <View className='toolbar-filter' onClick={() => setFilterVisible(true)}>
              <Text>筛选 ▼</Text>
            </View>
          </View>
          <ScrollView scrollY className='results-list'>
            {loading ? (
              <Skeleton type='list' rows={5} />
            ) : error ? (
              <RetryButton onRetry={() => performSearch(keyword, filters)} />
            ) : results.length === 0 ? (
              <Empty text={t('common:empty.search')} />
            ) : (
              results.map((p) => (
                <View key={p.id} className='result-item' onClick={() => handleProductClick(p.id)}>
                  <Text className='result-title'>{p.title}</Text>
                  <Text className='result-price'>¥{p.price}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      <FilterPanel
        visible={filterVisible}
        value={filters}
        onApply={handleApplyFilter}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  )
}
