<template>
   <a-checkbox-group v-model:value="pList" style="width: 100%" :options="permissionData" @change="getValue">
  </a-checkbox-group>
</template>

<script setup>
import {ref} from 'vue'
import {permissionData} from './permissiondata'
const pList=ref([]) 
function getValue(c){
  console.log(c,pList)
}
</script>

<style lang="scss" scoped></style>
