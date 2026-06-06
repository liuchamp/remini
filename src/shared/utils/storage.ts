import Taro from '@tarojs/taro'

const PREFIX = '@remx/'

export function get<T>(key: string): T | null {
  try {
    const raw = Taro.getStorageSync(`${PREFIX}${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function set(key: string, value: any): void {
  Taro.setStorageSync(`${PREFIX}${key}`, JSON.stringify(value))
}

export function remove(key: string): void {
  Taro.removeStorageSync(`${PREFIX}${key}`)
}

export function clear(): void {
  const all = Taro.getStorageInfoSync().keys
  all.filter(k => k.startsWith(PREFIX)).forEach(k => Taro.removeStorageSync(k))
}

export function getWithTTL<T>(key: string, maxAge: number): T | null {
  const data = get<{ value: T; timestamp: number }>(key)
  if (!data) return null
  if (Date.now() - data.timestamp > maxAge) {
    remove(key)
    return null
  }
  return data.value
}

export function setWithTTL(key: string, value: any): void {
  set(key, { value, timestamp: Date.now() })
}
