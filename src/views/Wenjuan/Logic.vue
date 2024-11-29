<template>
  <div class="viewport" data-simplebar>
    <div class="canvas">
      <svg class="svg-container" ref="svgContainer">
        <!-- 连接线 -->
        <path v-for="(line, index) in lines" :key="'line-' + index" :d="generatePath(line)" fill="none" stroke="#666" stroke-width="2" />

        <!-- 临时连接线 -->
        <path v-if="tempLine" :d="generatePath(tempLine)" fill="none" stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
      </svg>

      <div class="nodes">
        <div class="node" v-for="node in nodes" :data-id="node.id" :key="node.id" draggable="true" :style="{ left: node.x + 'px', top: node.y + 'px' }">
          <div class="title">
            {{ node.title }}<a-tag>x:{{ node.x }}</a-tag> <a-tag>y:{{ node.y }}</a-tag>
          </div>
          <div class="port input"></div>
          <div class="body">
            <div v-for="col in node.cols" :key="col.id" class="col">
              <div class="name">{{ col.name }}</div>
              <div class="port output" :data-port-id="col.id"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加节点按钮 -->
  <button class="add-node" @click="addNode">添加节点</button>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import 'simplebar'
import '@/assets/simplebar.css'
import Drag from '@/js/dragCanvas'

import { customAlphabet } from 'nanoid'

// 添加画布缩放相关的响应式变量

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
const nodes = ref([])
const lines = ref([])
const tempLine = ref(null)
let dragInstance

const generatePath = (line) => {
  return ''
}

// 修改添加节点函数
const addNode = () => {
  // 获取 viewport 和 simplebar 的滚动容器
  const viewport = document.querySelector('.viewport')
  const scrollContainer = viewport?.querySelector('.simplebar-content-wrapper')
  if (!viewport || !scrollContainer) return

  // 获取 viewport 的可视区域大小
  const viewportWidth = viewport.clientWidth
  const viewportHeight = viewport.clientHeight

  // 获取实际的滚动位置
  const scrollLeft = scrollContainer.scrollLeft
  const scrollTop = scrollContainer.scrollTop

  // 计算视口中心点相对于画布的坐标
  const centerX = scrollLeft + viewportWidth / 2 - 100 // 减去节点宽度的一半(200/2)
  const centerY = scrollTop + viewportHeight / 2 - 50 // 减去节点预估高度的一半(100/2)

  const node = {
    id: nanoid(),
    title: `节点 ${nodes.value.length + 1}`,
    cols: [
      { name: '列 1', id: nanoid(), output: true },
      { name: '列 2', id: nanoid(), output: true }
    ],
    x: centerX,
    y: centerY
  }
  nodes.value.push(node)
  nextTick(() => {
    resizeCanvas()
  })
}

const onDragNode = (event) => {
  event.preventDefault()
  event.stopPropagation()
  const targetEl = event.target.closest('.node')
  if (!targetEl) return

  const nodeId = targetEl.getAttribute('data-id')

  // 记录初始位置
  const startX = event.clientX
  const startY = event.clientY
  const initialLeft = targetEl.offsetLeft
  const initialTop = targetEl.offsetTop

  // 添加全局事件监听
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onMouseUp)

  function onMove(event) {
    // 计算位移
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY

    // 计算新位置
    let newX = initialLeft + deltaX
    let newY = initialTop + deltaY

    // 限制最小值为0
    newX = Math.max(0, newX)
    newY = Math.max(0, newY)

    // 更新数据中的节点位置
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      node.x = newX
      node.y = newY
    }
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onMouseUp)
    resizeCanvas()
  }
}

