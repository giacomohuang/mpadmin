<template>
  <div class="m-5 flex items-center gap-3">
    <a-button @click="permissionEditor = true">创建权限点</a-button>
    <a-button @click="groupEditor = true">创建组</a-button>
    <div class="relative flex items-center">
      <icon name="search" class="absolute m-2"></icon>
      <input class="h-8 w-56 rounded-md border border-secondary bg-primary px-8 outline-none duration-300 focus:border-brand-500 focus:ease-in" placeholder="搜索组或权限点名称" v-model="keywords" />
    </div>
  </div>
  <div class="m-5">
    <div v-for="item in permissionsFiltered">{{ item.name }}</div>
  </div>

  <a-drawer title="权限点编辑" size="normal" :open="permissionEditor" @close="permissionEditor = false">
    <a-form ref="permissionFormRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="角色名称" :wrapper-col="{ span: 20 }" name="name" required>
        <a-input v-model:value="permissionForm.name" />
      </a-form-item>
      <a-form-item label="描述" :wrapper-col="{ span: 20 }" name="description">
        <a-input v-model:value="permissionForm.description" />
      </a-form-item>
      <a-form-item label="权限点" :wrapper-col="{ span: 20 }" name="permissions" required>
        <a-button>选择</a-button>
        <p class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-8 text-gray-500">权限点1 权限点2 权限点3</p>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6 }">
        <a-button type="primary">保存</a-button>
        <a-button type="link">取消</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
// import vDebounce from '@/directives/debounce'
import debounceRef from '@/js/debounceRef'
import API from '@/api/API'
const permissions = ref([{ name: 'giacomo' }, { name: 'github' }, { name: 'mamamiya' }])

const groups = ref([])

const permissionEditor = ref(false)
const groupEditor = ref(false)

const permissionFormRef = ref(null)
const permissionForm = reactive({})

const groupFormRef = ref(null)
const groupForm = reactive({})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const keywords = debounceRef('', 500)

const isLoading = ref(false)

const permissionsFiltered = computed(() => {
  if (keywords.value) {
    return permissions.value.filter((item) => {
      return item.name.includes(keywords.value)
    })
  } else {
    return permissions.value
  }
})

onMounted(async () => {
  isLoading.value = true
  // const permissions = await API.Permission.getPermissionGroups()
  // const groups = await API.Permission.getPermissions()
})

// const search = () => {
//   permissionsFiltered.value = permissions.value.filter((item) => {
//     return item.name.includes(keywords.value)
//   })
// }
const handleTableChange = async (p, filters, sorter) => {
  const query = {}
  if (filters.enable2FA) {
    query.enable2FA = filters.enable2FA[0]
  }
  if (filters.status) {
    query.status = filters.status[0]
  }
  console.log('query', filters, query)
  // for (const filter in filters) {
  //   if (filter) {
  //     query[filter] = filters[filter][0]
  //   }
  // }
  isLoading.value = true
  const result = await API.account.list(p.current - 1, p.pageSize, query)
  permissions.value = result.permissions
  pagination.total = result.total
  pagination.current = p.current
  pagination.pageSize = p.pageSize
  isLoading.value = false
}
</script>
