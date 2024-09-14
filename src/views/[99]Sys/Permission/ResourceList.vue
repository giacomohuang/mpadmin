<template>
  <ul v-if="data">
    <li v-for="(resource, index) in data" draggable="true" :key="resource.id" class="pl-4" :class="['list-' + resource.id, { show: show(resource.path) }]" @mousedown="mousedown" :data-id="resource.id" :data-pid="resource.pid">
      <div class="item group">
        <div class="flex flex-row items-center gap-1">
          <icon name="arrow-down" v-if="resource.pid > 0 && resource.type === 1" size="2em" class="cursor-pointer transition-transform" :class="{ '-rotate-90': collapseItems.has(resource.id) }" @click="toggle(resource.id)"></icon>
          <div class="ml-8" v-else-if="resource.type > 1"></div>
          <a-checkbox class="text-base" v-model:checked="resource.checked" @change="check(resource)">
            <span class="resource-name">{{ resource.name }}</span>
          </a-checkbox>
          <span class="tag green">id:{{ resource.id }}</span>
          <span class="tag red">order:{{ resource.order }}</span>

          <span color="default" class="tag gray clickable-item mr-2 cursor-pointer" title="点击复制到剪贴板" v-if="resource.code" @click="copyToClipBoard($event, resource.code)">
            {{ resource.code }}
          </span>
        </div>
        <div class="tools flex items-center">
          <icon name="edit" class="edit" @click="openEditor(resource, 'edit')"></icon>
          <icon name="add" v-if="resource.type === 1" class="add" @click="openEditor(resource, 'add')"></icon>
          <icon name="del" class="del" @click="confirm($event, resource.path)"></icon>
        </div>
      </div>

      <ResourceList :data="resource.children" :pid="resource.id" @open="openEditor" @remove="remove" />
    </li>
  </ul>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, onMounted } from 'vue'

const collapseItems = ref(new Set())
const { data, pid } = defineProps(['data', 'pid'])
const emits = defineEmits(['open', 'remove'])

function check(resource) {
  data.forEach((item) => {
    if (item.id !== resource.id && item.path?.startsWith(resource.path + '-')) {
      item.checked = resource.checked
    }
  })
}

function show(path) {
  let show = true
  collapseItems.value.forEach((item) => {
    if (path.startsWith(item + '-')) {
      show = false
      return
    }
  })
  return show
}

function mousedown(ev) {
  ev.stopPropagation()
}
function toggle(id) {
  if (collapseItems.value.has(id)) {
    collapseItems.value.delete(id)
  } else {
    collapseItems.value.add(id)
  }
}

function collapse(path) {
  collapseItems.value.add(path)
}

function confirm(ev, path) {
  remove(ev, path)
}

function remove(ev, path) {
  emits('remove', ev, path)
}

function openEditor(parent, mode) {
  emits('open', parent, mode)
}

function copyToClipBoard(ev, text) {
  ev.stopPropagation()
  navigator.clipboard.writeText(text)
  const clickableItem = ev.target
  if (clickableItem.nextSibling?.classList.value == 'checkmark') return
  const checkmark = document.createElement('span')
  checkmark.classList.add('checkmark')
  checkmark.textContent = '✓'
  clickableItem.insertAdjacentElement('afterend', checkmark)
  setTimeout(() => {
    checkmark.remove()
  }, 1800) // 3000 毫秒即 3 秒后消失
}

/*

// :class="[{ dragging: index === dragIndex.src }, { target: index === dragIndex.target && dragIndex.src !== dragIndex.target }, { top: dragIndex.src > dragIndex.target }]"
// @dragstart="onDragStart($event, resource.id, index)"
// @dragover="onDragOver($event, resource.id, index)"
// @drop="onDrop"

function onDragStart(ev, id, index) {
  // ev.preventDefault()
  ev.stopPropagation()
  ev.target.addEventListener('dragend', (ev) => {
    dragIndex.src = null
    dragIndex.target = null
  })
  ev.dataTransfer.effectAllowed = 'move'
  // ev.dataTransfer.setData('text/plain', '')
  // var transparentPixel = new Image(4, 4)
  // transparentPixel.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  // ev.dataTransfer.setDragImage(transparentPixel, 0, 0)
  // ev.tsartgetstyle.display = 'none'
  dragIndex.src = index
}
function onDragOver(ev, id, index) {
  ev.preventDefault() // 阻止默认的拖动行为
  ev.stopPropagation()
  dragIndex.target = index
}

function onDrop(ev) {
  ev.preventDefault()
  ev.stopPropagation()
  if (dragIndex.src !== dragIndex.target) {
    const draggedItem = data[dragIndex.src]
    data.splice(dragIndex.src, 1)
    data.splice(dragIndex.target, 0, draggedItem)
  }
  dragIndex.src = null
  dragIndex.target = null
}

*/