onMounted(async () => {
  await nextTick()
  const nodesEl = document.querySelector('.nodes')
  nodesEl.addEventListener('mousedown', onDragNode)
  dragInstance = new Drag(document.querySelector('.viewport .simplebar-content-wrapper'))

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

onUnmounted(() => {})

// const nodes = reactive([])
// const lines = reactive([])
// const tempLine = ref(null)

// let draggedNode = null
// let dragStartX = 0
// let dragStartY = 0
// let draggingPort = null
// let dragInstance = null

// // 跟踪悬停的端口
// const hoveredPort = ref(null)

// // 生成贝塞尔曲线路径
// function generatePath(line) {
//   const dx = line.endX - line.startX
//   const dy = line.endY - line.startY
//   const distance = Math.sqrt(dx * dx + dy * dy)

//   // 基础控制点偏移量，随距离变化
//   let controlPointOffset = Math.min(Math.abs(dx), distance * 0.5)

//   // 最小和最大偏移量限制
//   controlPointOffset = Math.max(50, Math.min(controlPointOffset, 200))

//   // 根据起点和终点的垂直距离调整控制点
//   const verticalFactor = Math.abs(dy) / (Math.abs(dx) + Math.abs(dy))
//   const horizontalFactor = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy))

//   // 计算控制点
//   let startControlX, startControlY, endControlX, endControlY

//   startControlX = line.startX + controlPointOffset * (dx > 0 ? 1 : -1) * horizontalFactor
//   endControlX = line.endX - controlPointOffset * (dx > 0 ? 1 : -1) * horizontalFactor
//   startControlY = line.startY + controlPointOffset * verticalFactor * (dy > 0 ? 0.2 : -0.2)
//   endControlY = line.endY - controlPointOffset * verticalFactor * (dy > 0 ? 0.2 : -0.2)

//   return `M ${line.startX} ${line.startY} C ${startControlX} ${startControlY}, ${endControlX} ${endControlY}, ${line.endX} ${line.endY}`
// }

// // 处理节点拖拽
// function handleNodeDrag(event, node) {
//   draggedNode = node
//   dragStartX = event.clientX - node.x
//   dragStartY = event.clientY - node.y

//   // 添加全局事件监听
//   document.addEventListener('mousemove', handleGlobalMouseMove)
//   document.addEventListener('mouseup', handleGlobalMouseUp)
// }

// // 添加全局鼠标移动处理函数
// function handleGlobalMouseMove(event) {
//   handleMouseMove(event)
// }

// // 添加全局鼠标释放处理函数
// function handleGlobalMouseUp(event) {
//   handleMouseUp(event)
//   // 移除全局事件监听
//   document.removeEventListener('mousemove', handleGlobalMouseMove)
//   document.removeEventListener('mouseup', handleGlobalMouseUp)
// }

// // 添加 SVG 容器的引用
// const svgContainer = ref(null)

// // 修改获取端口位置的函数，考虑 SVG 容器的偏移
// function getPortPosition(element) {
//   const rect = element.getBoundingClientRect()
//   const svgRect = svgContainer.value?.getBoundingClientRect()
//   if (!svgRect) return { x: 0, y: 0 }

//   return {
//     x: rect.left + rect.width / 2 - svgRect.left,
//     y: rect.top + rect.height / 2 - svgRect.top
//   }
// }

// // 创建端口的辅助函数
// function createPort(type, columnIndex = 0) {
//   return {
//     id: nanoid(),
//     type
//   }
// }

// // 修改添加节点函数
// function addNode() {
//   const node = {
//     id: nanoid(),
//     title: `节点 ${nodes.length + 1}`,
//     columns: [
//       { name: '列 1', id: nanoid() },
//       { name: '列 2', id: nanoid() }
//     ],
//     x: 100,
//     y: 100 + nodes.length * 150,
//     // 为每个节点创建一个输入端口
//     inputPort: createPort('input'),
//     // 为每个列创建对应的输出端口
//     outputPorts: Array(2)
//       .fill(null)
//       .map((_, i) => createPort('output', i))
//   }
//   nodes.push(node)
// }

// // 修改处理端口拖拽开始的函数
// function handlePortDragStart(event, node, type, port) {
//   draggingPort = { node, type, port }

//   const portElement = event.target
//   const portPos = getPortPosition(portElement)
//   const svgRect = svgContainer.value?.getBoundingClientRect()
//   if (!svgRect) return

//   const mousePos = {
//     x: event.clientX - svgRect.left,
//     y: event.clientY - svgRect.top
//   }

//   tempLine.value = {
//     from: {
//       nodeId: node.id,
//       portId: port.id,
//       x: portPos.x,
//       y: portPos.y
//     },
//     to: {
//       nodeId: null,
//       portId: null,
//       x: mousePos.x,
//       y: mousePos.y
//     },
//     startX: type === 'input' ? mousePos.x : portPos.x,
//     startY: type === 'input' ? mousePos.y : portPos.y,
//     endX: type === 'input' ? portPos.x : mousePos.x,
//     endY: type === 'input' ? portPos.y : mousePos.y
//   }
// }

// // 修改端口检测函数
// function findPortUnderMouse(event) {
//   const elements = document.elementsFromPoint(event.clientX, event.clientY)
//   for (const element of elements) {
//     if (element.classList.contains('port')) {
//       const nodeElement = element.closest('.node')
//       if (!nodeElement) continue

//       const nodeId = nodeElement.getAttribute('data-node-id')
//       const node = nodes.find((n) => n.id === nodeId)
//       if (!node) continue

//       const portId = element.getAttribute('data-port-id')
//       const isInput = element.classList.contains('input-port')
//       const port = isInput ? node.inputPort : node.outputPorts.find((p) => p.id === portId)

//       return {
//         node,
//         type: isInput ? 'input' : 'output',
//         port
//       }
//     }
//   }
//   return null
// }

// // 修改 handleMouseUp 函数
// function handleMouseUp(event) {
//   if (tempLine.value && draggingPort) {
//     const targetPort = findPortUnderMouse(event)
//     if (targetPort && isValidConnection(draggingPort, targetPort)) {
//       // 获取目标端口的位置
//       const targetElement = event.target.closest('.port')
//       if (!targetElement) return

//       const targetPos = getPortPosition(targetElement)
//       // 获取起始端口的位置（需要重新获取，因为可能已经移动）
//       const sourceElement = document.querySelector(`.node[data-node-index="${draggingPort.node.id - 1}"] .port.${draggingPort.type}-port${draggingPort.type === 'output' ? `[data-port-id="${draggingPort.port.id}"]` : ''}`)
//       if (!sourceElement) return

//       const sourcePos = getPortPosition(sourceElement)

//       const newLine = {
//         from: {
//           nodeId: draggingPort.type === 'output' ? draggingPort.node.id : targetPort.node.id,
//           portId: draggingPort.type === 'output' ? draggingPort.port.id : targetPort.port.id,
//           x: draggingPort.type === 'output' ? sourcePos.x : targetPos.x,
//           y: draggingPort.type === 'output' ? sourcePos.y : targetPos.y
//         },
//         to: {
//           nodeId: draggingPort.type === 'input' ? draggingPort.node.id : targetPort.node.id,
//           portId: draggingPort.type === 'input' ? draggingPort.port.id : targetPort.port.id,
//           x: draggingPort.type === 'input' ? sourcePos.x : targetPos.x,
//           y: draggingPort.type === 'input' ? sourcePos.y : targetPos.y
//         },
//         startX: draggingPort.type === 'output' ? sourcePos.x : targetPos.x,
//         startY: draggingPort.type === 'output' ? sourcePos.y : targetPos.y,
//         endX: draggingPort.type === 'input' ? sourcePos.x : targetPos.x,
//         endY: draggingPort.type === 'input' ? sourcePos.y : targetPos.y
//       }
//       lines.push(newLine)
//     }
//   }

//   draggedNode = null
//   draggingPort = null
//   tempLine.value = null
// }

// // 修改鼠标移动处理函数
// function handleMouseMove(event) {
//   if (!draggedNode) return

//   draggedNode.x = event.clientX - dragStartX
//   draggedNode.y = event.clientY - dragStartY

//   // 更新与该节点相关的所有连接线
//   lines.forEach((line) => {
//     if (line.from.nodeId === draggedNode?.id) {
//       const sourceElement = document.querySelector(`.node[data-node-id="${draggedNode.id}"] .port[data-port-id="${line.from.portId}"]`)
//       if (sourceElement) {
//         const pos = getPortPosition(sourceElement)
//         line.from.x = pos.x
//         line.from.y = pos.y
//         line.startX = pos.x
//         line.startY = pos.y
//       }
//     }
//     if (line.to.nodeId === draggedNode?.id) {
//       const targetElement = document.querySelector(`.node[data-node-id="${draggedNode.id}"] .port[data-port-id="${line.to.portId}"]`)
//       if (targetElement) {
//         const pos = getPortPosition(targetElement)
//         line.to.x = pos.x
//         line.to.y = pos.y
//         line.endX = pos.x
//         line.endY = pos.y
//       }
//     }
//   })

//   if (tempLine.value && draggingPort) {
//     const svgRect = svgContainer.value?.getBoundingClientRect()
//     if (!svgRect) return

//     const mousePos = {
//       x: event.clientX - svgRect.left,
//       y: event.clientY - svgRect.top
//     }

//     if (draggingPort.type === 'input') {
//       tempLine.value.startX = mousePos.x
//       tempLine.value.startY = mousePos.y
//     } else {
//       tempLine.value.endX = mousePos.x
//       tempLine.value.endY = mousePos.y
//     }
//   }
// }

// // 修改 isValidConnection 函数，移除输入端口单一连接的限制
// function isValidConnection(from, to) {
//   // 确保一个是输入端口，一个是输出端口
//   if (from.type === to.type) return false

//   // 确保不是同一个节点
//   if (from.node.id === to.node.id) return false

//   // 确保相同的连接不会重复
//   const fromNode = from.type === 'output' ? from.node : to.node
//   const toNode = from.type === 'input' ? from.node : to.node
//   const fromPortIndex = from.type === 'output' ? from.port.columnIndex : to.port.columnIndex
//   const existingConnection = lines.find((line) => line.from.nodeId === fromNode.id && line.to.nodeId === toNode.id && line.from.portIndex === fromPortIndex)
//   if (existingConnection) return false

//   return true
// }

// // 添加处理鼠标进入端口的函数
// function handlePortEnter(node, type, port) {
//   hoveredPort.value = { node, type, port }
// }

// // 添加处理鼠标离开端口的函数
// function handlePortLeave() {
//   if (!draggingPort) {
//     // 只在非拖拽状态下清除悬停效果
//     hoveredPort.value = null
//   }
// }

const resizeCanvas = () => {
  // 获取canvas元素
  const canvas = document.querySelector('.canvas')
  if (!canvas) return

  // 获取当前画布尺寸
  const currentWidth = parseInt(canvas.style.width) || 2000
  const currentHeight = parseInt(canvas.style.height) || 2000

  // 找出所有节点中最右和最下的位置
  let maxX = 2000 // 保持最小宽度
  let maxY = 2000 // 保持最小高度

  nodes.value.forEach((node) => {
    const rightEdge = node.x + 200 // 200是节点宽度
    const bottomEdge = node.y + 100 // 预估节点高度

    maxX = Math.max(maxX, rightEdge + 100) // 额外留出100px边距
    maxY = Math.max(maxY, bottomEdge + 100)
  })

  // 使用当前尺寸和计算尺寸中的较大值
  maxX = Math.max(maxX, currentWidth)
  maxY = Math.max(maxY, currentHeight)

  canvas.style.width = `${maxX}px`
  canvas.style.height = `${maxY}px`
}
</script>

<style scoped lang="scss">
.viewport {
  padding: 0;
  margin: 0;
  height: calc(100vh - 64px);
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
  // background: red;  // 建议移除或改为更合适的背景色
}

.node {
  position: absolute;
  left: 0;
  top: 0;
  width: 200px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  &:hover {
    border-color: var(--c-brand);
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
  }
  .body {
    display: flex;
    flex-direction: column;
    .col {
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
  transition: all 0.2s ease;
  transform: translateY(-50%);
  &.input {
    left: -6px;
    top: 50%;
    &:hover {
      background: #2196f3;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
      transform: translateY(-50%) scale(1.2);
    }
  }
  &.output {
    right: -6px;
    top: 50%;
    &:hover {
      background: #4caf50;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
      transform: translateY(-50%) scale(1.2);
    }
  }
}

.add-node {
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

/* 加悬停样式 */
.port-hover {
  background: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
  transform: scale(1.2);
}

.input-port.port-hover {
  transform: translateY(-50%) scale(1.2);
}

.output-port.port-hover {
  transform: translateY(-50%) scale(1.2);
}
</style>
