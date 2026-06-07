import { useState, useCallback } from 'react'
import { PlatformAPI } from '@/shared/utils/platform'

interface LocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
  error: string | null
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null
  })

  const getLocation = useCallback(async () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }))
    try {
      const { latitude, longitude } = await PlatformAPI.getLocation()
      setLocation({ latitude, longitude, loading: false, error: null })
      return { latitude, longitude }
    } catch (err: any) {
      setLocation(prev => ({ ...prev, loading: false, error: err.message }))
      return null
    }
  }, [])

  return { ...location, getLocation }
}
