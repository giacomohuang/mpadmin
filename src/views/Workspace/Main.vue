<template>
  <a-checkbox v-model:checked="checkState.checkAll" :indeterminate="checkState.indeterminate" @change="onCheckAllChange"> Check all </a-checkbox>
  <a-checkbox-group v-model:value="checkState.checkedList" style="width: 100%" :options="permissionData" @change="getValue"> </a-checkbox-group>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { permissionData } from './permissiondata'
const checkState = reactive({
  indeterminate: false,
  checkAll: false,
  checkedList: []
})
let userPermissionBits = {}
// const group = '1'
// userPermissionBits[group] = 1
const onCheckAllChange = (e) => {
  // console.log(e.target)
  Object.assign(checkState, {
    checkedList: e.target.checked ? keyToArray(permissionData, 'value') : [],
    indeterminate: false
  })
  console.log('aaaaa', checkState.checkedList)
  getValue(checkState.checkedList)
}

const keyToArray = (json, key) => {
  return Object.keys(json).map((k) => json[k][key])
}
// console.log(keyToArray(permissionData, 'value'))

watch(
  () => checkState.checkedList,
  (val) => {
    checkState.indeterminate = !!val.length && val.length < permissionData.length
    checkState.checkAll = val.length === permissionData.length
  }
)
function getValue(checkedList) {
  userPermissionBits = {}
  // console.log(c, pList)
  checkedList.forEach((id) => {
    const group = `p${Math.floor((id - 1) / 64) + 1}`
    let place = ((id - 1) % 64) + 1
    if (userPermissionBits[group]) {
      userPermissionBits[group] = userPermissionBits[group] | (BigInt(1) << (BigInt(place) - BigInt(1)))
    } else {
      userPermissionBits[group] = BigInt(1) << BigInt(place - 1)
    }
    // console.log(group, place, userPermissionBits[group])
  })
  console.log(userPermissionBits)
}
</script>

<style lang="scss" scoped></style>
