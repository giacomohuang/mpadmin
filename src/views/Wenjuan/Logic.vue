<template>
  <div class="viewport" data-simplebar>
    <div class="canvas">
      <svg class="svg-container" ref="svgContainer">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <polyline transform="translate(8, 1) rotate(45) " points="-2 2 4 2 4 8" stroke="#666" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"></polyline>
          </marker>
        </defs>
        <g class="line-wrap" v-for="(line, index) in lines" :key="'line-' + index" @click.stop="handleLineRemove(index)" :class="{ dragging: draggingLine }">
          <path class="line" :d="generatePath(line)" marker-end="url(#arrow)" :class="{ active: currentLogicIdx !== -1 && (line.from.id === logics[currentLogicIdx]?.id || line.to.id === logics[currentLogicIdx]?.id) }" />
          <path class="line-h" :d="generatePath(line)" />
        </g>
        <path v-if="tempLine" class="line" :d="generatePath(tempLine)" fill="none" stroke-width="2" stroke-dasharray="5,5" />
      </svg>

      <div class="logics">
        <div class="logic" v-for="(item, index) in logics" :data-id="item.id" :key="item.id" draggable="true" :style="{ left: item.logic.x + 'px', top: item.logic.y + 'px' }" @click.stop="setCurrentLogic($event, index)" :class="{ current: currentLogicIdx === index }">
          <div class="title">
            <span>{{ qItems.findIndex((itm) => itm.id === item.id) + 1 }}. {{ item.title }}</span>
            <!-- <a-tag>x:{{ logic.x }}</a-tag> <a-tag>y:{{ logic.y }}</a-tag> -->
            <icon name="remove" size="1em" class="remove" @click.stop="removeLogic(item.id)" />
          </div>
          <div class="port input" @mousedown.stop="handlePortDragStart($event, item.id, 'input', 'input')"></div>
          <div class="body">
            <div v-for="option in item.options" :key="option.id" class="condition">
              <div class="name">{{ option.text }}</div>
              <div class="port output" :data-port-id="option.id" @mousedown.stop="handlePortDragStart($event, item.id, option.id, 'output')"></div>
            </div>
          </div>
        </div>
      </div>
      <svg class="guide-line-container">
        <g>
          <line v-for="(line, index) in guideLines.x" :key="'x-' + index" class="guide-line vertical" :x1="line.position" :y1="line.start" :x2="line.position" :y2="line.end" />
          <line v-for="(line, index) in guideLines.y" :key="'y-' + index" class="guide-line horizontal" :x1="line.start" :y1="line.position" :x2="line.end" :y2="line.position" />
        </g>
      </svg>
    </div>
  </div>

  <div class="questions" data-simplebar>
    <div class="question" v-for="(item, index) in qItems" :class="{ disabled: item._canDrag === false }" :key="item.id" :draggable="item._canDrag !== false" @dragstart="handleQuestionDragStart($event, item)">
      <div class="title">{{ index + 1 }}. {{ item.title }}</div>
    </div>
  </div>
  <!-- <div style="border: 1px solid #ccc; padding: 10px; border-radius: 10px; height: 80%; width: 400px; position: absolute; right: 40px; top: 20px; z-index: 1000; overflow: auto">
    {{ mouse.x }},{{ mouse.y }}
    <pre><code>{{ JSON.stringify(qItems, null, 2) }}</code></pre>
  </div> -->
  <!-- 
  <a-drawer v-model:open="settingsDrawer" :mask="false" class="settings-drawer">
    <div class="logic-settings" v-if="currentLogicIdx !== -1">
      <div class="question-title">{{ qItems.find((item) => item.id === logics[currentLogicIdx].id)?.title }}</div>
    </div>
  </a-drawer> -->
  <!-- <button class="add-logic" @click="addLogic">添加节点</button> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, inject, computed } from 'vue'
