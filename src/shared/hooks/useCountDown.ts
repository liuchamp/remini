import { useState, useEffect, useRef } from 'react'

export function useCountDown(initialSeconds: number = 0) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRunning = seconds > 0

  useEffect(() => {
    if (seconds > 0) {
      timer.current = setInterval(() => setSeconds(s => s - 1), 1000)
    }
    return () => {
      if (timer.current) { clearInterval(timer.current); timer.current = null }
    }
  }, [seconds > 0])

  const start = (s: number) => setSeconds(s)
  const reset = () => { setSeconds(0); if (timer.current) { clearInterval(timer.current); timer.current = null } }

  return { seconds, isRunning, start, reset }
}
