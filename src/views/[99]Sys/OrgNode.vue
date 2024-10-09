<template>
  <ul class="group" v-draggable="[data, { animation: 100, onChange: onChange, handle: '.title', ghostClass: 'ghost', disabled: is_drag_disabled, chosenClass: 'chosen', group: { name: level == 0 ? 'root' : 'children' } }]">
    <li v-for="(item, index) in data" class="wrapper" :class="{ draggable: level != 0 }" @mousedown.stop="" :key="item.id">
      <div class="node" :class="['level' + (level % 10), { root: level == 0 }, { leaf: item.children?.length == 0 }]">
        <div class="handler" :class="{ show: item.id === active_nodeid }">
          <div class="add top" @click.stop="add(parent, index, 'parent')" v-if="level !== 0"><icon name="plus"></icon></div>
          <div class="add bottom" @click.stop="add(data, index, 'child')"><icon name="plus"></icon></div>
          <div class="add left" @click.stop="add(data, index, 'previous')" v-if="level !== 0"><icon name="plus"></icon></div>
          <div class="add right" @click.stop="add(data, index, 'next')" v-if="level !== 0"><icon name="plus"></icon></div>
        </div>
        <div class="node-wrap" @mouseenter.stop="showHandler($event, item.id)">
          <div class="title">
            <div class="inputbox">
              <input v-model="item.name" @mousedown.stop="" @click.stop="" @mouseup.stop="" />
              <div class="clear" @click.stop="clearText($event, item)"><icon name="remove" size="1em"></icon></div>
            </div>
            <div class="name" vDraggableCustom @click.stop="editTitle($event, item)">
              <span :placeholder="item.id">{{ item.name }}</span>
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
const active_nodeid = inject('active_nodeid')
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

function onChange(dragEvent) {
  console.log(dragEvent)
}

function showHandler(ev, id) {
  // console.log('showHandler', ev.target, id)
  ev.stopPropagation()
  const el = ev.currentTarget
  // console.log(el)
  active_nodeid.value = id
  document.addEventListener('mousemove', move, true)

  function move() {
    isInObject(el)
    if (!isInObject(el)) {
      active_nodeid.value = -1
      document.removeEventListener('mousemove', move, true)
    }
  }
  function isInObject(el) {
    const elPos = getElPos(el)
    const mousePos = getMousePos()
    if (mousePos.x > elPos.left + el.offsetWidth + 30 || mousePos.x < elPos.left - 30 || mousePos.y > elPos.top + el.offsetHeight + 30 || mousePos.y < elPos.top - 30) {
      return false
    } else {
      return true
    }
  }
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
      // el.children[0].value = titleUndoText
      // console.log('undo:', title_undo_text)
      json.name = title_undo_text
      el.style.display = 'none'
      document.removeEventListener('keydown', onKeyDown)
    }
  }
  function onMouseUp(event) {
    // console.log('edit:mouseup')
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
.group {
  display: flex;
  padding: 0;
  margin: 0;
  list-style-type: none;

  &:not(:first-child) {
    padding-top: 20px;
  }
  // &:after {
  //   content: '';
  //   position: absolute;
  //   width: calc(100% - 200px);
  //   border-top: 1px solid #aead93;
  //   height: 20px;
  //   background: red;
  // }

  // 空子节点占位,拖动用
  &:empty {
    content: '';
    position: absolute;
    z-index: 2;
    width: calc(100% - 50px);
    height: 100px;
    left: 30px;
    top: 100px;
  }
}

$border-color: var(--border-tertiary);
$border-radius: 5px;

.wrapper {
  display: flex;
  z-index: 1;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  position: relative;

  &.chosen {
    // left: 2px;
    // width: 100%;
    border: 2px dashed rgb(255, 136, 0);
    &::before {
      border: 0 !important;
    }

    &::after {
      border: 0 !important;
    }

    .wrapper::before {
      border: 0 !important;
    }
    .node::before {
      border: 0 !important;
    }

    .node::after {
      border: 0 !important;
    }
    .handler {
      visibility: hidden;
    }
  }

  &::before {
    content: '';
    position: absolute;
    height: 20px;
    border-color: $border-color;
    border-style: $border-radius;
  }

  // 只有一个子节点，且不是根节点，才显示竖线
  &:only-child:not(.root)::before {
    left: 50%;
    width: 1px;
    border-left-width: 1px;
  }

  // 不止一个子节点，才显示横线
  &:not(:only-child)::before {
    width: 100%;
    border-top-width: 1px;
  }

  // 不是第一个也不是最后一个节点，需要显示T字形线段，所以借用node节点的before显示竖线
  &:not(:first-child):not(:last-child) {
    > .node::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      height: 20px;
      border-left: 1px solid $border-color;
    }
  }

  // 最后一个节点，并且不是单一节点，显示左圆角
  &:first-child:not(:only-child)::before {
    left: 50%;
    width: 50%;
    border-left-width: 1px;
    border-radius: $border-radius 0 0 0;
  }

  // 最后一个节点，，并且不是单一节点，显示右圆角
  &:last-child:not(:only-child)::before {
    width: 50%;
    left: 0;
    border-right-width: 1px;
    border-radius: 0 $border-radius 0 0;
    // background: red;
  }
}

.ghost {
  // outline: 2px dashed rgb(255, 136,; 0)
  // left: -2px;
  * {
    visibility: hidden;
  }
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

  &:not(.leaf)::after {
    content: '';
    position: absolute;
    margin-top: 4px;
    width: 1px;
    height: 20px;
    left: 50%;
    border-left: 1px solid $border-color;
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

    &:hover {
      .tools {
        display: flex;
      }
    }

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
      &:hover,
      &:active {
        background: #00000010;
        > svg {
          display: block;
        }
      }

      > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        // text-align: left;
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
  visibility: hidden;
  &.show {
    visibility: visible;
  }
}
.add {
  cursor: pointer;
  border: 1px solid #37f;
  color: #37f;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 8px;
  display: flex;
  z-index: 6;
  line-height: 1;
  justify-content: center;
  align-items: center;
  position: absolute;
  line-height: 0;
  background: #fff;
  box-shadow: 2px 2px 4px 0 rgba(84, 85, 90, 0.158);

  &.top {
    top: -16px;
    left: calc(50% - 8px);
  }
  &.bottom {
    bottom: -16px;
    left: calc(50% - 8px);
  }
  &.left {
    top: calc(50% - 8px);
    left: -16px;
  }
  &.right {
    top: calc(50% - 8px);
    right: -16px;
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
