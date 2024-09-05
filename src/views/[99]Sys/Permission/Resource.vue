<template>
  <div class="mb-3 flex items-center gap-3">
    <a-button @click="batchRemove(resources)">批量删除勾选项</a-button>
    <div class="relative flex items-center">
      <icon name="search" class="absolute m-2"></icon>
      <input class="h-8 w-56 rounded-md border border-secondary bg-primary px-8 outline-none duration-300 focus:border-brand-500 focus:ease-in" placeholder="搜索组或权限点名称" v-model="keywords" />
    </div>
  </div>

  <a-tabs v-model:activeKey="activeTabKey">
    <a-tab-pane v-for="root in roots" :key="root.id" :tab="root.name"></a-tab-pane>
  </a-tabs>

  <div class="w-1/2 min-w-[500px] rounded-md border border-primary" style="overflow-y: auto">
    <ResourceList :data="filteredResouces" :pid="activeTabKey" @add="addResource"></ResourceList>
  </div>

  <a-drawer title="资源编辑器" width="500px" :open="resourceEditor" @close="resourceEditor = false">
    <a-form ref="resourceFormRef" :model="resourceForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="名称" :wrapper-col="{ span: 12 }" name="name" required>
        <a-input v-model:value="resourceForm.name" />
      </a-form-item>
      <a-form-item label="编码" name="code" required>
        <a-input v-if="getPrefixCode(resources, currentId)" v-model:value="resourceForm.code" :addon-before="getPrefixCode(resources, currentId) + '.'" />
        <a-input v-else v-model:value="resourceForm.code" />
      </a-form-item>
      <a-form-item label="类型" name="type" :wrapper-col="{ span: 20 }">
        <a-radio-group v-model:value="resourceForm.type">
          <a-radio :value="1" :checked="true">页面</a-radio>
          <a-radio :value="2">功能</a-radio>
          <a-radio :value="3">数据</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="排序" name="order" :wrapper-col="{ span: 5 }">
        <a-input v-model:value="resourceForm.order" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6 }">
        <a-button type="primary">保存</a-button>
        <a-button type="link" @click="resourceEditor = false">取消</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, inject, watch, computed, nextTick } from 'vue'
// import vDebounce from '@/directives/debounce'
import debounceRef from '@/js/debounceRef'
import ResourceList from './ResourceList.vue'
import { resourceData } from './data'
import API from '@/api/API'

const keywords = debounceRef('', 500)

const filteredResouces = computed(() => {
  if (keywords.value) {
    const ids = new Set()
    let items = resources.value.filter((item) => item.name.includes(keywords.value))
    if (items) {
      items.forEach((item) => {
        item.path.split('-').forEach((id) => ids.add(id))
      })
    }
    return resources.value.filter((item) => ids.has('' + item.id))
  } else {
    return resources.value
  }
})

const activeTabKey = ref(1)
const roots = ref(resourceData.filter((item) => item.pid == null))
const resources = ref(resourceData.filter((item) => item.path.startsWith(activeTabKey.value + '-')))
// console.log(resources)

// const resourcesTree = ref(buildTree(resources))
// console.log(resources)

watch(activeTabKey, (val) => {
  resources.value = resourceData.filter((item) => item.path.startsWith(activeTabKey.value + '-'))
})

// const resourcesFiltered = computed(() => {
//   // const ids = new Set()
//   // if (keywords.value) {
//   //   return buildTree(
//   //     resources.value.filter((item) => {
//   //       // console.log(item.name, keywords.value)
//   //       if (item.name.includes(keywords.value)) {
//   //         ids.add(item.id)
//   //         return true
//   //       } else if (ids.has(item.pid)) {
//   //         ids.add(item.id)
//   //         return true
//   //       } else {
//   //         return false
//   //       }
//   //     })
//   //   )
//   // } else {
//   //   return buildTree(resources.value)
//   // }
//   return buildTree(resources.value)
// })

let currentId = null

const resourceEditor = ref(false)

const resourceFormRef = ref()
const resourceForm = reactive({ type: 1 })

const isLoading = ref(false)

function buildTree(items) {
  const tree = [{ id: null, code: '', name: '页面与功能', type: 1, pid: null, children: [] }]
  const itemMap = new Map()
  for (let i = 0; i < items.length; i++) {
    itemMap.set(items[i].id, JSON.parse(JSON.stringify(items[i])))
  }
  console.log(itemMap)

  items.forEach((item) => {
    const parent = item.pid === null ? tree[0] : itemMap.get(item.pid)
    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(itemMap.get(item.id))
  })
  return tree
}

function batchRemove(items) {
  // 获取数组长度，用于后续循环
  const length = items.length
  for (let index = length - 1; index >= 0; index--) {
    // 从最后一个元素开始遍历
    const item = items[index]
    if (item.checked) {
      items.splice(index, 1) // 删除当前项
    } else if (item.children) {
      batchRemove(item.children) // 递归处理子项
    }
  }
}

function addResource(id) {
  currentId = id
  resourceEditor.value = true
  nextTick(() => {
    resourceFormRef.value.resetFields()
  })
}

const getPrefixCode = (items, id) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      return items[i].code
    } else if (items[i].children) {
      const code = getPrefixCode(items[i].children, id)
      if (code) return code
    }
  }
}

onMounted(async () => {
  isLoading.value = true
  // const resources = await API.Permission.getPermissionGroups()
  // const groups = await API.Permission.getPermissions()
})

// const search = () => {
//   resourcesFiltered.value = resources.value.filter((item) => {
//     return item.name.includes(keywords.value)
//   })
// }
</script>
