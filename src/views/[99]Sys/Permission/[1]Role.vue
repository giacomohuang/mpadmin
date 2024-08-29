<template>
  <div>
    <a-button type="primary" @click="openEditor = true">创建新角色</a-button>
  </div>
  <a-table
    :columns="[
      { title: $t('system.permission.role.name'), dataIndex: 'name', key: 'name' },
      { title: $t('system.permission.role.desc'), dataIndex: 'description', key: 'description' },
      {
        title: $t('system.permission.role.type'),
        dataIndex: 'type',
        key: 'type',
        filters: [
          { text: $t('common.all'), value: '0' },
          { text: $t('common.system'), value: '1' },
          { text: $t('common.custom'), value: '2' }
        ],
        defaultFilteredValue: defaultFilters['type'],
        filterMultiple: false
      },
      { title: $t('common.action'), key: 'action', width: 128, align: 'center' }
    ]"
    :dataSource="roles"
    :pagination="pagination"
    @change="handleTableChange"
    rowKey="_id"
    :loading="isLoading"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'accountname'">
        <a :href="`/account/${record._id}`">{{ record.accountname }}</a>
      </template>
      <template v-else-if="column.key === 'enable2FA'">
        <a-tag :color="record.enable2FA ? 'green' : 'red'">{{ record.enable2FA ? '已开启' : '未开启' }}</a-tag>
      </template>
      <template v-else-if="column.key === 'action'">
        <a @click="handleEdit(record._id)" href="####">{{ $t('common.edit') }}</a>
        <a-divider type="vertical" />
        <a href="####">{{ $t('common.disable') }}</a>
      </template>
      <template v-else-if="column.key === 'type'">
        <a-tag :color="record.status ? 'green' : 'blue'">{{ record.status ? $t('common.system') : $t('common.custom') }}</a-tag>
      </template>
    </template>
  </a-table>
  <a-drawer title="角色编辑" size="normal" :open="openEditor" @close="onCloseEditor">
    <a-form ref="roleFormRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="角色名称" :wrapper-col="{ span: 20 }" name="name">
        <a-input v-model:value="roleForm.name" />
      </a-form-item>
      <a-form-item label="描述" :wrapper-col="{ span: 20 }" name="description">
        <a-input v-model:value="roleForm.name" />
      </a-form-item>
      <a-form-item label="权限点" :wrapper-col="{ span: 20 }" name="permissions">
        <a-button>选择</a-button>
        <p class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-8 text-gray-500">权限点1 权限点2 权限点3</p>
      </a-form-item>
      <a-form-item>
        <a-button type="primary">保存</a-button>
        <a-button type="link">取消</a-button>
      </a-form-item>
    </a-form>
    <p>{{ editForm.id }}</p>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import API from '@/api/API'
const roles = ref([])
const openEditor = ref(false)
const editForm = reactive({})
const defaultFilters = ref({
  type: ['0']
})
const roleFormRef = ref(null)
const roleForm = reactive({})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  const result = await API.account.list(pagination.current - 1, pagination.pageSize, { status: 1 })
  roles.value = result.roles
  pagination.total = result.total
  isLoading.value = false
})
const onCloseEditor = () => {
  openEditor.value = false
}
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
  roles.value = result.roles
  pagination.total = result.total
  pagination.current = p.current
  pagination.pageSize = p.pageSize
  isLoading.value = false
}
</script>
