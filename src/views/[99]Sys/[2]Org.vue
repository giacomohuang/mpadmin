<template>
  <div class="main">
    <div id="canvas">
      <div id="scaler">
        <div id="nodes" ref="orgRef">
          <OrgNode v-if="is_ready" :data="org_data.children" :level="0" @add="add"></OrgNode>
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

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6)

// “+"按钮对应的节点ID
const active_nodeid = ref('')
// 当前编辑节点
const editing_node = ref('')
// 侧边栏打开状态
const drawer = ref(false)
// 画布缩放倍率
const zoom_percent = ref(100)
// 主数据
const org_data = ref([])
// 是否完成初始数据异步载入
const is_ready = ref(false)
provide('active_nodeid', active_nodeid)
provide('editing_node', editing_node)
provide('org_data', org_data)
provide('drawer', drawer)

const orgRef = ref(null)
const orgDnD = new DnD(orgRef, (ids) => reorder(ids))

const buildTree = (data) => {
  // 构建树形结构
  const tree = []
  const itemMap = new Map(data.map((item) => [item.id, item]))
  data.forEach((item) => {
    // console.log(item.name, item.id, item.pid, item.path)
    const parent = item.pid === null ? tree : itemMap.get(item.pid)
    item.children = []
    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(item)
    // let index = parent.children.findIndex((itm) => item.order < itm.order)
    // if (index != -1) {
    //   parent.children.splice(index, 0, item)
    // } else {
    //   parent.children.push(item)
    // }
  })
  console.log(tree)
  return tree
}
// 数据初始化
async function initData() {
  let res = await API.org.list()
  org_data.value = buildTree(res)
  // console.log('data loaded:', t)
  is_ready.value = true
  nextTick(() => {
    center()
  })
}

function add(items, index, flag) {
  //direction: previous/next/parent/child
  const data = {
    id: nanoid(),
    name: '部门',
    type: 0,
    isEntity: false,
    leaderId: null,
    leaderName: '',
    order: 1,
    status: 1,
    children: []
  }
  let old_item
  switch (flag) {
    case 'parent':
      if (items == null) {
        // // 如果是根节点
        // org_data.value.unshift(data)
        // org_data.value[0].children.push(org_data.value.splice(1, 1)[0])
      } else {
        old_item = items.children.splice(index, 1, data)[0]
        console.log(old_item)
        items.children[index].children.splice(1, 0, old_item)
      }
      break
    case 'child':
      if (items[index].children == null) {
        items[index].children = []
      }
      items[index].children.push(data)
      break
    case 'previous':
      items.splice(index, 0, data)
      break
    case 'next':
      items.splice(index + 1, 0, data)
      break
  }
  resizeCanvas()
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

const reorder = async (ids) => {
  console.log(reorder)
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
}
.ps {
  position: relative;
  cursor: grab;
  max-width: calc(100vw - 270px);
  max-height: calc(100vh - 65px);
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
