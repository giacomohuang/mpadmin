<template>
  <div class="main-wrap">
    <div>
      <a-button @click="handleClick">TEST</a-button>
      <div style="white-space: pre-line">{{ aaa }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="dragarea" :class="{ over: state.dragover }" @click="handleSelectFiles" @dragover.prevent @dragend="console.log('aaa')" @dragover.native="state.dragover = true" @dragleave.native="state.dragover = false" @drop="handleDropFiles">
        <div class="dd" v-if="files.length === 0">Drag & Drops files here.</div>
        <ul class="uploadlist">
          <li v-for="file in files" key="file.name">
            <div class="filename">{{ file.name }}</div>
            <div class="progress"><a-progress :percent="file.percent" size="small" /></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, reactive } from 'vue'
import CryptoJS from 'crypto-js'
// import SparkMD5 from 'spark-md5'
import API from '../../api/API'
import FetchEventSource from '../../api/fetcheventsource'
const aaa = ref('')
const state = reactive({
  dragover: false
})
const files = ref([])

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
    await uploadFiles(handles)
  } catch (err) {
    console.log('cancel')
    return
  }
}

const uploadFiles = async (handles) => {
  const MAX_CONCURRENT_REQUESTS = 3 // 设定最大并发数
  // 创建一个队列
  const queue = []
  let runningTasksCount = 0
  // 函数用于处理队列中的下一个任务
  const processNextTask = async () => {
    if (queue.length > 0 && runningTasksCount < MAX_CONCURRENT_REQUESTS) {
      const task = queue.shift() // 取出队列中的第一个任务
      runningTasksCount++
      await task() // 执行任务
      runningTasksCount--
      processNextTask() // 继续处理下一个任务
    }
  }

  // 用于添加任务到队列并控制并发数的函数
  const enqueue = (task) => {
    queue.push(task)
    processNextTask() // 开始处理队列中的任务
  }
  files.value = []
  handles.forEach(async (handle, index) => {
    const file = await handle.getFile()
    files.value.push({ name: file.name, totalSize: file.size, index: index, percent: 0 })
    let chunkSize = calculatePartSize(file.size)
    console.log('ChunkSize:', chunkSize)
    const sha256 = await checksumSHA1(file, (loaded, total) => {
      console.log(`Progress: ${Math.round((loaded / total) * 100)}%`)
    })
    console.log('sha256:', sha256)
    const chunks = await chunkFile(file, chunkSize)
    const result = await API.oss.initNewMultipartUpload(file.name)
    const { uploadId, oldTags } = result
    enqueue(async () => {
      await uploadByParts(chunks, index, uploadId, oldTags)
    })
  })
}

const checksumSHA1 = async (file, onProgress, chunkSize = 5 * 1024 * 1024) => {
  const chunks = []
  let loaded = 0
  let sha256 = CryptoJS.algo.SHA1.create()
  const total = file.size
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    let partNumber = 0
    // 使用requestIdleCallback来确保UI线程不会被阻塞
    const processNextChunk = () => {
      if (loaded >= total) {
        resolve(sha256.finalize().toString())
        return
      }
      const start = loaded
      const end = Math.min(start + chunkSize, total)
      const chunk = file.slice(start, end)
      reader.onloadend = () => {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result)
        sha256.update(wordArray)
        partNumber++
        loaded = end
        onProgress(loaded, total)
        requestIdleCallback(processNextChunk)
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(chunk)
    }
    requestIdleCallback(processNextChunk)
  })
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

const uploadByParts = async (chunks, index, uploadId, oldTags) => {
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
      formData.append('filename', encodeURIComponent(files.value[index].name))
      formData.append('uploadId', uploadId)
      formData.append('partNumber', partNumber)
      // formData.append('hash', chunks[i].hash)
      formData.append('oldTags', JSON.stringify(oldTags))
      const etag = await API.oss.uploadPart(formData, (progress) => {
        // console.log(files.value[index].totalSize, uploaded, progress)
        chunkUploaded = progress
        files.value[index].percent = parseFloat((((uploaded + chunkUploaded) / files.value[index].totalSize) * 100).toFixed())
      })
      etags.push(etag)
    }
    uploaded += chunks[i].file.size
  }
  uploaded = files.value[index].totalSize
  files.value[index].percent = 100
  console.log('100%')
  // console.log('&&&etags', JSON.stringify(etags))
  const resp = await API.oss.completeMultipartUpload(files.value[index].name, uploadId, etags)
  console.log(resp)
  return resp
}

function hexToBase64(hexStr) {
  const bytes = new Uint8Array(hexStr.length / 2)
  for (let i = 0; i < hexStr.length; i += 2) {
    bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16)
  }
  return btoa(String.fromCharCode.apply(null, bytes))
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
</script>
<style lang="scss" scoped>
.main-wrap {
  padding: 20px 0 0 20px;
  display: block;
}
.dragarea {
  background-color: var(--bg-main-striped);
  height: fit-content;
  width: 400px;
  // padding: 20px;
  border-radius: 5px;
  border: 1px solid #eeeeee;
  margin-top: 8px;
  color: #666;
  transition: all 0.2s;
  cursor: pointer;
}
.dd {
  margin: 20px;
  cursor: pointer;
}

.over {
  background-color: #f1f1f1;
  border: 1px dashed #666;
  transition: all 0.2s;
  color: #000;
}

.uploadlist {
  list-style-type: none;
  color: var(--text-primary);
  li {
    padding: 12px;
  }
  li:nth-child(even) {
    background: var(--bg-main);
  }
}
</style>