import 'simplebar'
import '@/assets/simplebar.css'
import Drag from '@/js/dragCanvas'
import { calculateSnap } from '@/js/snapHelper'

const currentLogicIdx = ref(-1)
const lines = ref([])
const tempLine = ref(null)
// const settingsDrawer = ref(false)
const draggingLine = ref(false)
// const mouse = ref({
//   x: 0,
//   y: 0
// })

// window.addEventListener('mousemove', (ev) => {
//   mouse.value = {
//     x: ev.clientX,
//     y: ev.clientY
//   }
// })

const qItems = inject('qItems')
const logics = computed(() => qItems.value.filter((item) => item.logic))
console.log(logics.value)

let dragInstance
let isDragging = false

// 在 data 部分添加辅助线相关的状态
const guideLines = ref({
  x: [], // 存储垂直辅助线
  y: [] // 存储水平辅助线
})

// 设置当前逻辑节点
const setCurrentLogic = (event, index) => {
  event.preventDefault()
  event.stopPropagation()
  currentLogicIdx.value = index
  // settingsDrawer.value = true

  document.addEventListener('mouseup', closeSettings)
  function closeSettings(ev) {
    if (ev.target.closest('.logic') || ev.target.closest('.port') || ev.target.closest('.line-wrap') || draggingLine.value) {
      return
    }
    // else {
    //   const box = document.querySelector('.settings-drawer').getBoundingClientRect()
    //   if (ev.clientX > box.left && ev.clientX < box.right && ev.clientY > box.top && ev.clientY < box.bottom) {
    //     return
    //   }
    // }
    currentLogicIdx.value = -1
    // settingsDrawer.value = false
    document.removeEventListener('mouseup', closeSettings)
  }
}

// 生成连接线路径
const generatePath = (line) => {
  const dx = line.endX - line.startX
  const dy = line.endY - line.startY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // 如果距离很小(比如小于100px)，使用直线或简单的曲线
  if (distance < 100) {
    // 如果高度差很小，使用水平直线
    if (Math.abs(dy) < 20) {
      return `M ${line.startX} ${line.startY} L ${line.endX} ${line.endY}`
    }

    // 使用简单的曲线，控制点距离更小
    const controlPointOffset = distance * 0.3
    const startControlX = line.startX + controlPointOffset
    const endControlX = line.endX - controlPointOffset

    return `M ${line.startX} ${line.startY} C ${startControlX} ${line.startY}, ${endControlX} ${line.endY}, ${line.endX} ${line.endY}`
  }

  // 原有的长距离连接线逻辑
  let controlPointOffset = Math.min(Math.abs(dx), distance * 0.5)
  controlPointOffset = Math.max(50, Math.min(controlPointOffset, 200))

  const total = Math.abs(dx) + Math.abs(dy)
  const verticalFactor = total === 0 ? 0 : Math.abs(dy) / total
  const horizontalFactor = total === 0 ? 1 : Math.abs(dx) / total

  let startControlX, endControlX
  if (line.startX > line.endX - 10) {
    startControlX = line.startX - controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
    endControlX = line.endX + controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
  } else {
    startControlX = line.startX + controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
    endControlX = line.endX - controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
  }

  let startControlY = line.startY - controlPointOffset * verticalFactor * (dy >= 0 ? 0.2 : -0.2)
  let endControlY = line.endY - controlPointOffset * verticalFactor * (dy >= 0 ? 0.2 : -0.2)

  return `M ${line.startX} ${line.startY} C ${startControlX} ${startControlY}, ${endControlX} ${endControlY}, ${line.endX} ${line.endY}`
}

// 获取端口位置
const getPortPosition = (element) => {
  if (!element) return { x: 0, y: 0 }

  try {
    const rect = element.getBoundingClientRect()
    const canvas = document.querySelector('.canvas')
    if (!canvas) return { x: 0, y: 0 }

    const canvasRect = canvas.getBoundingClientRect()

    const x = rect.left - canvasRect.left + rect.width / 2
    const y = rect.top - canvasRect.top + rect.height / 2

    return { x, y }
  } catch (error) {
    return { x: 0, y: 0 }
  }
}

