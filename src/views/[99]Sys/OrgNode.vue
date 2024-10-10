<template>
  <!-- <ul class="group" v-draggable="[data, { animation: 100, onAdd: onAdd, onUpdate: onUpdate, onMove: onMove, handle: '.title', ghostClass: 'ghost', disabled: is_drag_disabled, chosenClass: 'chosen', group: { name: level == 0 ? 'root' : 'children' } }]"> -->
  <ul class="group">
    <li v-for="(item, index) in data" class="wrapper" :class="{ draggable: level != 0, root: level == 0 }" @mousedown.stop="" :key="item.id" :data-id="item.id">
      <div class="node" :class="'level' + (level % 10)" :draggable="true">
        <div class="handler">
          <div class="add top" v-if="level !== 0">
            <div class="btn"><icon name="plus" @click.stop="add(parent, index, 'parent')"></icon></div>
          </div>
          <div class="add bottom">
            <div class="btn"><icon name="plus" @click.stop="add(data, index, 'child')"></icon></div>
          </div>
          <div class="add left" v-if="level !== 0">
            <div class="btn"><icon name="plus" @click.stop="add(data, index, 'previous')"></icon></div>
          </div>
          <div class="add right" v-if="level !== 0">
            <div class="btn"><icon name="plus" @click.stop="add(data, index, 'next')"></icon></div>
          </div>
        </div>
        <div class="node-wrap">
          <div class="title">
            <div class="inputbox">
              <input v-model="item.name" @mousedown.stop="" @click.stop="" @mouseup.stop="" />
              <div class="clear" @click.stop="clearText($event, item)"><icon name="remove" size="1em"></icon></div>
            </div>
            <div class="name" @click.stop="editTitle($event, item)">
              <span :placeholder="item.id">{{ item.id }}, {{ item.name }}</span>
              <icon name="edit"></icon>
            </div>

            <div class="tools">
              <div class="remove" v-if="level != 0" @click.stop="remove(data, index)"><icon name="remove" size="1em"></icon></div>
            </div>
          </div>
          <div class="body" @click.stop="edit($event, item)">
            <div class="leader">
              <icon name="role"></icon>
              <span class="name" :title="item.leaderName">{{ item.leaderName }}</span>
            </div>
            <div class="num">1000人</div>
          </div>
        </div>
      </div>
      <OrgNode :data="item.children" :level="level + 1" :parent="item" @add="add"></OrgNode>
    </li>
  </ul>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, inject } from 'vue'
