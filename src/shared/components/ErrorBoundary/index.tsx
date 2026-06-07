import { Component, PropsWithChildren } from 'react'
import { View, Text, Button } from '@tarojs/components'

interface Props extends PropsWithChildren<{}> {}
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
        <View style={{ padding: '40px', textAlign: 'center' }}>
          <Text style={{ fontSize: '16px', color: '#666' }}>出错了</Text>
          <Text style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
            {this.state.error?.message || '未知错误'}
          </Text>
          <Button
            onClick={this.handleRetry}
            style={{ marginTop: '16px', background: '#FF6B35', color: '#fff' }}
          >
            重试
          </Button>
        </View>
      )
    }
    return this.props.children
  }
}
