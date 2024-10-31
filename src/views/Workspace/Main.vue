<template>
  <h1 className="text-3xl font-bold underline">Hello world!</h1>
  <div class="block pl-5 pt-5">
    <div class="flex gap-3">
      <a-button @click="handleConcurrentClick">并发测试</a-button>
      <a-button @click="handleClick">OPEN AI Test</a-button>
      <div class="whitespace-pre-line">{{ aaa }}</div>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "title": "main",
    "isNav": false
  }
}
</route>

<script setup>
import { ref } from 'vue'
import CryptoJS from 'crypto-js'
import API from '../../api/API'
import FetchEventSource from '../../api/fetcheventsource'
const aaa = ref('')

// OpenAI test
// SSE Server-Sent Events
const handleClick = async () => {
  var encryptedData = '3k3tbrBUdf4Gpkqhj4eIUIfngJnzqcleA8IX+jjqqc0xJoA3wMsGY7msQoHUom4jMmxXsGb5N/uUreqdzhnLj45Li4fC3Z52ndN714dyaYEiIXR9H51mDXKWv5oM7ZOs'
  var key = CryptoJS.enc.Utf8.parse('8Co5CsG5yrH0VT7M')
  var iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')

  // 解密
  var decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  })

  // 解析解密后的数据，转换为JSON对象
  var decryptedJson = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

  // 现在你可以使用 `decryptedJson` 对象
  console.log(decryptedJson)

  const baseUrl = 'http://127.0.0.1:3000/account/hello'
  const eventFetch = new FetchEventSource()

  eventFetch.startFetchEvent(
    baseUrl,
    {},
    (res) => {
      aaa.value += res
    },
    () => {
      console.log('end')
    },
    (error) => {
      console.log(error, 'error')
    }
  )
}

const handleConcurrentClick = async (e) => {
  const num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  num.forEach(async (item) => {
    const result = await API.account.hello1(item)
    console.log(result)
  })
}
</script>
