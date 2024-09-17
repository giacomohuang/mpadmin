<template>
  <ul v-if="data" :class="`list-${pid}`">
    <li v-for="(resource, index) in data" draggable="true" :key="resource.id" class="dragitem pl-4" :data-id="resource.id" :data-pid="resource.pid">
      <div class="item group">
        <div class="flex flex-row items-center gap-1">
          <icon name="arrow-down" v-if="resource.pid > 0 && resource.type === 1" size="2em" class="cursor-pointer transition-transform" :class="{ '-rotate-90': resource.isCollapse }" @click="toggle(resource)"></icon>
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
          <icon name="del" class="del" @click="confirm(resource.id)"></icon>
        </div>
      </div>

      <ResourceList :data="resource.children" :pid="resource.id" @open="openEditor" @remove="remove" v-show="!resource.isCollapse" />
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

const { data, pid } = defineProps(['data', 'pid'])
const emits = defineEmits(['open', 'remove'])
let collapseId = null

function check(resource) {
  data.forEach((item) => {
    if (item.id !== resource.id && item.path?.startsWith(resource.path + '-')) {
      item.checked = resource.checked
    }
  })
}

function toggle(item) {
  item.isCollapse = !item.isCollapse
}

function confirm(id) {
  remove(id)
}

function remove(id) {
  emits('remove', id)
}

function openEditor(parent, mode) {
  emits('open', parent, mode)
}

function copyToClipBoard(ev, text) {
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

onMounted(() => {
  console.clear()
  let sourceEl
  const list = document.querySelector('.list-' + pid)
  if (!list) return
  // 拖拽开始
  list.ondragstart = (e) => {
    sourceEl = e.target
    const sourceId = sourceEl.dataset.id
    const sourceItem = data.find((item) => item.id == sourceId)
    if (!sourceItem.isCollapse) {
      sourceItem.isCollapse = true
      collapseId = sourceId
    } else {
      collapseId = null
    }
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      sourceEl?.classList.add('dragging')
    }, 0)
    e.stopPropagation()
  }
  list.ondragover = (e) => {
    e.stopPropagation()
    e.preventDefault()
  }

  // 进入元素
  list.ondragenter = (e) => {
    // console.log('dragenter', e.target.closest('li').dataset.id)
    e.stopPropagation()
    e.preventDefault()
    if (!sourceEl?.classList.contains('dragging')) return
    const targetEl = e.target.closest('li')
    console.log(list, sourceEl, targetEl)

    const itemsEl = [...list.children]
    const sourceIndex = itemsEl.indexOf(sourceEl)
    const targetIndex = itemsEl.indexOf(targetEl)
    // if (targetIndex === -1 || sourceIndex === -1 || sourceEl.dataset.pid !== targetEl.dataset.pid) return

    const oldTop = targetEl.getBoundingClientRect().top
    if (sourceIndex < targetIndex) {
      list.insertBefore(sourceEl, targetEl.nextElementSibling)
    } else {
      list.insertBefore(sourceEl, targetEl)
    }
    const newTop = targetEl.getBoundingClientRect().top
    const offset = oldTop - newTop
    let animation = targetEl.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }], { duration: 80, easing: 'ease-in-out' })
    animation.onfinish = () => {
      animation = null
      targetEl.style.removeProperty('transform')
    }
    console.log('dragenter')
  }

  // 拖拽结束
  list.ondragend = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (collapseId) {
      const sourceId = sourceEl.dataset.id
      const sourceItem = data.find((item) => item.id == sourceId)
      console.log(sourceItem)
      delete sourceItem.isCollapse
    }
    sourceEl?.classList.remove('dragging')
  }

  // 拖拽释放
  list.ondrop = (e) => {
    e.preventDefault()
  }
})
</script>

<style lang="scss" scoped>
.dragging {
  @apply border-2 border-dashed border-brand-500 bg-brand-50;
  > * {
    opacity: 0;
  }
}
// 避免在拖拽时触发子级元素事件
.list:has(.dragging) {
  // pointer-events: none;
  .item * {
    pointer-events: none;
  }
  .item > .tools {
    display: none;
  }
}
/* 
 * This class applies content-visibility optimization
 * It sets content-visibility to auto for better performance
 * A fixed height and contain-intrinsic-size are specified
 * to help the browser estimate the content size before rendering
 */
// .content-visibility {
//   content-visibility: auto;
//   height: 50px;
//   contain-intrinsic-size: 50px;
// }

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

.hide {
  display: none;
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
