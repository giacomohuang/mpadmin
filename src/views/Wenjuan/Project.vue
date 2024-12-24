<template>
  <div class="project">
    <div class="header">
      <div class="left">
        <div class="title">项目</div>
      </div>
    </div>
    <ul class="list">
      <li class="item" v-for="item in wenjuan" :key="item._id" @click="handleEdit(item._id)">
        <icon name="remove" class="ico-remove" @click.stop="handleRemove(item._id)" />
        <div class="title">{{ item.name }}</div>
        <div class="time">{{ formatDate(item.updatedAt) }}</div>
      </li>
      <li class="item add" @click="handleAdd">
        <icon name="plus" />
      </li>
    </ul>
    <div class="pagination">
      <a-pagination v-model:current="current" :total="total" :pageSize="pageSize" @change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import API from '@/api/API'
import { useRouter } from 'vue-router'

const router = useRouter()
const wenjuan = ref([])
const current = ref(1)
const pageSize = ref(10)
const total = ref(0)

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleEdit = (id) => {
  router.push(`/wenjuan/editor/${id}`)
}

const handleAdd = () => {
  router.push(`/wenjuan/editor`)
}

const handleRemove = async (id) => {
  const res = await API.wenjuan.remove([id])
  if (res.acknowledged) {
    if (wenjuan.value.length === 1 && current.value > 1) {
      current.value--
    }
    await loadData()
    if (wenjuan.value.length === 0 && current.value > 1) {
      current.value--
      await loadData()
    }
  }
}

const handlePageChange = (page) => {
  current.value = page
  loadData()
}

const loadData = async () => {
  const res = await API.wenjuan.list(current.value, pageSize.value, {}, { updatedAt: -1 })
  wenjuan.value = res.wenjuan
  total.value = res.total
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.project {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-size: 1.5em;
  font-weight: bold;
}

.list {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 40px 20px;
  .item {
    position: relative;
    cursor: pointer;
    border: 1px solid var(--c-gray-300);
    background: var(--bg-primary);
    width: 200px;
    height: 150px;
    padding: 10px;
    border-radius: 5px;
    // margin-bottom: 10px;
    .title {
      font-size: 1em;
    }
    .time {
      font-size: 0.8em;
      color: var(--c-gray-500);
    }
    &:hover {
      border: 1px solid var(--c-brand);
      .ico-remove {
        opacity: 1;
      }
      &.add {
        color: var(--c-brand);
      }
    }
    &.add {
      border-style: dashed;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--bg-primary);
    }
  }
}
.ico-remove {
  opacity: 0;
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--bg-primary);
  border: 1px solid var(--c-brand);
  border-radius: 50%;
  padding: 3px;
  cursor: pointer;
  color: var(--c-brand);
  &:hover {
    border-color: var(--c-red);
    color: var(--c-red);
  }
  transition: opacity 0.15s;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
