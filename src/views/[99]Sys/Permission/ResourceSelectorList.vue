<template>
  <ul v-if="data">
    <li v-for="resource in data" :key="resource.id" v-show="resourceType == 0 || resource.type <= 1 || resourceType == resource.type" class="dragitem cursor-pointer pl-4" :data-id="resource.id" :data-type="resource.type" :id="'_MPRES_' + resource.id">
      <div class="item group" @click.stop="toggleSelect(resource.id)">
        <div class="flex flex-row items-center" :class="{ 'pl-6': resource.pid > 0 }">
          <icon v-if="resource.pid > 0 && resource.type === 1 && resource.children" name="arrow-down" size="2em" class="absolute left-0 cursor-pointer transition-transform" :class="{ '-rotate-90': collapseIds.has(resource.id) }" @click.stop="toggleCollapse(resource.id)" />
          <icon :name="RESTYPE[resource.type].type" :class="RESTYPE[resource.type].style" size="2em"></icon>
          <span class="resource-name">{{ resource.name }}</span>
          <!-- <span class="tag red">{{ resource.id }}</span> -->
          <!-- <span v-if="resource.code" class="tag gray clickable-item mr-2 cursor-pointer">{{ resource.code }}</span> -->
        </div>
        <div class="mr-2" v-if="resource.type === 1">
          <mpSwitch :checked="selectedIds.has(resource.id)" :disabled="!pidEnabled" />
        </div>
        <div class="mr-2" v-else>
          <mpCheckbox :checked="selectedIds.has(resource.id)" :disabled="!pidEnabled" />
        </div>
      </div>
      <ResourceSelectorList v-show="!collapseIds.has(resource.id)" :pidEnabled="selectedIds.has(resource.id)" :data="resource.children" @toggleCollapse="toggleCollapse" @toggleSelect="toggleSelect" />
    </li>
  </ul>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import mpSwitch from '@/components/Headless/mpSwitch.vue'
import mpCheckbox from '@/components/Headless/mpCheckbox.vue'

const { data, pidEnabled } = defineProps(['data', 'pidEnabled']),
  emits = defineEmits(['toggleCollapse', 'toggleSelect']),
  collapseIds = inject('collapseIds'),
  selectedIds = inject('selectedIds'),
  resourceType = inject('resourceType'),
  RESTYPE = {
    1: { type: 'menu', style: 'text-sky-600' },
    2: { type: 'func', style: 'text-lime-600' },
    3: { type: 'data', style: 'text-amber-600' }
  }
function toggleCollapse(id) {
  emits('toggleCollapse', id)
}

function toggleSelect(id) {
  if (pidEnabled) {
    emits('toggleSelect', id)
  }
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
.item {
  @apply relative flex h-14 items-center justify-between border-b py-3;
  &:hover {
    :deep(.mp-checkbox):not(.disabled) {
      .inner {
        border-color: #2893ff;
      }
    }
    :deep(.mp-switch):not(.disabled) {
      outline-color: #2893ff;
    }
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
