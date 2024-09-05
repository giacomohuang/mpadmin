<template>
  <template v-for="resource in data.filter((item) => item.pid === pid)" :key="resource.id">
    <div class="content-visibility group relative flex items-center justify-between border-b border-primary py-3">
      <div class="flex flex-row items-center">
        <icon name="arrow-down" v-if="resource.id !== null && resource.type === 1" size="2em" class="cursor-pointer transition-transform" :class="{ 'rotate-180': collapseItems.has(resource.id) }" @click="collapse(resource.id)"></icon>
        <div class="ml-8" v-else></div>
        <a-checkbox class="text-base" v-model:checked="resource.checked" @change="onChange(resource.path, resource.checked)">
          <span>{{ resource.name }}</span>
        </a-checkbox>
        <a-tag color="default" class="mr-2 cursor-pointer" title="点击复制到剪贴板" v-if="resource.code" @click="copyToClipBoard(resource.code)">
          {{ resource.code }}
        </a-tag>
      </div>
      <div class="flex items-center">
        <icon name="add" v-if="resource.type === 1" class="mx-2 cursor-pointer text-brand-600 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100" @click="add(resource.id)"></icon>
        <a-popconfirm v-if="resource.id" title="该资源与其所有的子资源都将被删除" ok-text="删除" cancel-text="取消" @confirm="remove(data, resource.id)">
          <icon name="del" class="mr-2 cursor-pointer text-red-600 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100"></icon>
        </a-popconfirm>
      </div>
    </div>
    <div v-if="!collapseItems.has(resource.id)" class="ml-3">
      <ResourceList :data="data" @add="add" :pid="resource.id" />
    </div>
  </template>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
const collapseItems = ref(new Set())

const { data, pid } = defineProps(['data', 'pid'])
const emits = defineEmits(['add'])
// const data = props.day/

function onChange(path, isChecked) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].path.startsWith(path + '-')) {
      data[i].checked = isChecked
    }
  }
}

function add(id) {
  emits('add', id)
}

function remove(data, id) {
  // 遍历顶层数组
  for (let i = data.length - 1; i >= 0; i--) {
    const item = data[i]
    if (item.id === id) {
      data.splice(i, 1)
    }
    if (item.children) {
      remove(item.children, id)
    }
  }
}

function collapse(id) {
  if (collapseItems.value.has(id)) {
    collapseItems.value.delete(id)
  } else {
    collapseItems.value.add(id)
  }
}

function copyToClipBoard(text) {
  navigator.clipboard.writeText(text)
}
</script>

<style lang="scss" scoped>
.content-visibility {
  height: 50px;
  content-visibility: auto;
  contain-intrinsic-size: 50px;
}
</style>