let sourceEl

onMounted(() => {
  const list = document.querySelector(`.list-${pid}`)
  if (!list) return
  list.ondragstart = (e) => {
    e.stopPropagation()
    sourceEl = e.target
    // collapse(el.dataset.path)
    console.clear()
    console.log('sourceEl', sourceEl.dataset.id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      sourceEl.classList.add('dragging')
    }, 0)
  }
  list.ondragover = (e) => {
    e.stopPropagation()
    e.preventDefault()
  }
  list.ondragenter = (e) => {
    e.stopPropagation()
    e.preventDefault()

    drag(e)
  }
  list.ondragend = (e) => {
    e.stopPropagation()
    e.preventDefault()
    sourceEl.classList.remove('dragging')
  }
  list.ondrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
  }
  function drag(e) {
    const targetEl = e.target.closest('li')
    console.log(sourceEl, targetEl.dataset.id)
    if (targetEl === list || targetEl === sourceEl) {
      return
    }

    const itemsEl = [...list.children]
    // const childrenEl = itemsEl.filter((item) => item.dataset.path.startsWith(sourceEl.dataset.path))
    const sourceIndex = itemsEl.indexOf(sourceEl)

    const targetIndex = itemsEl.indexOf(targetEl)

    // if (targetIndex === -1 || sourceIndex === -1 || sourceEl.dataset.pid !== targetEl.dataset.pid) return

    console.log(itemsEl, sourceEl.dataset.id, targetEl.dataset.id)
    console.log('source', sourceEl.dataset.id, 'target', targetEl.dataset.id)
    const oldTop = targetEl.getBoundingClientRect().top
    if (sourceIndex < targetIndex) {
      list.insertBefore(sourceEl, targetEl.nextElementSibling)
    } else {
      list.insertBefore(sourceEl, targetEl)
    }
    const newTop = targetEl.getBoundingClientRect().top
    const offset = oldTop - newTop
    let animation = targetEl.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }], { duration: 50, easing: 'ease-in-out' })
    animation.onfinish = () => {
      animation = null
      targetEl.style.removeProperty('transform')
    }
  }
})
</script>

<style lang="scss" scoped>
.dragging {
  background: var(--bg-secondary) !important;
  > * {
    opacity: 0;
  }
}
// 避免在拖拽时触发子级元素事件
.list:has(.dragging) {
  .item > * {
    pointer-events: none;
  }
  .item > .tools {
    display: none;
  }
}
.content-visibility {
  content-visibility: auto;
  height: 50px;
  contain-intrinsic-size: 50px;
}

//保证在js中可以成功调用
:deep(.checkmark) {
  @apply text-green-700 transition-opacity duration-150 ease-in-out;
  animation: appear 1s forwards;
  font-size: 10px;
  position: relative;
  @keyframes appear {
    0% {
      opacity: 1;
      top: 0px;
    }
    100% {
      opacity: 0;
      top: -10px;
    }
  }
}

.item {
  @apply relative flex cursor-move items-center justify-between border-b border-primary bg-primary py-3;
}
.tools {
  @apply opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100;
}
.del {
  @apply mr-2 cursor-pointer text-red-600;
}
.add {
  @apply mx-2 cursor-pointer text-brand-600;
}
.edit {
  @apply mx-2 cursor-pointer text-green-600;
}

.tag {
  @apply rounded-md border px-2 py-[2px] text-xs text-gray-800;
  &.gray {
    @apply border-primary bg-gray-50;
  }
  &.green {
    @apply border-green-300 bg-green-50;
  }
  &.blue {
    @apply border-blue-200 bg-blue-50;
  }
  &.red {
    @apply border-red-200 bg-red-50;
  }
}

// li {
//   &.target {
//     &:before {
//       z-index: 100;
//       content: ' ';
//       width: 10px;
//       height: 10px;
//       margin-left: 20px;
//       border: 2px solid #1b7ac7;
//       border-radius: 50%;
//       bottom: -6px;
//       position: absolute;

//       // left: 0;
//     }
//     &:after {
//       content: ' ';
//       width: 400px;
//       height: 0;
//       border-bottom: 2px solid #1b7ac7;
//       margin-left: 29px;
//       position: absolute;
//       bottom: -2px;
//       z-index: 100;
//     }
//   }
//   &.top {
//     &:before {
//       top: -5px;
//     }
//     &:after {
//       top: -1px;
//     }
//   }
// }
</style>
