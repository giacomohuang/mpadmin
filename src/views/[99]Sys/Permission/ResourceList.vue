<template>
  <ul class="relative">
    <template v-for="(resource, index) in data" :key="resource.id">
      <li v-if="show(resource.path)" class="title group" :style="{ 'padding-left': (resource.level - 1) * 12 + 'px' }">
        <div class="flex flex-row items-center">
          <icon name="arrow-down" v-if="resource.type === 1" size="2em" class="cursor-pointer transition-transform" :class="{ 'rotate-180': collapseItems.has(resource.id) }" @click="collapse(resource.path)"></icon>
          <div class="ml-8" v-else></div>
          <a-checkbox class="text-base" v-model:checked="resource.checked" @change="onChange(resource)">
            <span>{{ resource.name }}{{ resource.path }}</span>
          </a-checkbox>
          <a-tag color="default" class="mr-2 cursor-pointer" title="点击复制到剪贴板" v-if="resource.code" @click="copyToClipBoard(resource.code)">
            {{ resource.code }}
          </a-tag>
        </div>
        <div class="flex items-center">
          <icon name="add" v-if="resource.type === 1" class="add" @click="add(resource.id)"></icon>
          <icon name="del" class="del" @click="remove(resource.path)"></icon>
        </div>
      </li>
    </template>
  </ul>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, reactive, onMounted, watch, computed, onUnmounted } from 'vue'
const collapseItems = ref(new Set())

const { data } = defineProps(['data'])
// console.log(data)
const emits = defineEmits(['add'])
// const data = props.day/

function onChange(resource) {
  if (!resource.children) return
  resource.children.forEach((item) => {
    item.checked = resource.checked
    if (item.children) onChange(item)
  })
}

function show(path) {
  let show = true
  collapseItems.value.forEach((item) => {
    if (path.startsWith(item + '-')) {
      show = false
    }
  })
  return show
}

function add(id) {
  emits('add', id)
}

function remove(id) {
  for (let i = data.length - 1; i >= 0; i--) {
    console.log(data[i].path)
    if ((data[i].path + '-').startsWith(id + '-')) {
      data.splice(i, 1)
    }
  }
}

// function remove(data, id) {
//   // 遍历顶层数组
//   for (let i = data.length - 1; i >= 0; i--) {
//     const item = data[i]
//     if (item.id === id) {
//       console.log('hit')
//       data.splice(i, 1)
//     }
//     if (item.children) {
//       remove(item.children, id)
//     }
//   }
// }

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

// onUnmounted(() => {
//   console.log('unmounted')
//   // collapseItems.value = null
//   // data.value = null
//   // emits.value = null
// })
</script>

<style lang="scss" scoped>
.content-visibility {
  height: 50px;
  content-visibility: auto;
  contain-intrinsic-size: 50px;
}
.title {
  @apply content-visibility relative flex items-center justify-between border-b border-primary py-3;
}
.del {
  @apply mr-2 cursor-pointer text-red-600 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100;
}
.add {
  @apply mx-2 cursor-pointer text-brand-600 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100;
}
</style>
