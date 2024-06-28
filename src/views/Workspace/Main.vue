<template>
  <a-button @click="handleClick">TEST</a-button>
  <div style="white-space: pre-line">{{ aaa }}</div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
const API = inject('API')
const aaa = ref('')

// SSE
const handleClick = async () => {
  aaa.value = ''
  const source = new EventSource('http://127.0.0.1:3000/account/hello')
  source.addEventListener('open', () => {
    console.log('建立连接')
  })

  source.addEventListener('error', (err) => {
    console.log('连接出错:', err)
    source.close()
  })

  source.addEventListener('message', (event) => {
    // 结束则关闭链接
    console.log(event.data)
    if (event.data.trim() === '[DONE]') {
      source.close()
    } else {
      aaa.value += event.data.replace('\\x0A', '\n')
    }
  })
}
</script>
