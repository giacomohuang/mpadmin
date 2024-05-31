<template>
  <div v-for="(group, index) in permissionData">
    <div>{{ group.groupName }} <a-checkbox v-model:checked="group.checkAll" :indeterminate="group.indeterminate" @change="onCheckAll($event, index)"> Check all </a-checkbox></div>
    <a-checkbox-group v-model:value="group.checkedList" class="group" @change="onCheckOne(index)" :options="group.data">
      <template #label="{ label }">
        <span class="checkbox-item">{{ label }}</span>
      </template>
    </a-checkbox-group>
  </div>
  <a-button @click="calcPermissions">计算</a-button>
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount, onMounted, computed } from 'vue'
import { API } from '../../api/index'
import { permission } from '../../api/permission'

let permissionData = ref([])
let userPermissionBits = {}
const groupNames = { 1: '分组1', 2: '分组2', 3: '分组3' }

// 读所有权限点，重新组装成checkbox要求的格式
API.permission.getList().then((res) => {
  const d = []
  let index = -1
  let g = -1
  res.forEach((item) => {
    if (item.groupId != g) {
      d.push({ checkAll: false, indeterminate: false, checkedList: [], groupId: item.groupId, groupName: groupNames[item.groupId], data: [] })
      index++
      g = item.groupId
      d[index].data.push({ value: item.id, label: item.name })
    } else {
      d[index].data.push({ value: item.id, label: item.name })
    }
  })
  permissionData.value = d
})

API.user.getPermissions(1).then((res) => {
  console.log(res)
})

// const group = '1'
// userPermissionBits[group] = 1
const onCheckAll = (e, index) => {
  permissionData.value[index].checkedList = e.target.checked ? keyToArray(permissionData.value[index].data, 'value') : []
  permissionData.value[index].indeterminate = false
  permissionData.value[index].checkAll = e.target.checked
}

const onCheckOne = (index) => {
  permissionData.value[index].indeterminate = permissionData.value[index].checkedList.length > 0 && permissionData.value[index].checkedList.length < permissionData.value[index].data.length
  permissionData.value[index].checkAll = permissionData.value[index].checkedList.length === permissionData.value[index].data.length
}

const keyToArray = (json, key) => {
  return Object.keys(json).map((k) => json[k][key])
}

function calcPermissions() {
  let c = []
  permissionData.value.forEach((data) => {
    c = [...c, ...data.checkedList]
  })

  userPermissionBits = {}
  c.forEach((id) => {
    const group = `p${Math.floor((id - 1) / 64) + 1}`
    let place = ((id - 1) % 64) + 1
    if (userPermissionBits[group]) {
      userPermissionBits[group] = userPermissionBits[group] | (BigInt(1) << (BigInt(place) - BigInt(1)))
    } else {
      userPermissionBits[group] = BigInt(1) << BigInt(place - 1)
    }
  })
  console.log(userPermissionBits)
}
</script>

<style lang="scss" scoped>
.group {
  display: flex;
  margin: 10px 20px 20px 20px;
  :where(label) {
    width: 180px;
  }
}
</style>
