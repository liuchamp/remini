import { Component, PropsWithChildren } from 'react'
import { View, Text, Button } from '@tarojs/components'
import './index.scss'

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
        <View className='error-boundary'>
          <Text className='error-icon'>⚠️</Text>
          <Text className='error-title'>{this.props.title || '页面出错了'}</Text>
          <Text className='error-message'>
            {this.props.message || this.state.error?.message || '未知错误'}
          </Text>
          <Button className='error-retry-btn' onClick={this.handleRetry}>
            重试
          </Button>
        </View>
      )
    }
    return this.props.children
  }
}
