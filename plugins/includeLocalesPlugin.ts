import { Plugin, ResolvedConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { copy } from 'fs-extra'

interface PluginOptions {
  directory: string
}

function nonStaticDirectoryPlugin(options: PluginOptions): Plugin {
  let config: ResolvedConfig

  return {
    name: 'non-static-directory-plugin',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async writeBundle() {
      try {
        const srcPath = path.resolve(config.root, 'src/locales')
        const distPath = path.resolve(config.root, 'dist/locales')

        // console.log(directoryPath)
        await copy(srcPath, distPath)
      } catch (error) {
        console.error('Error while copying folder:', error)
      }
    }
  }
}

export default nonStaticDirectoryPlugin
