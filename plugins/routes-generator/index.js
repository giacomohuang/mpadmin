import { parse } from '@vue/compiler-sfc'
import fs from 'fs'
import fg from 'fast-glob'
import chokidar from 'chokidar'
import { resolve } from 'path'
import json5 from 'json5'
import path from 'path'
import { get } from 'http'
// export default function routesGeneratorPlugin() {
//   const virtualModuleId = 'virtual:routes'
//   const resolvedVirtualModuleId = '\0' + virtualModuleId

//   return {
//     name: 'routes-generator-plugin',
//     // enforce: 'post',
//     // configureServer(server) {
//     //   const watchPath = resolve('./src/views')
//     //   const watcher = chokidar.watch(watchPath)
//     //   watcher.on('change', (path) => {
//     //     server.ws.send({
//     //       type: 'custom',
//     //       event: 'routes-generator-plugin',
//     //       data: getCode()
//     //     })
//     //   })
//     // },
//     resolveId(id) {
//       if (id === virtualModuleId) {
//         return resolvedVirtualModuleId
//       }
//     },
//     load(id) {
//       if (id === resolvedVirtualModuleId) {
//         return `export default aaa=[]`
//       }
//     }
//   }
// }

export default function routesGeneratorPlugin() {
  const virtualModuleId = 'virtual:router'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'routes-generator-plugin', // 必须的，将会在 warning 和 error 中显示
    configureServer(server) {
      const watchPath = resolve('./src/views')
      const watcher = chokidar.watch(watchPath)
      watcher.on('change', (path) => {
        console.log('/src/views file changed')
        server.ws.send({
          type: 'custom',
          event: 'routes-generator-plugin',
          data: `export default ${getCode()}`
        })
      })
    },
    // handleHotUpdate({ server }) {
    //   // Also use `server.ws.send` to support Vite <5.1 if needed
    //   server.ws.send({
    //     type: 'custom',
    //     event: 'special-update',
    //     data: getCode()
    //   })
    //   return `export default ${getCode()}`
    // },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${getCode()}`
      }
    }
  }
}

function getCode() {
  const viewsPath = './src/views'
  let vueFiles = []
  let dirSet = new Set()
  let globs = fg.sync(`${viewsPath}/**/*.vue`, { ignore: [`${viewsPath}/*.vue`] })
  globs.sort()
  globs.forEach((f) => {
    let file = f.replace(viewsPath, '')
    let dir = getDir(file)
    if (!dirSet.has(dir)) {
      dirSet.add(dir)
      vueFiles.push('/' + dir + '/')
    }
    vueFiles.push(file)
  })
  // console.log(vueFiles)
  // vueFiles = ['/Account/', '/Account/Account.vue', '/Account/AccountList.vue', '/Account/Asc/', '/Account/Asc/aaa.vue', '/Account/Asc/bbb.vue', '/Account/Permission.vue', '/My/', '/My/Main.vue']

  let index = -1
  let curDir = ''
  let routeJson = []

  routeJson = getRouteMap([])
  // console.log('-------------------')
  const routeStr = JSON.stringify(routeJson, null, '  ').replace(/"(\(\) => import\([\s\S]*?\))"/gm, '$1')
  console.log(routeStr)
  return routeStr

  function getRouteMap(json) {
    index++
    if (index > vueFiles.length - 1) return json
    if (!json) json = []
    const file = vueFiles[index]
    const dir = getDir(file).toLowerCase()
    const p = file.replace(/\/$/, '').replace('.vue', '').toLowerCase()
    if (index === 0) curDir = dir
    let j = {}
    j.path = p.replace(/\[[\d]+\]/g, '')
    j.name = p
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .replace(/\[[\d]+\]/g, '')
    j.meta = { title: j.name.replace('-', '.') + '._title' }

    if (!dir.includes(curDir)) {
      curDir = dir
      index--
      return json
    }
    curDir = dir
    if (isDir(file)) {
      // console.log(getDepth)
      if (getDepth(dir) == 1) {
        j.path = ''
        j.component = `() => import('/src/views/Layout.vue')`
      }
      j.children = getRouteMap([])
    } else {
      j.component = `() => import('/src/views${file}')`
    }
    json.push(j)
    return getRouteMap(json)
  }
}

function isDir(path) {
  return !path.endsWith('.vue')
}

function getDir(file) {
  const regex = /\/([\s\S]*)\//g
  const match = regex.exec(file)
  if (match) {
    return match[1]
  }
}

function getDepth(path) {
  return path.split('/').length
}