// 查找端口
const findPort = (event) => {
  const elements = document.elementsFromPoint(event.clientX, event.clientY)
  for (const element of elements) {
    if (element.classList.contains('port')) {
      const logicElement = element.closest('.logic')
      if (!logicElement) continue

      const id = logicElement.getAttribute('data-id')
      const type = element.classList.contains('input') ? 'input' : 'output'
      const portId = type === 'input' ? 'input' : element.getAttribute('data-port-id')
      return { id, portId, type }
    }
  }
  return null
}

// 修改连接验证函数
const isValidConnection = (fromPort, toPort) => {
  console.log('isValidConnection', fromPort, toPort)
  // 确保两个端口都存在, 端口类型不同, 节点不同
  if (!fromPort || !toPort || fromPort.type === toPort.type || fromPort.id === toPort.id) {
    return false
  }

  // 检查输出端口是否已经连接
  const outputPort = fromPort.type === 'output' ? fromPort : toPort
  const existingConnection = lines.value.find((line) => {
    const result = (line.from.id === outputPort.id && line.from.portId === outputPort.portId) || (line.to.id === outputPort.id && line.to.portId === outputPort.portId)
    return result
  })

  return !existingConnection
}

// 处理端口拖拽开始
const handlePortDragStart = (event, id, portId, type) => {
  // console.log('handlePortDragStart')
  event.preventDefault()
  event.stopPropagation()
  draggingLine.value = true
  const portElement = event.target
  const portPos = getPortPosition(portElement)

  // 根据端口类���设置不同的偏移量
  const xOffset = type === 'input' ? -10 : 10

  // 置临时连接线的初始状态
  tempLine.value = {
    startX: type === 'output' ? portPos.x + xOffset : portPos.x + xOffset,
    startY: portPos.y,
    endX: type === 'output' ? portPos.x + xOffset : portPos.x + xOffset,
    endY: portPos.y,
    from: type === 'output' ? { id, portId, type } : null,
    to: type === 'output' ? null : { id, portId, type }
  }

  // 添加全局事件监听
  window.addEventListener('mousemove', handlePortDragMove)
  window.addEventListener('mouseup', handlePortDragEnd)
}

// 处理端口拖拽移动
const handlePortDragMove = (event) => {
  event.preventDefault()
  event.stopPropagation()

  if (!tempLine.value) return

  const canvas = document.querySelector('.canvas')
  const canvasRect = canvas.getBoundingClientRect()

  const mouseX = event.clientX - canvasRect.left
  const mouseY = event.clientY - canvasRect.top

  // 根据是从输入端口还是输出端口拖动来更新不同的端点
  if (tempLine.value.from) {
    // 从输出端口拖动
    tempLine.value.endX = mouseX - 10
    tempLine.value.endY = mouseY
  } else {
    // 从输入端口拖动
    tempLine.value.startX = mouseX + 10
    tempLine.value.startY = mouseY
  }
}

