<template>
  <a-table
    :columns="[
      { title: $t('account.accountlist.accountname'), dataIndex: 'accountname', key: 'accountname' },
      { title: $t('account.accountlist.realname'), dataIndex: 'realname', key: 'realname' },
      { title: $t('account.accountlist.email'), dataIndex: 'email', key: 'email' },
      { title: $t('account.accountlist.phone'), dataIndex: 'phone', key: 'phone' },
      { title: $t('account.accountlist.2fa'), dataIndex: 'enable2FA', key: 'enable2FA' },
      { title: $t('common.cpnt.action'), key: 'action', width: 120 }
    ]"
    :dataSource="accounts"
    :pagination="pagination"
    @change="handleTableChange"
    rowKey="id"
    :loading="isLoading"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'enable2FA'">
        <a-tag :color="record.enable2FA ? 'green' : 'red'">{{ record.enable2FA ? 'ON' : 'OFF' }}</a-tag>
      </template>
      <template v-else-if="column.key === 'action'">
        <a href="####">{{ $t('common.cpnt.edit') }}</a>
        <a-divider type="vertical" />
        <a href="####">{{ $t('common.cpnt.del') }}</a>
      </template>
    </template>
  </a-table>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import API from '../../api/API'

const { t, locale } = useI18n()

const accounts = ref([])
const isLoading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

onMounted(async () => {
  isLoading.value = true
  const result = await API.account.list(pagination.current - 1, pagination.pageSize)
  accounts.value = result.accounts
  pagination.total = result.total
  isLoading.value = false
})

const handleTableChange = async (p) => {
  isLoading.value = true
  console.log(pagination.current)
  const result = await API.account.list(p.current - 1, p.pageSize)
  accounts.value = result.accounts
  pagination.total = result.total
  pagination.current = p.current
  pagination.pageSize = p.pageSize
  isLoading.value = false
}
</script>
<style lang="scss" scoped></style>
