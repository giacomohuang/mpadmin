<template>
  <div class="w-[500px] flex-col rounded-md border border-primary">
    <div class="list flex-1" ref="listRef">
      <RoleList :data="roleTree.children" @toggleCollapse="toggleCollapse" @open="openEditor" @remove="remove" />
    </div>
    <div class="flex cursor-pointer justify-center px-5 py-3">
      <div class="w-[60px] rounded-md border border-transparent py-1 text-center text-base hover:border-brand-500 hover:text-brand-500" @click="openEditor(roleTree, EDITOR_MODE.ADD)">+</div>
    </div>
  </div>
  <a-drawer title="角色编辑器" width="800px" :open="roleEditor" @close="roleEditor = false" :destroyOnClose="true">
    <a-form ref="roleFormRef" :model="roleForm" :rules="vRules" :label-col="{ span: 2 }" :wrapper-col="{ span: 22 }" @finish="submit">
      <a-form-item label="名称" :wrapper-col="{ span: 8 }" name="name">
        <a-input v-model:value="roleForm.name" />
      </a-form-item>
      <a-form-item label="描述" :wrapper-col="{ span: 20 }" name="description">
        <a-input v-model:value="roleForm.description" />
      </a-form-item>
      <a-form-item label="资源" :wrapper-col="{ span: 22 }" name="resources">
        <a-form-item-rest>
          <ResourceSelector :parentData="roleForm.parentData" />
        </a-form-item-rest>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6 }">
        <a-button type="primary" html-type="submit">保存</a-button>
        <a-button type="link" @click="roleEditor = false">取消</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, provide, nextTick } from 'vue'
import ResourceSelector from './ResourceSelector.vue'
import { DnD } from '@/js/DnD.js'
import RoleList from './RoleList.vue'
import API from '@/api/API'
const roleTree = ref([]),
  collapseRoleIds = ref(new Set()),
  listRef = ref(null),
  roleEditor = ref(false),
  roleForm = reactive({}),
  EDITOR_MODE = { ADD: 1, EDIT: 2 },
  dragAndDrop = new DnD(listRef, (ids) => reorder(ids)),
  selectedIds = ref()

let editorMode,
  roleData = null

provide('collapseRoleIds', collapseRoleIds)
provide('selectedIds', selectedIds)

const buildTree = (data) => {
  const rsdata = JSON.parse(JSON.stringify(data))

  // 构建树形结构
  const tree = []
  const itemMap = new Map(rsdata.map((item) => [item.id, item]))
  rsdata.forEach((item) => {
    const parent = item.pid === null ? tree : itemMap.get(item.pid)
    if (!parent.children) {
      parent.children = []
    }
    let index = parent.children.findIndex((itm) => item.order < itm.order)
    if (index != -1) {
      parent.children.splice(index, 0, item)
    } else {
      parent.children.push(item)
    }
  })
  return tree
}

const vRules = {
  name: [
    { required: true, message: '名称不能为空' },
    {
      validator: async (_rule, value) => {
        if (value == 'huangjia') {
          return Promise.reject('重名了')
        } else {
          return Promise.resolve()
        }
      },
      trigger: 'blur'
    }
  ]
}

function openEditor(item, mode) {
  roleEditor.value = true
  // 新增模式
  editorMode = mode
  if (editorMode === EDITOR_MODE.ADD) {
    roleForm.parentData = getParent(item.pid)
    roleForm.name = null
    roleForm.description = null
    roleForm.resources = []
    roleForm.id = null
    roleForm.pid = item.id ?? null
    roleForm.level = item?.level ? item.level + 1 : 1
    roleForm.path = item.path ?? null
    roleForm.order = item?.children ? item.children.length + 1 : 1
    selectedIds.value = new Set()

    console.log(item, mode, roleForm)
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.EDIT) {
    roleForm.parentData = getParent(item.pid)
    roleForm.name = item.name
    roleForm.description = item.description
    roleForm.resources = item.resources
    roleForm.id = item.id
    roleForm.pid = item.pid
    roleForm.level = item.level
    roleForm.path = item.path
    roleForm.order = item.order
    selectedIds.value = new Set([...item.resources])
  }
}

// 表单提交，保存数据
async function submit() {
  const { parentData, ...item } = roleForm

  // 新增模式
  if (editorMode === EDITOR_MODE.ADD) {
    item.resources = Array.from(selectedIds.value)
    const res = await API.permission.role.add(item)
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.EDIT) {
    item.resources = Array.from(selectedIds.value)
    const res = await API.permission.role.update(item)
  } else {
    throw new Error('Invalid Editor Mode.')
  }

  console.log(item)

  roleData = await API.permission.role.list(null)
  roleTree.value = buildTree(roleData)
  roleEditor.value = false
}

async function remove(id) {
  await API.permission.role.remove(id)
  roleData = await API.permission.role.list(null)
  roleTree.value = buildTree(roleData)
}

async function reorder(ids) {
  console.log(ids)
  await API.permission.role.reorder(ids)
  roleData = await API.permission.role.list(null)
  roleTree.value = buildTree(roleData)
}

function toggleCollapse(id) {
  if (collapseRoleIds.value.has(id)) {
    collapseRoleIds.value.delete(id)
  } else {
    collapseRoleIds.value.add(id)
  }
}

function clearFormData(data) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = null // 或者设置为默认值
    }
  }
}

function getParentResources(pid) {
  if (pid) {
    const parent = roleData.find((item) => item.id === pid)
    return [...parent.resources]
  }
  return null
}

function getParent(pid) {
  if (pid) {
    const parent = roleData.find((item) => item.id === pid)
    return JSON.parse(JSON.stringify(parent))
  }
  return null
}

onMounted(async () => {
  console.log('onMounted')
  roleData = await API.permission.role.list(null)
  roleTree.value = buildTree(JSON.parse(JSON.stringify(roleData)))
  dragAndDrop.init()
})

onBeforeUnmount(() => {
  dragAndDrop.destroy()
})
</script>

<style scoped lang="scss">
// 避免在拖拽时触发子级元素事件
.list:has(.dragging) {
  .item * {
    pointer-events: none;
  }
  .item > .tools {
    display: none;
  }
}

::highlight(search-results) {
  background-color: #4e9a06;
  color: white;
}

:deep(.blink) {
  border: 2px dashed #4e9a06;
  animation: blink 0.15s 6;
  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 1;
    }
    40% {
      opacity: 0;
    }
  }
}
</style>
