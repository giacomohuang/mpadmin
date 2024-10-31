<template>
  <ul v-if="data">
    <li v-for="resource in data" :key="resource.id" v-show="resourceType == 0 || resource.type <= 1 || resourceType == resource.type" :draggable="resource.pid != null" class="dragitem pl-4" :data-id="resource.id" :data-type="resource.type" :id="'_MPRES_' + resource.id">
      <div class="item group">
        <div class="flex flex-row items-center gap-1" :class="{ 'pl-6': resource.pid > 0 }">
          <icon v-if="resource.pid > 0 && resource.type === 1 && resource.children" name="arrow-down" class="absolute left-0 cursor-pointer transition-transform" :class="{ '-rotate-90': collapseIds.has(resource.id) }" @click="toggleCollapse(resource.id)" />
          <icon :name="RESTYPE[resource.type].type" :class="RESTYPE[resource.type].style"></icon>
          <span class="resource-name">{{ resource.name }}</span>
          <span class="tag red">{{ resource.id }}</span>
          <span v-if="resource.code" class="tag gray clickable-item mr-2 cursor-pointer" :title="$t('sys.permission.resource.copyToClipboard')" @click="copyToClipBoard($event, resource.code)">
            {{ resource.code }}
          </span>
        </div>
        <div class="tools flex items-center">
          <icon name="edit" size="1.8em" class="edit" @click="openEditor(resource, EDITOR_MODE.EDIT)" :title="$t('common.edit')" />
          <icon v-if="resource.type === 1" size="1.8em" name="add" class="add" @click="openEditor(resource, EDITOR_MODE.ADD)" :title="$t('sys.permission.resource.addSubResource')" />
          <icon name="del" size="1.8em" class="del" @click="confirm(resource.path, resource.pid)" :title="$t('common.del')" />
        </div>
      </div>
      <ResourceList v-show="!collapseIds.has(resource.id)" :data="resource.children" @open="openEditor" @remove="confirm" @toggleCollapse="toggleCollapse" />
    </li>
  </ul>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { inject } from 'vue'

const { data } = defineProps(['data'])
const EDITOR_MODE = { ADD: 1, EDIT: 2 }
const emits = defineEmits(['open', 'remove', 'toggleCollapse'])

const collapseIds = inject('collapseIds')
const resourceType = inject('resourceType')

const RESTYPE = {
  1: { type: 'menu', style: 'text-sky-600' },
  2: { type: 'func', style: 'text-lime-600' },
  3: { type: 'data', style: 'text-amber-600' }
}

function toggleCollapse(id) {
  emits('toggleCollapse', id)
}

function confirm(path, pid) {
  emits('remove', path, pid)
}

function openEditor(parent, mode) {
  emits('open', parent, mode)
}

function copyToClipBoard(ev, text) {
  navigator.clipboard.writeText(text)
  const clickableItem = ev.target
  if (clickableItem.nextSibling?.classList.contains('checkmark')) return
  const checkmark = document.createElement('span')
  checkmark.classList.add('checkmark')
  checkmark.textContent = '✓'
  clickableItem.insertAdjacentElement('afterend', checkmark)
  setTimeout(() => checkmark.remove(), 1800)
}
</script>

<style lang="scss" scoped>
.dragging {
  @apply border-2 border-dashed border-brand-500 bg-brand-50;
  > * {
    opacity: 0;
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

// .hide {
//   display: none;
// }

.item {
  @apply relative flex h-14 items-center justify-between border-b py-3;
}
.dragitem[draggable='true'] {
  @apply cursor-move;
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
