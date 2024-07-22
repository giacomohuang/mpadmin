<template>
  <div class="main-wrap">
    <div>
      <a-button @click="handleClick">TEST</a-button>
      <div style="white-space: pre-line">{{ aaa }}</div>
    </div>
    <div style="margin-top: 20px">
      <a-button @click="handleSelectFiles">Select Files</a-button>
      <div class="dragarea" :class="{ over: state.dragover }" @dragover.prevent @dragend="console.log('aaa')" @dragover.native="state.dragover = true" @dragleave.native="state.dragover = false" @drop="handleDropFiles">
        <label>Drag & Drops files here.</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, reactive } from 'vue'
import CryptoJS from 'crypto-js'
import SparkMD5 from 'spark-md5'
import API from '../../api/API'
import FetchEventSource from '../../api/fetcheventsource'
const aaa = ref('')
const state = reactive({
  dragover: false
})

const MAX_OBJECT_SIZE = 5 * 1024 * 1024 * 1024 * 1024
const DEF_PART_SIZE = 64 * 1024 * 1024
const calculatePartSize = (size) => {
  if (typeof size !== 'number') {
    throw new TypeError('size should be of type "number"')
  }
  if (size > MAX_OBJECT_SIZE) {
    throw new TypeError(`size should not be more than ${MAX_OBJECT_SIZE}`)
  }
  let partSize = DEF_PART_SIZE
  for (;;) {
    // while(true) {...} throws linting error.
    // If partSize is big enough to accomodate the object size, then use it.
    if (partSize * 10000 > size) {
      return partSize
    }
    // Try part sizes as 64MB, 80MB, 96MB etc.
    partSize += 16 * 1024 * 1024
  }
}

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

const handleDropFiles = async (e) => {
  e.preventDefault()
  state.dragover = false
  const fileHandlesPromises = [...e.dataTransfer.items].filter((item) => item.kind === 'file').map((item) => item.getAsFileSystemHandle())
  for await (const handle of fileHandlesPromises) {
    if (handle.kind === 'directory') {
      console.log(`Directory: ${handle.name}`)
    } else {
      console.log(`File: ${handle.name}`)
    }
  }
}
const handleSelectFiles = async () => {
  let handles
  try {
    handles = await window.showOpenFilePicker({
      description: '图片类型',
      accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg'] },
      multiple: true
    })
  } catch (err) {
    console.log('cancel')
    return
  }

  handles.forEach(async (handle) => {
    const file = await handle.getFile()

    const onProgress = (progress) => {
      console.log(`Progress: ${(progress * 100).toFixed(2)}%`)
    }
    let chunkSize = calculatePartSize(file.size)
    console.log('ChunkSize:', chunkSize)
    const chunks = await chunkFile(file, chunkSize, onProgress)
    // console.log(chunks)
    const result = await API.oss.initNewMultipartUpload(file.name)
    const { uploadId, oldTags } = result
    await upload(chunks, file.name, file.size, uploadId, oldTags)
  })
}

function hexToBase64(hexStr) {
  const bytes = new Uint8Array(hexStr.length / 2)
  for (let i = 0; i < hexStr.length; i += 2) {
    bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16)
  }
  return btoa(String.fromCharCode.apply(null, bytes))
}
const chunkFile = async (file, chunkSize = 5 * 1024 * 1024) => {
  const chunks = []
  let partNumber = 0
  let loaded = 0
  const total = file.size

  while (true) {
    const start = loaded
    const end = Math.min(start + chunkSize, total)
    const chunk = file.slice(start, end)
    chunks.push({ file: chunk, partNumber })
    partNumber++
    loaded = end
    if (loaded >= total) {
      return chunks
    }
  }
}

// async function chunkFileMD5(file, chunkSize = 5 * 1024 * 1024, updateProgress) {
//   const chunks = []
//   const spark = new SparkMD5.ArrayBuffer()
//   let loaded = 0
//   const total = file.size

//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     let partNumber = 0

//     // 使用requestIdleCallback来确保UI线程不会被阻塞
//     const processNextChunk = () => {
//       if (loaded >= total) {
//         resolve(chunks)
//         return
//       }

//       const start = loaded
//       const end = Math.min(start + chunkSize, total)
//       const chunk = file.slice(start, end)

//       reader.onloadend = () => {
//         spark.append(reader.result)
//         const hash = hexToBase64(spark.end())
//         chunks.push({ file: chunk, hash, partNumber })
//         partNumber++
//         loaded = end
//         updateProgress(loaded / total)
//         requestIdleCallback(processNextChunk)
//       }

//       reader.onerror = reject
//       reader.readAsArrayBuffer(chunk)
//     }

//     requestIdleCallback(processNextChunk)
//   })
// }

const upload = async (chunks, filename, totalSize, uploadId, oldTags) => {
  let etags = []
  let percent = 0
  let uploaded = 0
  for (let i = 0; i < chunks.length; i++) {
    let chunkUploaded = 0
    const formData = new FormData()
    const partNumber = i + 1
    const matchingTag = oldTags?.find((tag) => tag.part === partNumber)
    if (matchingTag) {
      etags.push(matchingTag)
    } else {
      formData.append('file', chunks[i].file)
      formData.append('filename', encodeURIComponent(filename))
      formData.append('uploadId', uploadId)
      formData.append('partNumber', partNumber)
      // formData.append('hash', chunks[i].hash)
      formData.append('oldTags', JSON.stringify(oldTags))
      const etag = await API.oss.uploadPart(formData, (progress) => {
        console.log(totalSize, uploaded, progress)
        chunkUploaded = progress
        percent = ((uploaded + chunkUploaded) / totalSize).toFixed(2) * 100
        console.log(percent + '%')
      })
      etags.push(etag)
    }
    uploaded += chunks[i].file.size
    console.log((uploaded / totalSize).toFixed(2) * 100 + '%')
  }

  // console.log('&&&etags', JSON.stringify(etags))
  const resp = await API.oss.completeMultipartUpload(filename, uploadId, etags)
  console.log(resp)
  return resp
}
</script>
<style lang="scss" scoped>
.main-wrap {
  padding: 20px 0 0 20px;
  display: block;
}
.dragarea {
  background-color: #f6f6f6;
  height: fit-content;
  width: 400px;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #eeeeee;
  margin-top: 8px;
  color: #666;
  transition: all 0.2s;
}

.over {
  background-color: #f1f1f1;
  border: 1px dashed #666;
  transition: all 0.2s;
  color: #000;
}
</style>
