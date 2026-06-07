import { Component, PropsWithChildren } from 'react'
import { View, Text, Button } from '@tarojs/components'

interface Props extends PropsWithChildren<{}> {
  title?: string
  message?: string
}

interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', textAlign: 'center', minHeight: '400px' }}>
          <Text style={{ fontSize: '80px', marginBottom: '12px' }}>⚠️</Text>
          <Text style={{ fontSize: '32px', color: '#2D3436', marginBottom: '8px', fontWeight: '600' }}>
            {this.props.title || '页面出错了'}
          </Text>
          <Text style={{ fontSize: '28px', color: '#636E72', marginBottom: '16px', lineHeight: '1.5', wordBreak: 'break-all' }}>
            {this.props.message || this.state.error?.message || '未知错误'}
          </Text>
          <Button
            onClick={this.handleRetry}
            style={{ padding: '16px 48px', background: '#FF6B35', color: '#fff', borderRadius: '8px', fontSize: '28px', border: 'none' }}
          >
            重试
          </Button>
        </View>
      )
    }
    return this.props.children
  }
}
