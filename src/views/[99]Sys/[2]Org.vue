<template>
  <div class="main">
    <div id="canvas">
      <div id="scaler">
        <div id="nodes" ref="orgRef">
          <OrgNode :data="orgTree" :level="1" @add="add" @edit="edit" @remove="remove"></OrgNode>
        </div>
      </div>
    </div>
  </div>

  <a-drawer v-model="drawer">
    <template #header="{ close }">
      <div class="title">{{ editing_node.name }}<icon name="icon-edit"></icon></div>
      <div class="close" @click="close"><icon name="icon-remove"></icon></div>
    </template>
    <span>Hi, there!</span>
    {{ editing_node }}
  </a-drawer>

  <div id="zoom">
    <div class="item" @click.stop="zoom('out')"><icon name="zoom-out"></icon></div>
    <div class="item" style="width: 58px; text-align: center" @click.stop="zoom('reset')">{{ zoom_percent }}%</div>
    <div class="item" @click.stop="zoom('in')"><icon name="zoom-in"></icon></div>
    <div class="item" @click.stop="center"><icon name="fit-center"></icon></div>
  </div>
</template>

<script setup>
import { provide, onMounted, ref, nextTick } from 'vue'

import OrgNode from './OrgNode.vue'
import { customAlphabet } from 'nanoid'
import Drag from '@/js/dragCanvas'
import API from '@/api/API'
import PerfectScrollbar from '@/components/PerfectScrollerBar'
import '@/assets/perfect-scrollbar.css'
import { DnD } from '@/js/DnDTree'
import org from '@/api/org'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 4)

// 当前编辑节点
const editing_node = ref('')
// 侧边栏打开状态
const drawer = ref(false)
// 画布缩放倍率
const zoom_percent = ref(100)
// 主数据
const orgTree = ref([])

provide('editing_node', editing_node)
provide('drawer', drawer)

const orgRef = ref(null)
const orgDnD = new DnD(orgRef, (el) => reorder(el))
let orgData = null

const buildTree = (data) => {
  // 构建树形结构
  const tree = []
  const rsdata = JSON.parse(JSON.stringify(data))
  const itemMap = new Map(rsdata.map((item) => [item.id, { ...item, children: [] }]))

  rsdata.forEach((item) => {
    const node = itemMap.get(item.id)
    if (item.pid === null) {
      tree.push(node)
    } else {
      const parent = itemMap.get(item.pid)
      if (parent) {
        const index = parent.children.findIndex((child) => node.order < child.order)
        if (index !== -1) {
          parent.children.splice(index, 0, node)
        } else {
          parent.children.push(node)
        }
      }
    }
  })

  console.log(tree)
  return tree
}
// 数据初始化
async function initData() {
  orgData = await API.org.list()
  orgTree.value = buildTree(orgData)
  // console.log('data loaded:', t)
  nextTick(() => {
    center()
  })
}

// function add(items, index, direction) {
//   console.log('add', index, direction)
//   const data = {
//     id: nanoid(),
//     name: '部门',
//     type: 0,
//     isEntity: false,
//     leaderId: null,
//     leaderName: '',
//     order: 1,
//     status: 1,
//     level: null,
//     pid: null,
//     path: null,
//     children: []
//   }

//   switch (direction) {
//     case 'parent':
//       const old = items.children.splice(index, 1, data)[0]
//       items.children[index].children.splice(1, 0, old)
//       break
//     case 'child':
//       if (items[index].children == null) {
//         items[index].children = []
//       }
//       items[index].children.push(data)
//       break
//     case 'previous':
//       items.splice(index, 0, data)
//       break
//     case 'next':
//       items.splice(index + 1, 0, data)
//       break
//   }
//   resizeCanvas()
// }

function edit(id) {
  console.log('edit', id)
}

// 重新计算画布大小，并居中
function center() {
  let scrollbar = document.querySelector('.ps')
  let canvas = document.getElementById('canvas')
  let nodes = document.getElementById('nodes')

  resizeCanvas()

  canvas.style.paddingLeft = (canvas.offsetWidth - nodes.offsetWidth) / 2 + 'px'
  canvas.style.paddingTop = (canvas.offsetHeight - nodes.offsetHeight) / 2 + 'px'

  scrollbar.scrollLeft = (canvas.offsetWidth - scrollbar.clientWidth) / 2
  scrollbar.scrollTop = (canvas.offsetHeight - scrollbar.clientHeight) / 2
}

function resizeCanvas() {
  let canvas = document.getElementById('canvas')
  let nodes = document.getElementById('nodes')
  canvas.style.width = Math.max(nodes.offsetWidth, document.body.clientWidth) * 1.5 + 'px'
  canvas.style.height = Math.max(nodes.offsetHeight, document.body.clientHeight) * 1.5 + 'px'
}

// 缩放画布
function zoom(mode) {
  switch (mode) {
    case 'out':
      if (zoom_percent.value >= 50) {
        zoom_percent.value -= 25
      }
      break
    case 'in':
      if (zoom_percent.value < 300) {
        zoom_percent.value += 25
      }
      break
    case 'reset':
      zoom_percent.value = 100
  }
  document.getElementById('scaler').style.transform = `scale(${zoom_percent.value / 100})`
}