// 修改端口拖拽结束函数
const handlePortDragEnd = (event) => {
  event.preventDefault()
  event.stopPropagation()
  console.log('handlePortDragEnd')
  draggingLine.value = false
  if (!tempLine.value) return

  const targetPort = findPort(event)

  if (targetPort) {
    const fromPort = tempLine.value.from || targetPort
    const toPort = tempLine.value.from ? targetPort : tempLine.value.to

    if (isValidConnection(fromPort, toPort)) {
      // 获取正确的端口元素
      const fromElement = fromPort.type === 'input' ? document.querySelector(`.logic[data-id="${fromPort.id}"] .port.input`) : document.querySelector(`.logic[data-id="${fromPort.id}"] .port.output[data-port-id="${fromPort.portId}"]`)

      const toElement = toPort.type === 'input' ? document.querySelector(`.logic[data-id="${toPort.id}"] .port.input`) : document.querySelector(`.logic[data-id="${toPort.id}"] .port.output[data-port-id="${toPort.portId}"]`)

      if (fromElement && toElement) {
        const fromPos = getPortPosition(fromElement)
        const toPos = getPortPosition(toElement)

        lines.value.push({
          startX: fromPos.x + 10,
          startY: fromPos.y,
          endX: toPos.x - 10,
          endY: toPos.y,
          from: fromPort,
          to: toPort
        })

        // 保存连接关系到源节点的 connections 数组中
        const sourceItem = logics.value.find((l) => l.id === fromPort.id)
        if (sourceItem) {
          if (!sourceItem.logic.connections) {
            sourceItem.logic.connections = []
          }
          sourceItem.logic.connections.push({
            fromPortId: fromPort.portId,
            toLogicId: toPort.id
          })
        }
      }
    }
  }

  tempLine.value = null
  window.removeEventListener('mousemove', handlePortDragMove)
  window.removeEventListener('mouseup', handlePortDragEnd)
}

// 修改节点拖拽函数
const handleLogicDrag = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const targetEl = event.target.closest('.logic')
  if (!targetEl) return

  isDragging = false

  const id = targetEl.getAttribute('data-id')

  // 记录初始位置
  const startX = event.clientX
  const startY = event.clientY
  const initialLeft = targetEl.offsetLeft
  const initialTop = targetEl.offsetTop

  // 添加全局事件监听
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onMouseUp)

  function onMove(event) {
    // 计算移动距离
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY
    console.log('deltaX', deltaX, deltaY)

    // 只有移动距离超过5像素认为是拖拽
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isDragging = true
    }

    // 计算新位置
    let newX = initialLeft + deltaX
    let newY = initialTop + deltaY

    // 限制最小值为0
    newX = Math.max(0, newX)
    newY = Math.max(0, newY)

    // 获取当前节点元素
    const currentLogicEl = document.querySelector(`.logic[data-id="${id}"]`)
    const currentRect = currentLogicEl.getBoundingClientRect()

    // 准备当前节点信息
    const currentLogic = {
      id: id,
      x: newX,
      y: newY,
      width: currentRect.width,
      height: currentRect.height
    }

    // 准备其他节点信息
    const otherLogics = logics.value
      .filter((item) => item.id !== id)
      .map((item) => {
        const el = document.querySelector(`.logic[data-id="${item.id}"]`)
        const rect = el.getBoundingClientRect()
        return {
          id: item.id,
          x: item.logic.x,
          y: item.logic.y,
          width: rect.width,
          height: rect.height
        }
      })
    // 计算吸附位置和辅助线
    const { snapX, snapY, guideLines: newGuideLines } = calculateSnap(currentLogic, otherLogics)

    // 应用吸附位置
    if (snapX !== null) {
      newX = snapX
    }
    if (snapY !== null) {
      newY = snapY
    }

    // 更新辅助线
    guideLines.value = newGuideLines

    // 更新节点位置
    const logic = qItems.value.find((n) => n.id === id).logic
    if (logic) {
      logic.x = newX
      logic.y = newY
      updateLinesPosition(id)
    }
  }

  function onMouseUp() {
    targetEl.classList.remove('dragging')
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onMouseUp)
    resizeCanvas()

    // 如果发生了拖拽，阻止click事件
    if (isDragging) {
      event.preventDefault()
      event.stopPropagation()
      // 阻后续的click事件
      const clickHandler = (e) => {
        e.preventDefault()
        e.stopPropagation()
        document.removeEventListener('click', clickHandler, true)
      }
      document.addEventListener('click', clickHandler, true)
    }

    // 清空辅助线
    guideLines.value = { x: [], y: [] }
  }
}

