<template>
  {{ aaa }}
  <a-button @click="handleClick">TEST</a-button>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
const API = inject('API')
const aaa = ref('')

const handleClick = async () => {
  try {
    aaa.value = await API.account.hello()
    // console.log('aaa', aaa.value)
  } catch (err) {
    console.log(err)
  }
}
</script>
