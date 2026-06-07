import { resolve } from 'path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'

import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'remx-marketplace',
    alias: {
      '@': resolve(__dirname, '..', 'src'),
    },
    date: '2026-6-6',
    designWidth: input => {
      if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
        return 375
      }
      return 750
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: process.env.TARO_ENV === 'ascf' ? 'ascf-project/ascf/ascf_src' : 'dist',
    plugins: [
      "@tarojs/plugin-generator"
    ],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'vite',
    mini: {
      optimizeMainPackage: {
        enable: true
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: true,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      css: {
        preprocessorOptions: {
          scss: {
            implementation: 'sass-embedded',
            api: 'modern-compiler',
            additionalData: `@use "src/styles" as *;`,
          },
        },
      },
      modifyViteConfig: (viteConfig) => {
        if (viteConfig.css?.preprocessorOptions?.scss) {
          viteConfig.css.preprocessorOptions.scss = {
            ...viteConfig.css.preprocessorOptions.scss,
            implementation: 'sass-embedded',
            api: 'modern-compiler',
            additionalData: `@use "src/styles" as *;`,
          }
        }
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: true,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      css: {
        preprocessorOptions: {
          scss: {
            implementation: 'sass-embedded',
            api: 'modern-compiler',
            additionalData: `@use "src/styles" as *;`,
          },
        },
      },
      modifyViteConfig: (viteConfig) => {
        if (viteConfig.css?.preprocessorOptions?.scss) {
          viteConfig.css.preprocessorOptions.scss = {
            ...viteConfig.css.preprocessorOptions.scss,
            implementation: 'sass-embedded',
            api: 'modern-compiler',
            additionalData: `@use "src/styles" as *;`,
          }
        }
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false,
        }
      }
    }
  }


  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})