// 调整画布大小
const resizeCanvas = () => {
  // 获取canvas元素
  const canvas = document.querySelector('.canvas')
  if (!canvas) return

  // 取当前画布尺寸
  const currentWidth = parseInt(canvas.style.width) || 2000
  const currentHeight = parseInt(canvas.style.height) || 2000

  // 找出所有节点中最右和最下的位置
  let maxX = 2000 // 保持最小宽度
  let maxY = 2000 // 保持最小高度

  logics.value.forEach((logic) => {
    const rightEdge = logic.x + 200 // 200是节点宽度
    const bottomEdge = logic.y + 100 // 预估节点高度

    maxX = Math.max(maxX, rightEdge + 100) // 额外留出100px边距
    maxY = Math.max(maxY, bottomEdge + 100)
  })

  // 使用当前尺寸和计算尺寸中的较大值
  maxX = Math.max(maxX, currentWidth)
  maxY = Math.max(maxY, currentHeight)

  canvas.style.width = `${maxX}px`
  canvas.style.height = `${maxY}px`
}

// 添加更新连接线位置的工具函数
const updateLinesPosition = (id) => {
  lines.value.forEach((line, index) => {
    const updatedLine = { ...line }
    let needsUpdate = false

    // 更新起点（如果连接线从该节点开始）
    if (line.from.id === id) {
      const fromElement = line.from.type === 'input' ? document.querySelector(`.logic[data-id="${id}"] .port.input`) : document.querySelector(`.logic[data-id="${id}"] .port.output[data-port-id="${line.from.portId}"]`)

      if (fromElement) {
        const pos = getPortPosition(fromElement)
        updatedLine.startX = pos.x + 10
        updatedLine.startY = pos.y
        needsUpdate = true
      }
    }

    // 更新终点（如果连接线连到该节点）
    if (line.to.id === id) {
      const toElement = line.to.type === 'input' ? document.querySelector(`.logic[data-id="${id}"] .port.input`) : document.querySelector(`.logic[data-id="${id}"] .port.output[data-port-id="${line.to.portId}"]`)

      if (toElement) {
        const pos = getPortPosition(toElement)
        updatedLine.endX = pos.x - 10
        updatedLine.endY = pos.y
        needsUpdate = true
      }
    }

    // 如果置有更新，则更新连接线
    if (needsUpdate) {
      lines.value[index] = updatedLine
    }
  })
}

// 删除逻辑节点
const removeLogic = (id) => {
  // 删除与该节点相关的所有连接线
  lines.value = lines.value.filter((line) => line.from.id !== id && line.to.id !== id)
  // 删除节点
  const item = qItems.value.find((item) => item.id === id)
  item._canDrag = true
  delete item.logic

  // 删除与该节点相关的所有连接
  console.log(id)
  logics.value.forEach((item) => {
    if (item.logic.connections) {
      item.logic.connections = item.logic.connections.filter((conn) => conn.toLogicId !== id)
    }
  })

  // 更新画布大小
  nextTick(() => {
    resizeCanvas()
  })
}

// 添加问题拖拽开始处理函数
const handleQuestionDragStart = (event, qItem) => {
  event.stopPropagation()

  event.dataTransfer.effectAllowed = 'copy'
  const itemEl = event.target.closest('.question')
  const itemRect = itemEl.getBoundingClientRect()
  const startX = event.clientX
  const startY = event.clientY
  const initialLeft = itemRect.left
  const initialTop = itemRect.top

  const canvasEl = document.querySelector('.canvas')

  canvasEl.addEventListener('dragover', dragOver)
  canvasEl.addEventListener('drop', drop)

  // 添加画布拖拽相关处理函数
  function dragOver(ev) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'copy'
  }

  function drop(ev) {
    ev.preventDefault()
    // ev.stopPropagation()
    console.log('drop', ev.clientX, ev.clientY)
    if (ev.clientX > window.innerWidth || ev.clientY > window.innerHeight || ev.clientX < 0 || ev.clientY < 0) {
      return
    }

    qItem._canDrag = false

    // 获取滚动容器
    const scrollContainer = document.querySelector('.viewport .simplebar-content-wrapper')
    const scrollLeft = scrollContainer?.scrollLeft || 0
    const scrollTop = scrollContainer?.scrollTop || 0

    // 考虑滚动条
    const deltaX = ev.clientX - startX + scrollLeft
    const deltaY = ev.clientY - startY + scrollTop

    // 计算放置位置
    const dropX = initialLeft + deltaX
    const dropY = initialTop + deltaY

    // 创建新节点,只保存问题ID和位置信息
    const logic = {
      x: dropX,
      y: dropY,
      connections: []
    }

    qItem.logic = logic
    canvasEl.removeEventListener('dragover', dragOver)
    canvasEl.removeEventListener('drop', drop)

    nextTick(() => {
      resizeCanvas()
    })
  }
}

