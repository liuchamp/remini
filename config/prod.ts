import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {
    optimizeMainPackage: {
      enable: true
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[chunkhash].css'
    },
    esnextModules: ['@nutui/nutui-react-taro'],
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[chunkhash].js'
    },
    router: {
      mode: 'browser'
    }
  }
} satisfies UserConfigExport<'vite'>
