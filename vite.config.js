import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from './plugins/index'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsInclude: ['src/locales/**/*'],
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('ant-design-vue')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            } else if (id.includes('zxcvbn')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            } else return 'node-modules'
          }
        }
      }
    }
  },
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: {
        plugins: [
          'preset-default',
          'cleanupIds',
          'minifyStyles',
          {
            name: 'mergePaths',
            params: {
              force: false,
              floatPrecision: 3,
              noSpaceAfterFlags: true
            }
          },
          'removeTitle',
          'removeEmptyContainers',

          'removeUselessStrokeAndFill',
          {
            name: 'removeAttrs',
            params: {
              attrs: ['fill', 'stroke', 'fill-rule']
            }
          },
          'collapseGroups'
        ]
      },

      /**
       * custom insert position
       * @default: body-last
       */
      inject: 'body-last',

      /**
       * custom dom id
       * @default: __svg__icons__dom__
       */
      customDomId: '__svg__icons__dom__'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