// 添加初始化连接线的函数
const initializeLines = () => {
  // 清空现有连接线
  lines.value = []

  // 遍历所有逻辑节点
  logics.value.forEach((logic) => {
    // 检查节点是否有连接关系数据
    if (logic.connections) {
      logic.connections.forEach((connection) => {
        // 获取起始端口元素
        const fromElement = document.querySelector(`.logic[data-id="${logic.id}"] .port.output[data-port-id="${connection.fromPortId}"]`)

        // 获取目标端口元素
        const toElement = document.querySelector(`.logic[data-id="${connection.toLogicId}"] .port.input`)

        if (fromElement && toElement) {
          const fromPos = getPortPosition(fromElement)
          const toPos = getPortPosition(toElement)

          // 创建连接线
          lines.value.push({
            startX: fromPos.x + 10,
            startY: fromPos.y,
            endX: toPos.x - 10,
            endY: toPos.y,
            from: {
              id: logic.id,
              portId: connection.fromPortId,
              type: 'output'
            },
            to: {
              id: connection.toLogicId,
              portId: 'input',
              type: 'input'
            }
          })
        }
      })
    }
  })
}

// 删除连接线
const handleLineRemove = (index) => {
  const line = lines.value[index]

  // 从源节点的 connections 数组中删除对应的连接
  const sourceItem = logics.value.find((l) => l.id === line.from.id)
  if (sourceItem && sourceItem.logic.connections) {
    sourceItem.logic.connections = sourceItem.logic.connections.filter((conn) => !(conn.fromPortId === line.from.portId && conn.toLogicId === line.to.id))
  }

  // 删除连接线
  lines.value.splice(index, 1)
}

onMounted(async () => {
  await nextTick()
  const logicsEl = document.querySelector('.logics')
  logicsEl.addEventListener('mousedown', handleLogicDrag)
  dragInstance = new Drag(document.querySelector('.viewport .simplebar-content-wrapper'))

  // 初始化连接线
  initializeLines()

  // 初始化时滚动到画布中心
  const viewport = document.querySelector('.viewport')
  const scrollContainer = viewport?.querySelector('.simplebar-content-wrapper')
  if (viewport && scrollContainer) {
    // 计算需要滚动的位置
    const viewportWidth = viewport.clientWidth
    const viewportHeight = viewport.clientHeight
    const canvasWidth = 2000 // 画布初始宽度
    const canvasHeight = 2000 // 画布初始高度

    // 计算滚动位置，使画布中心对齐视口中心
    const scrollLeft = (canvasWidth - viewportWidth) / 2
    const scrollTop = (canvasHeight - viewportHeight) / 2

    // 设置滚动位置
    scrollContainer.scrollLeft = scrollLeft
    scrollContainer.scrollTop = scrollTop
  }
})

onUnmounted(() => {
  const logicsEl = document.querySelector('.logics')
  logicsEl?.removeEventListener('mousedown', handleLogicDrag)
})
</script>

