import Taro from '@tarojs/taro'

type WSMessageHandler = (data: any) => void
type WSState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'polling'

class WebSocketManager {
  private task: Taro.SocketTask | null = null
  private url = ''
  private token = ''
  private state: WSState = 'disconnected'
  private handlers = new Map<string, WSMessageHandler[]>()
  private reconnectCount = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private messageQueue: any[] = []
  private maxReconnect = 5
  private baseDelay = 1000

  connect(url: string, token: string) {
    this.url = url
    this.token = token
    if (this.state === 'connected') return
    this.state = 'connecting'
    
    try {
      this.task = Taro.connectSocket({ url: `${url}?token=${token}` })
    } catch (err) {
      this.scheduleReconnect()
      return
    }

    this.task.onOpen(() => {
      this.state = 'connected'
      this.reconnectCount = 0
      this.startHeartbeat()
      this.flushQueue()
      this.stopPolling()
      this.emit('_connected', null)
    })

    this.task.onMessage((res) => {
      try {
        const data = JSON.parse(res.data as string)
        this.emit(data.type, data.payload || data)
      } catch {
        // ignore parse errors for non-JSON messages
      }
    })

    this.task.onClose(() => {
      this.state = 'disconnected'
      this.stopHeartbeat()
      this.scheduleReconnect()
    })

    this.task.onError(() => {
      this.scheduleReconnect()
    })
  }

  private scheduleReconnect() {
    if (this.reconnectCount >= this.maxReconnect) {
      this.startPolling()
      return
    }
    const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectCount), 30000)
    this.state = 'reconnecting'
    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      this.connect(this.url, this.token)
    }, delay)
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' })
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private startPolling() {
    this.state = 'polling'
    this.pollTimer = setInterval(async () => {
      try {
        const res = await Taro.request({
          url: `${this.url.replace('ws', 'http')}/poll`,
          header: { Authorization: `Bearer ${this.token}` }
        })
        if (res.data?.events) {
          res.data.events.forEach((ev: any) => this.emit(ev.type, ev.payload))
        }
      } catch {
        // poll failed silently
      }
    }, 15000)
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  private flushQueue() {
    while (this.messageQueue.length > 0) {
      this.send(this.messageQueue.shift())
    }
  }

  send(data: any) {
    if (this.state !== 'connected' || !this.task) {
      this.messageQueue.push(data)
      return
    }
    try {
      this.task.send({ data: JSON.stringify(data) })
    } catch {
      this.messageQueue.push(data)
    }
  }

  on(event: string, handler: WSMessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
    }
    this.handlers.get(event)!.push(handler)
  }

  off(event: string) {
    this.handlers.delete(event)
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach(h => { try { h(data) } catch {} })
    }
  }

  disconnect() {
    this.stopHeartbeat()
    this.stopPolling()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.task) {
      try { this.task.close() } catch {}
      this.task = null
    }
    this.state = 'disconnected'
    this.handlers.clear()
  }

  getState(): WSState {
    return this.state
  }
}

export const wsManager = new WebSocketManager()
export type { WSState }
