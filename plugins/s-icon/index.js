import fs from 'fs'
import path from 'path'
import { optimize } from 'svgo'
import glob from 'glob'
import { parse } from 'node-html-parser'

export default function svgOptimizerPlugin() {
  const sourceDir = path.resolve(__dirname, 'icons')
  const targetDir = path.resolve(__dirname, '../../src/assets/s-icon')
  const viewsDir = path.resolve(__dirname, '../../src/views')

  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // SVGO 配置
  const svgoConfig = {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            cleanUpIds: false
          }
        }
      }
    ]
  }

  // 将SVG转换为symbol格式
  const convertToSymbol = (content, id) => {
    const result = optimize(content, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              cleanupIDs: false
            }
          }
        },
        {
          name: 'convertToSymbol',
          params: {
            id: id
          }
        }
      ]
    })
    return result.data
  }

  // 扫描Vue文件中的icon标签
  const scanIconsInFile = (fileContent) => {
    const root = parse(fileContent)
    const icons = root.querySelectorAll('icon')
    return icons.map((icon) => icon.getAttribute('name')).filter(Boolean)
  }

  // 生成SVG sprite
  const generateSprite = (iconNames) => {
    let spriteContent = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">'

    iconNames.forEach((name) => {
      const svgPath = path.join(sourceDir, `${name}.svg`)
      if (fs.existsSync(svgPath)) {
        const content = fs.readFileSync(svgPath, 'utf8')
        const symbol = convertToSymbol(content, name)
        spriteContent += symbol
      }
    })

    spriteContent += '</svg>'
    return spriteContent
  }

  return {
    name: 'svg-optimizer-plugin',
    transform(code, id) {
      // 只处理 Vue 文件
      if (!id.endsWith('.vue')) return

      // 扫描文件中的图标
      const iconNames = scanIconsInFile(code)

      if (iconNames.length === 0) return

      // 生成 sprite 并注入到组件中
      const sprite = generateSprite(iconNames)

      // 在组件的模板末尾注入 SVG sprite
      const injection = `
        <template>
          ${code.match(/<template>[\s\S]*<\/template>/m)?.[0].replace('</template>', '')}
          ${sprite}
        </template>
      `

      return {
        code: code.replace(/<template>[\s\S]*<\/template>/m, injection),
        map: null
      }
    },

    configureServer(server) {
      // 监听源文件变化
      const watcher = fs.watch(sourceDir, (eventType, filename) => {
        if (filename && path.extname(filename) === '.svg') {
          console.log(`检测到SVG文件变化: ${filename}`)
          server.ws.send({ type: 'full-reload' })
        }
      })

      // 清理监听器
      server.httpServer.on('close', () => {
        watcher.close()
      })
    }
  }
}
