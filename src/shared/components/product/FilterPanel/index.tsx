import { View, Text, Switch, Slider, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './index.scss'

export interface FilterState {
  categoryId?: string
  priceMin?: number
  priceMax?: number
  condition?: 'new' | 'like-new' | 'good' | 'fair'
  negotiableOnly?: boolean
  sort?: 'default' | 'price_asc' | 'price_desc' | 'newest' | 'distance'
}

interface Props {
  visible: boolean
  value: FilterState
  onApply: (filters: FilterState) => void
  onClose: () => void
}

const CONDITIONS = [
  { value: 'new', label: '全新' },
  { value: 'like-new', label: '9 成新' },
  { value: 'good', label: '8 成新' },
  { value: 'fair', label: '7 成新' }
]

const SORTS = [
  { value: 'default', label: '综合' },
  { value: 'price_asc', label: '价格 ↑' },
  { value: 'price_desc', label: '价格 ↓' },
  { value: 'newest', label: '最新' },
  { value: 'distance', label: '距离最近' }
]

export function FilterPanel({ visible, value, onApply, onClose }: Props) {
  const [local, setLocal] = useState<FilterState>(value)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    value.priceMin || 0,
    value.priceMax || 10000
  ])

  useEffect(() => {
    setLocal(value)
    setPriceRange([value.priceMin || 0, value.priceMax || 10000])
  }, [value])

  if (!visible) return null

  const handleApply = () => {
    onApply({
      ...local,
      priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
      priceMax: priceRange[1] < 10000 ? priceRange[1] : undefined
    })
  }

  return (
    <View className='filter-panel-mask' onClick={onClose}>
      <View className='filter-panel' onClick={(e) => e.stopPropagation()}>
        <View className='filter-header'>
          <Text className='filter-title'>筛选</Text>
        </View>

        <View className='filter-section'>
          <Text className='filter-label'>价格区间</Text>
          <View className='filter-price-row'>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={priceRange[0]}
              onChange={(e) => setPriceRange([e.detail.value, priceRange[1]])}
            />
            <Slider
              min={0}
              max={10000}
              step={100}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], e.detail.value])}
            />
          </View>
          <Text className='filter-hint'>¥{priceRange[0]} - ¥{priceRange[1]}</Text>
        </View>

        <View className='filter-section'>
          <Text className='filter-label'>成色</Text>
          <View className='filter-options'>
            {CONDITIONS.map((c) => (
              <View
                key={c.value}
                className={`filter-chip ${local.condition === c.value ? 'active' : ''}`}
                onClick={() => setLocal({ ...local, condition: c.value as FilterState['condition'] })}
              >
                <Text>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-section'>
          <Text className='filter-label'>排序</Text>
          <View className='filter-options'>
            {SORTS.map((s) => (
              <View
                key={s.value}
                className={`filter-chip ${local.sort === s.value ? 'active' : ''}`}
                onClick={() => setLocal({ ...local, sort: s.value as FilterState['sort'] })}
              >
                <Text>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-section row'>
          <Text className='filter-label'>仅显示可议价</Text>
          <Switch
            checked={local.negotiableOnly || false}
            onChange={(e) => setLocal({ ...local, negotiableOnly: e.detail.value })}
          />
        </View>

        <View className='filter-footer'>
          <Button
            className='btn-reset'
            onClick={() => {
              setLocal({})
              setPriceRange([0, 10000])
            }}
          >重置</Button>
          <Button className='btn-apply' onClick={handleApply}>应用</Button>
        </View>
      </View>
    </View>
  )
}

export default FilterPanel