<style scoped lang="scss">
.viewport {
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 100vw;
  position: relative;
  cursor: grab;
  background-image: radial-gradient(circle, var(--border-dark) 0.5px, transparent 0.5px);
  background-size: 15px 15px;
  background-position: 20px 20px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas {
  position: relative;
  min-width: 2000px;
  min-height: 2000px;
  width: fit-content;
  height: fit-content;
  margin: auto;
}

.logic {
  position: absolute;
  left: 0;
  top: 0;
  width: 200px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  z-index: 2;
  transform-origin: center;
  transition: transform 0.1s ease;

  &.current {
    border-color: var(--c-brand);
    z-index: 10;
    .title {
      background: var(--bg-brand);
      border-bottom: 1px solid var(--c-brand);
    }
  }

  .title {
    padding: 12px 8px;
    border-radius: 4px 4px 0 0;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-medium);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .remove {
    cursor: pointer;
    color: var(--text-tertiary);
    // border-radius: 50%;
    // border: 1px solid transparent;
    transition: all 0.15s ease;
    &:hover {
      color: var(--text-primary);
      // border-color: var(--c-r);
    }
  }
  .body {
    display: flex;
    flex-direction: column;

    .add-condition {
      padding: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;

      &:hover {
        color: var(--c-brand);
        background: var(--bg-secondary);
      }
    }

    .condition {
      position: relative;
      padding: 8px 0;
      &:not(:last-child) {
        border-bottom: 1px solid var(--border-medium);
      }
    }
    .name {
      padding: 0 8px;
    }
  }
}

.port {
  opacity: 1;
  position: absolute;
  width: 12px;
  height: 12px;
  background: #666;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s ease;
  transform: translateY(-50%);
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
  }

  &.input {
    left: -6px;
    top: 50%;
    &:hover {
      background: #2196f3;
    }
    &.port-hover {
      background: #2196f3;
      transform: translateY(-50%) scale(1.2);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
    }
  }

  &.output {
    right: -6px;
    top: 50%;
    &:hover {
      background: #4caf50;
    }
    &.port-hover {
      background: #4caf50;
      transform: translateY(-50%) scale(1.2);
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
    }
  }
}

.line-wrap {
  cursor: pointer;

  .line-h {
    stroke-width: 10;
    stroke: transparent;
    pointer-events: stroke;
    fill: none;
  }

  &:not(&.dragging):hover {
    .line {
      stroke: #ff4d4f;
      stroke-dasharray: 5, 5;
      animation: dash 1s linear infinite;
    }
  }
}
.line {
  stroke: #666;
  stroke-width: 2;
  cursor: pointer;
  transition: stroke 0.2s ease;
  fill: none;
  pointer-events: stroke;
  stroke-linecap: round;
  paint-order: stroke;
  stroke-linejoin: round;

  &.active {
    stroke: var(--c-brand);
    stroke-dasharray: 5, 5;
    animation: dash 1s linear infinite;
  }
}

.add-logic {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 添加箭头样式 */
#arrow {
  overflow: visible;
}

@keyframes dash {
  from {
    stroke-dashoffset: 10;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.guide-line-container {
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.guide-line {
  stroke: #1890ff;
  stroke-width: 1;
  pointer-events: none;
  shape-rendering: crispEdges;
  // stroke-dasharray: 4 2;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  top: 20px;
  left: 20px;
  bottom: 50%;
  width: 200px;

  border: 1px solid var(--border-medium);
  border-radius: 4px;
  background: var(--bg-primary);
  user-select: none;
  box-shadow: 1px 1px 2px 2px var(--border-light);
  // padding: 8px;

  .question {
    // margin: 4px;
    padding: 12px 8px;
    flex: 1;
    border-radius: 4px;
    // border-bottom: 1px solid var(--border-medium);
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: var(--bg-secondary);
    &:hover:not(&.disabled) {
      cursor: grab;
      background: var(--bg-brand);
    }
    &:active:not(&.disabled) {
      cursor: grabbing;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