import { vDraggable } from 'vue-draggable-plus'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('~!@#$%^&*+()-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 3)
const { data, parent, level } = defineProps(['data', 'parent', 'level'])

const emit = defineEmits(['add'])
const editing_node = inject('editing_node')
const is_drag_disabled = ref(false)

const drawer = inject('drawer')
let dragged = false
let title_undo_text = ''

// 自定义指令，检测鼠标按下后是否拖动，解决拖动和点击事件的冲突
const vDraggableCustom = {
  mounted: (el) => {
    var offsetX = 0
    var offsetY = 0
    function onMouseDown(ev) {
      dragged = false
      offsetX = ev.clientX
      offsetY = ev.clientY
      console.log('----mousedown----', offsetX, offsetY)
      el.addEventListener('mouseup', onMouseUp)
    }
    function onMouseUp(ev) {
      if (Math.abs(offsetX - ev.clientX) > 5 || Math.abs(offsetY - ev.clientY) > 5) {
        console.log('----moved----', ev.clientX, ev.clientY)
        dragged = true
      }
      el.removeEventListener('mouseup', onMouseUp)
    }
    el.addEventListener('mousedown', onMouseDown)
  }
}

function onAdd(dragEvent) {
  console.log(dragEvent.data)
  console.log(dragEvent.target.closest('.wrapper').dataset.id)
}

function onUpdate(dragEvent) {
  console.log(dragEvent.data)
  console.log(dragEvent.target.closest('.wrapper').dataset.id)
}

function onMove(dragEvent) {
  console.log(dragEvent.clientLeft)
}

function add(items, id, flag) {
  console.log('aaaaaaa', items, id, flag)
  emit('add', items, id, flag)
}

function getElPos(el) {
  let Box = el.getBoundingClientRect(),
    doc = el.ownerDocument,
    body = doc.body,
    html = doc.documentElement,
    clientTop = html.clientTop || body.clientTop || 0,
    clientLeft = html.clientLeft || body.clientLeft || 0,
    top = Box.top + (self.scrollY || html.scrollTop || body.scrollTop) - clientTop,
    left = Box.left + (self.scrollX || html.scrollLeft || body.scrollLeft) - clientLeft
  return { top: top, left: left }
}

function getMousePos() {
  let x = 0,
    y = 0
  let e = window.event
  if (e.pageX) {
    x = e.pageX
    y = e.pageY
  } else {
    x = e.clientX + document.body.scrollLeft - document.body.clientLeft
    y = e.clientY + document.body.scrollTop - document.body.clientTop
  }
  return { x: x, y: y }
}

function edit(ev, node) {
  if (dragged) return
  // console.log(id)
  drawer.value = true
  editing_node.value = node
}

function remove(items, index) {
  if (dragged) return
  items.splice(index, 1)
  // resize()
}

function clearText(ev, json) {
  if (dragged) return
  // console.log(ev.currentTarget.offsetParent)
  ev.currentTarget.previousElementSibling.focus()
  json.name = ''
}

function editTitle(ev, json) {
  if (dragged) return
  // console.log('aaaaaa', json)
  const el = ev.currentTarget.previousElementSibling
  el.style.display = 'flex'
  el.children[0].focus()
  is_drag_disabled.value = true

  document.addEventListener('mousedown', onMouseDown, true)
  document.addEventListener('keydown', onKeyDown)
  title_undo_text = ''
  title_undo_text = json.name
  // console.log(title_undo_text)

  function onMouseDown(event) {
    console.log('edit:mouseddwn', isOutside(event))
    if (isOutside(event)) {
      is_drag_disabled.value = false
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  function onKeyDown(event) {
    // 记录修改前的值，用于回滚
    const key = event.keyCode
    // 回车：提交
    if (key === 13) {
      el.style.display = 'none'
      document.removeEventListener('keydown', onKeyDown)
    }
    // ESC：回滚
    if (key === 27) {
      json.name = title_undo_text
      el.style.display = 'none'
      document.removeEventListener('keydown', onKeyDown)
    }
  }
  function onMouseUp(event) {
    if (isOutside(event)) {
      el.style.display = 'none'

      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousedown', onMouseDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }

  function isOutside(event) {
    const x = event.clientX
    const y = event.clientY
    let bound = el.getBoundingClientRect()
    if (x < bound.x || x > bound.x + bound.width || y < bound.y || y > bound.y + bound.height) {
      return true
    } else {
      return false
    }
  }
}
</script>

<style scoped lang="scss">
:root:has(.dragging) {
  .handler {
    visibility: hidden !important;
  }
  .node {
    box-shadow: none !important;
  }
  .name {
    // background: none !important;
    &:hover {
      background: none !important;
    }
    > svg {
      display: none !important;
    }
  }
}

.dragging {
  .node {
    @apply bg-brand-50 outline-dashed outline-2 outline-brand-500;
  }
  .node > * {
    opacity: 0;
  }
}

$border-color: var(--border-tertiary);
$border-radius: 5px;
$border-size: 1px;
.group {
  display: flex;
  padding: 0;
  margin: 0;
  list-style-type: none;
  &:not(:first-child) {
    padding-top: 20px;
  }

  // 空子节点占位,拖动用
  &:empty {
    content: '';
    // position: absolute;
    z-index: 2;
    width: calc(100% - 40px);
    height: 50px;
    left: 30px;
    // top: 100px;
    // background: red;
  }

  // 如果节点只有一个子节点，并且不是根节点，则补一条竖线
  > :only-child:not(.root) > .node::before {
    content: '';
    position: absolute;
    z-index: 2;
    width: 50%;
    top: -20px;
    height: 20px;
    left: 50%;
    border-left: $border-size solid $border-color;
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    height: 20px;
    border-color: $border-color;
    border-style: $border-radius;
  }

  // // 只有一个子节点，且不是根节点，才显示竖线
  // &:only-child:not(.root)::before {
  //   left: 50%;
  //   width: 1px;
  //   border-left-width: $border-size;
  // }

  // 不止一个子节点，才显示横线
  &:not(:only-child)::before {
    width: 100%;
    border-top-width: $border-size;
  }

  // 不是第一个也不是最后一个节点，需要显示T字形线段，所以借用node节点的before显示竖线
  &:not(:first-child):not(:last-child) {
    > .node::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      height: 20px;
      border-left: $border-size solid $border-color;
    }
  }

  // 最后一个节点，并且不是单一节点，显示左圆角
  &:first-child:not(:only-child)::before {
    left: 50%;
    width: 50%;
    border-left-width: $border-size;
    border-radius: $border-radius 0 0 0;
  }

  // 最后一个节点，，并且不是单一节点，显示右圆角
  &:last-child:not(:only-child)::before {
    width: 50%;
    left: 0;
    border-right-width: $border-size;
    border-radius: 0 $border-radius 0 0;
  }
}

.ghost {
  width: 200px;
  height: 200px;
  @apply bg-brand-50 outline-dashed outline-2 outline-brand-500;
}

// 层级颜色
$lv-colors: (#f29999, #eda763, #ceb0d2, #c8adad, #b3bcd9, #b0c6cd, #93b9fa, #9fce87, #cecc87, #aead93);
// 使用@each指令遍历颜色数组
@each $color in $lv-colors {
  $i: index($lv-colors, $color);
  .level#{$i - 1} {
    background: $color;
    &:hover {
      box-shadow: 0px 0px 8px 0 $color;
    }
  }
}

.node {
  position: relative;
  border-radius: 8px;
  padding: 4px;
  margin: 20px 20px 0 20px;
  z-index: 3;
  width: 180px;

  &:hover > .handler {
    visibility: visible;
  }

  &:has(+ ul > li)::after {
    content: '';
    position: absolute;
    margin-top: 4px;
    width: 1px;
    height: 20px;
    left: 50%;
    border-left: $border-size solid $border-color;
  }

  &.root {
    margin-top: 0;
  }
  cursor: default;

  .title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    margin-bottom: 4px;
    color: #fff;
    background: inherit;

    .inputbox {
      display: none;
      align-content: space-between;
      align-items: center;
      position: absolute;
      z-index: 15;
      width: 100%;
      left: 0;
      // background: #ccc;
      background: #fff;
      border-radius: 3px;

      input {
        width: calc(100% - 20px);
        border-radius: 3px;
        border: 0;
        outline: 0;
        box-shadow: none;
        color: #000;
      }
      .clear {
        cursor: pointer;
        position: absolute;
        right: 3px;
        height: 12px;
        width: 12px;
        color: #fff;
        font-size: 8px;
        border-radius: 50%;
        background: #888;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: #000;
        }
      }
    }

    .name {
      display: flex;
      text-align: left;
      align-items: center;
      padding: 2px 4px;
      border-radius: 5px;
      min-width: 120px;
      max-width: 140px;
      cursor: pointer;
      z-index: 12;
      &:hover {
        background: #00000010;
        > svg {
          display: block;
        }
      }

      > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 100%;
        display: inline-block;
      }
      > svg {
        display: none;
        font-size: 14px;
      }
    }

    .tools {
      display: none;
      justify-content: right;
      background: inherit;
      position: absolute;
      right: 0;
      width: 100%;
      color: #000;
      // padding: 2px 0;

      .remove {
        cursor: pointer;
        border-radius: 4px;
        padding: 4px;
        //
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover,
        &:active {
          background: #00000010;
        }
        > svg {
          font-size: 12px;
          color: #fff;
        }
      }
    }
  }
}

.handler {
  position: absolute;
  visibility: hidden;
  top: -15px;
  left: -15px;
  bottom: -15px;
  right: -15px;
}

.add {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  @apply text-brand-600;
  &.top {
    width: 100%;
  }
  &.bottom {
    width: 100%;
    bottom: 0;
  }
  &.left {
    width: 14px;
    height: 100%;
  }
  &.right {
    right: 0;
    height: 100%;
  }

  .btn {
    z-index: 10;
    @apply border border-brand-600 bg-primary;
    border-radius: 50%;
    height: 15px;
    width: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.body {
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  padding: 6px 6px;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.leader {
  display: flex;
  align-items: center;
  color: #000;
  .name {
    overflow: hidden;
    white-space: nowrap;

    width: 50px;
    margin-left: 4px;
  }
}

.num {
  color: #000;
}
</style>