// 添加节点
const add = async (item, direction) => {
  const orgMap = new Map(orgData.map((item) => [item.id, item]))
  const newData = {
    id: null,
    pid: null,
    name: '部门',
    fullname: `${item.fullname}-部门`,
    type: 0,
    isEntity: false,
    leaderId: null,
    leaderName: '',
    order: 1,
    status: 1,
    level: null,
    path: item.path,
    children: []
  }

  switch (direction) {
    case 'child':
      newData.pid = item.id
      newData.level = item.level + 1
      newData.order = item.children.length + 1
      break
    case 'previous':
    case 'next':
      const siblings = orgData.filter((node) => node.pid == item.pid).sort((a, b) => a.order - b.order)
      // 在兄弟节点中找到插入位置的索引
      const insertIndex = siblings.findIndex((node) => node.id === item.id) + (direction === 'next' ? 1 : 0)
      newData.pid = item.pid
      newData.level = item.level
      newData.path = orgMap.get(item.pid).path

      // 先确定新节点的order：插入位置的前一个节点的order + 1
      if (direction === 'previous') {
        newData.order = insertIndex === 0 ? 1 : siblings[insertIndex - 1].order + 1
      } else if (direction === 'next') {
        newData.order = item.order + 1
      }
      // 更新兄弟节点的order，从插入节点后开始更新
      siblings.slice(insertIndex).forEach((node, index) => {
        if (node.order <= newData.order + index) {
          node.order = newData.order + index + 1
          node.needUpdate = true
        }
      })
      // 从orgData中提取需要更新的数据
      const updateItems = siblings.filter((item) => item.needUpdate).map(({ id, path, level, order, pid }) => ({ id, path, level, order, pid }))
      if (updateItems.length > 0) {
        // console.log('需要更新的节点:', updateItems)
        await API.org.reorder(updateItems)
      }
      break
  }

  const resData = await API.org.add(newData)
  orgData.push(resData)
  orgTree.value = buildTree(orgData)
}

// 拖拽后的重新排序
const reorder = async (el) => {
  const orgMap = new Map(orgData.map((item) => [item.id, item]))

  const pid = el.parentElement.closest('li').dataset.id
  const src = orgMap.get(+el.dataset.id)
  const parent = orgMap.get(+pid)
  const needUpdateChildren = +pid !== src.pid // 如果拖动的父节点发生变化，则需要更新所有子节点

  // 更新其他相关数据
  src.pid = +pid
  src.path = parent.path + '-' + src.id
  src.level = src.path.split('-').length
  src.needUpdate = true

  // 更新子节点数据
  if (needUpdateChildren) {
    const updateChildren = (node) => {
      const children = orgData.filter((item) => item.pid === node.id)
      children.forEach((child) => {
        child.path = src.path + '-' + child.id
        child.level = child.path.split('-').length
        child.needUpdate = true
        updateChildren(child)
      })
    }

    updateChildren(src)
  }

  const siblingsElements = Array.from(el.parentElement?.children)

  // 获取新的兄弟节点列表
  const siblings = orgData.filter((node) => node.pid === +pid)
  siblings.forEach((item) => {
    const newOrder = siblingsElements.findIndex((child) => child.dataset.id == item.id) + 1
    if (item.order !== newOrder) {
      item.order = newOrder
      item.needUpdate = true
    }
  })
  orgTree.value = buildTree(orgData)

  // 从orgData中提取需要更新的数据
  const updateItems = orgData.filter((item) => item.needUpdate).map(({ id, path, level, order, pid }) => ({ id, path, level, order, pid }))
  if (updateItems.length > 0) {
    // console.log('需要更新的节点:', updateItems)
    await API.org.reorder(updateItems)
  }
  orgData = await API.org.list()
}

const remove = async (path) => {
  const res = await API.org.remove(path)
  // 从orgData中移除指定path及其子级
  orgData = orgData.filter((item) => item.path !== path && !item.path.startsWith(path + '-'))
  // 重建组织树
  orgTree.value = buildTree(orgData)
}

onMounted(() => {
  initData()
  orgDnD.init()
  const container = document.querySelector('.main')
  new PerfectScrollbar(container)
  new Drag(document.querySelector('.ps'))
})
</script>

<style scoped lang="scss">
.main {
  position: relative;
  display: block;
  overflow: hidden !important;
  position: relative;
  cursor: grab;
  max-width: calc(100vw - 270px);
  max-height: calc(100vh - 65px);
  background-image: radial-gradient(circle, var(--border-tertiary) 0.5px, transparent 0.5px);
  background-size: 15px 15px;
  background-position: 20px 20px;
}

.canvas {
  position: relative;
}

#scaler {
  transform: scale(1);
  transform-origin: center top;
  flex-shrink: 0;
  flex-grow: 0;
  height: fit-content;
  width: fit-content;
  user-select: none;
  display: block;
  margin: 0;
  padding: 0;
}

#root {
  margin: 0 auto;
  padding: 0;
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

#nodes {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

#zoom {
  position: fixed;
  display: flex;
  flex-direction: row;
  left: 280px;
  bottom: 50px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  z-index: 100;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 2px 2px 4px 0 var(--shadow-primary);
  .item {
    user-select: none;
    border-radius: 8px;
    padding: 8px;
    line-height: 20px;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
  }
}
</style>
