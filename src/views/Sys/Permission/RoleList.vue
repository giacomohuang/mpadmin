<template>
  <ul v-if="data">
    <li v-for="role in data" :key="role.id" draggable="true" class="dragitem pl-5" :data-id="role.id" :data-type="role.type" :id="'_MPRES_' + role.id">
      <div class="item group">
        <div class="flex gap-1">
          <icon v-if="role.children" name="arrow-down" class="absolute cursor-pointer transition-transform" :class="{ '-rotate-90': collapseRoleIds.has(role.id) }" @click.stop="toggleCollapse(role.id)" />
          <!--  -->
          <div class="ml-6 flex flex-col">
            <span class="flex text-base"><icon name="role" size="1.4em" class="text-orange-600"></icon>{{ role.name }}</span>
            <span class="ml-6 py-1 text-tertiary">{{ role.description }}</span>
          </div>
        </div>
        <div class="tools flex items-center">
          <icon name="edit" size="1.8em" class="edit" @click.stop="openEditor(role, EDITOR_MODE.EDIT)" />
          <icon name="add" size="1.8em" class="add" @click.stop="openEditor(role, EDITOR_MODE.ADD)" />
          <icon name="del" size="1.8em" class="del" @click.stop="confirm(role.path)" />
        </div>
      </div>

      <RoleList v-show="!collapseRoleIds.has(role.id)" :data="role.children" @open="openEditor" @remove="confirm" @toggleCollapse="toggleCollapse" />
    </li>
  </ul>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'

const EDITOR_MODE = { ADD: 1, EDIT: 2 },
  { data } = defineProps(['data']),
  emits = defineEmits(['open', 'remove', 'toggleCollapse']),
  collapseRoleIds = inject('collapseRoleIds')

function toggleCollapse(id) {
  emits('toggleCollapse', id)
}

function confirm(path) {
  console.log(path)
  emits('remove', path)
}

function openEditor(parent, mode) {
  emits('open', parent, mode)
}
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

.item {
  @apply flex h-16 items-center justify-between border-b border-primary py-3;
}

.dragitem[draggable='true'] {
  @apply cursor-move;
}
.tools {
  @apply opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100;
}
.del {
  @apply mr-2 cursor-pointer text-red-600;
  &:hover {
    @apply text-red-400;
  }
}
.add {
  @apply mx-2 cursor-pointer text-brand-600;
  &:hover {
    @apply text-brand-400;
  }
}
.edit {
  @apply mx-2 cursor-pointer text-green-600;
  &:hover {
    @apply text-green-400;
  }
}
</style>
