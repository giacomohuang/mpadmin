import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from './plugins/svgicons/index'
import { obfuscator } from 'rollup-obfuscator'
// import obfuscator from 'rollup-plugin-obfuscator'
// import { viteObfuscateFile } from 'vite-plugin-obfuscator'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          // console.log(chunkInfo)
          return 'assets/[name]-[hash].js'
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('ant-design-vue')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            } else if (id.includes('zxcvbn')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            } else return 'mod'
          } else if (id.includes('locales/')) {
            return 'lo/' + id.toString().split('locales/')[1]
          }
        }
      }
    }
  },
  plugins: [
    vue(),
    obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
      ignoreImports: true
    }),
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
