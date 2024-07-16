<template>
  <a-button @click="handleClick">TEST</a-button>
  <div style="white-space: pre-line">{{ aaa }}</div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
// import API from '../../api/API'
import FetchEventSource from '../../api/fetcheventsource'
const aaa = ref('')

// OpenAI test
// SSE Server-Sent Events
const handleClick = async () => {
  // const source = new EventSource('http://127.0.0.1:3000/account/hello')
  // source.addEventListener('open', () => {
  //   console.log('建立连接')
  // })

  // source.addEventListener('error', (err) => {
  //   console.log('连接出错:', err)
  //   source.close()
  // })

  // source.addEventListener('message', (event) => {
  //   // 结束则关闭链接
  //   // console.log(event.data)
  //   if (event.data.trim() === '[DONE]') {
  //     // source.close()
  //   } else {
  //     aaa.value += event.data.replace('\\x0A', '\n')
  //   }
  // })
  const baseUrl = 'http://127.0.0.1:3000/account/hello'
  const eventFetch = new FetchEventSource()

  eventFetch.startFetchEvent(
    baseUrl,
    {},
    (res) => {
      // console.log(res.replace('data:', '').replace('\\x0A', '\n'))
      aaa.value += res
      // console.log('-------end------')

      // const regex = /\\"content\\":\\"(.*?)\\"/g
      // let match
      // while ((match = regex.exec(res)) !== null) {
      //   aaa.value += match[1]
      //     .replace('\\x0A', '\n')
      //     .replace(/(\\u[0-9a-fA-F]{4})/g, function (match, p1) {
      //       return String.fromCharCode(parseInt(p1.substring(2), 16))
      //     })
      //     .replace(/\\/g, '')
      // }
      // console.log(replyMsg, 'replyMsg');
    },
    () => {
      console.log('end')
    },
    (error) => {
      console.log(error, 'error')
    }
  )
}
</script>
