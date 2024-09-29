<template>
  <ul class="group" v-draggable="[data, { animation: 100, handle: '.title', ghostClass: 'ghost', disabled: is_drag_disabled, chosenClass: 'chosen', group: { name: level == 0 ? 'root' : 'children' } }]">
    <li v-for="(item, index) in data" class="wrapper" :class="{ draggable: level != 0 }" @mousedown.stop="">
      <div class="line-v"></div>
      <div class="node" :class="['level' + (level % 10), { root: level == 0 }]">
        <div class="handler" :class="{ show: item.id === active_nodeid }">
          <div class="add top" @click.stop="addNode(parent, index, 'parent')" v-if="level !== 0"><icon name="plus"></icon></div>
          <div class="add bottom" @click.stop="addNode(data, index, 'child')"><icon name="plus"></icon></div>
          <div class="add left" @click.stop="addNode(data, index, 'previous')" v-if="level !== 0"><icon name="plus"></icon></div>
          <div class="add right" @click.stop="addNode(data, index, 'next')" v-if="level !== 0"><icon name="plus"></icon></div>
        </div>
        <div class="node-wrap" @mouseenter.stop="showHandler($event, item.id)">
          <div class="title">
            <div class="inputbox">
              <input v-model="item.name" @mousedown.stop="" @click.stop="" @mouseup.stop="" />
              <div class="clear" vDraggableCustom @click.stop="clearText($event, item)"><icon name="remove" size="1em"></icon></div>
            </div>
            <div class="name" vDraggableCustom @click.stop="editNodeTitle($event, item)">
              <span :placeholder="item.id">{{ item.name }}</span>
              <icon name="edit"></icon>
            </div>

            <div class="tools">
              <div class="remove" v-if="level != 0" vDraggableCustom @click.stop="removeNode(data, index)"><icon name="remove" size="1em"></icon></div>
            </div>
          </div>
          <div class="body" vDraggableCustom @click.stop="editNode($event, item)">
            <div class="leader">
              <span class="avatar"><img />张</span>
              <span class="name" :title="item.leaderName">{{ item.leaderName }}</span>
            </div>
            <div class="num"><icon name="role"></icon>1000</div>
          </div>
        </div>
      </div>
      <OrgNode :data="item.children" :level="level + 1" :parent="item" @addNode="addNode"></OrgNode>
      <ul>
        <li></li>
      </ul>
    </li>
  </ul>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, inject, onMounted, computed, stop } from 'vue'
import { vDraggable } from 'vue-draggable-plus'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('~!@#$%^&*+()-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 3)
const { data, parent, level } = defineProps(['data', 'parent', 'level'])

const emit = defineEmits(['addNode'])
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

// function onUpdate(event) {
//   console.log('onUpdate', event)
// }

// function onAdd(event) {
//   console.log('onAdd', event)
// }

// function onRemove(event) {
//   console.log('onRemove', event)
// }

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

function addNode(items, id, flag) {
  emit('addNode', items, id, flag)
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

function editNode(ev, node) {
  if (dragged) return
  // console.log(id)
  drawer.value = true
  editing_node.value = node
}

function removeNode(items, index) {
  if (dragged) return
  items.splice(index, 1)
  resize()
}

function clearText(ev, json) {
  if (dragged) return
  // console.log(ev.currentTarget.offsetParent)
  ev.currentTarget.previousElementSibling.focus()
  json.name = ''
}

function editNodeTitle(ev, json) {
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
  justify-content: top;
  padding: 0;
  margin: 0;
  list-style-type: none;
  &:not(:first-child) {
    padding-top: 20px;
  }
  &:empty {
    content: '';
    position: absolute;
    z-index: 2;
    width: calc(100% - 50px);
    height: 100px;
    left: 30px;
    top: 100px;
    // border: 1px solid red;
  }
}

.wrapper {
  display: flex;
  z-index: 1;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  position: relative;
  background: #fff;
  &:before {
    position: absolute;
    content: '';
    width: 100%;
    height: 1px;
    background: #afaacb;
  }

  &:first-child::before {
    right: 0;
    width: 50%;
  }

  &:last-child::before {
    left: 0;
    width: 50%;
  }

  &:only-child::before {
    background: #fff;
  }

  &:after {
    content: '';
    width: 10px;
    height: 100%;
    background: #fff;
    z-index: 0;
  }

  &.chosen {
    .handler {
      display: none;
    }
  }
}

.ghost {
  z-index: 3;
  // 避免叶子节点右边框不显示
  left: -2px;
  outline: 2px dashed rgb(255, 136, 0);
  .wrapper {
    &:before {
      background: #fff;
    }
  }
  div {
    visibility: hidden;
  }
}

.node {
  .handler {
    visibility: hidden;
  }
}

.node {
  position: relative;
  border-radius: 8px;
  padding: 4px;
  margin: 20px 20px 0 30px;
  z-index: 3;
  width: 180px;

  &.root {
    margin-top: 0;
  }
  cursor: default;

  &.level0 {
    background: #f29999;
    &:hover {
      box-shadow: 0px 0px 8px 0 #f29999;
    }
  }
  &.level1 {
    background: #eda763;
    &:hover {
      box-shadow: 0px 0px 8px 0 #eda763;
    }
  }
  &.level2 {
    background: #ceb0d2;
    &:hover {
      box-shadow: 0px 0px 8px 0 #ceb0d2;
    }
  }
  &.level3 {
    background: #c8adad;
    &:hover {
      box-shadow: 0px 0px 8px 0 #c8adad;
    }
  }
  &.level4 {
    background: #b3bcd9;
    &:hover {
      box-shadow: 0px 0px 8px 0 #b3bcd9;
    }
  }
  &.level5 {
    background: #b0c6cd;
    &:hover {
      box-shadow: 0px 0px 8px 0 #b0c6cd;
    }
  }
  &.level6 {
    background: #93b9fa;
    &:hover {
      box-shadow: 0px 0px 8px 0 #93b9fa;
    }
  }
  &.level7 {
    background: #9fce87;
    &:hover {
      box-shadow: 0px 0px 8px 0 #9fce87;
    }
  }
  &.level8 {
    background: #cecc87;
    &:hover {
      box-shadow: 0px 0px 8px 0 #cecc87;
    }
  }
  &.level9 {
    background: #aead93;
    &:hover {
      box-shadow: 0px 0px 8px 0 #aead93;
    }
  }

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
    left: calc(50% - 13px);
  }
  &.bottom {
    bottom: -16px;
    left: calc(50% - 13px);
  }
  &.left {
    top: calc(50% - 7px);
    left: -16px;
  }
  &.right {
    top: calc(50% - 7px);
    right: -16px;
  }
}

.line-v {
  position: absolute;
  width: 1px;
  height: 100%;
  z-index: 0;
  background-color: #afaacb;
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
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    // border: 1px solid #f1f1f1;
    background-image: linear-gradient(180deg, #ffbb72 0%, #ff962d 100%);
    color: #fff;
    font-size: 14px;
    overflow: hidden;
  }
  .name {
    overflow: hidden;
    white-space: nowrap;

    width: 50px;
    margin-left: 4px;
  }
}
</style>
