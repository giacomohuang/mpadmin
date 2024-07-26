<template>
  <div class="main-wrap">
    <div>
      <a-button @click="handleConcurrentClick">并发测试</a-button>
      <a-button @click="handleClick">TEST</a-button>
      <div style="white-space: pre-line">{{ aaa }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="dragarea" :class="{ over: state.dragover }" @click="handleSelectFiles" @dragover.prevent @dragend="console.log('aaa')" @dragover.native="state.dragover = true" @dragleave.native="state.dragover = false" @drop="handleDropFiles">
        <div class="dd" v-if="files.length === 0">Drag & Drops files here.</div>
        <ul class="uploadlist">
          <li v-for="file in files" key="file.name">
            <div class="filename">{{ file.originalName }}</div>
            <div style="display: flex; flex-direction: row; align-items: center">
              <div style="font-size: 12px; padding-right: 8px">校验:</div>
              <div class="progress"><a-progress :percent="file.checksumPercent" size="small" :steps="10" /></div>
              <div class="progress" style="width: 60%"><a-progress :percent="file.percent" size="small" :status="file.status" /></div>
            </div>
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
import pLimit from 'p-limit'
const aaa = ref('')
const state = reactive({
  dragover: false
})
const files = ref([])

const calculatePartSize = (size) => {
  // 最大单个文件5TB
  const MAX_OBJECT_SIZE = 5 * 1024 * 1024 * 1024 * 1024
  // 默认分片64MB
  const DEFAULT_PARTSIZE = 64 * 1024 * 1024
  if (typeof size !== 'number') {
    throw new TypeError('size should be of type "number"')
  }
  if (size > MAX_OBJECT_SIZE) {
    throw new TypeError(`size should not be more than ${MAX_OBJECT_SIZE}`)
  }
  let partSize = DEFAULT_PARTSIZE
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
  // var encryptedData = '3k3tbrBUdf4Gpkqhj4eIUIfngJnzqcleA8IX+jjqqc0xJoA3wMsGY7msQoHUom4jMmxXsGb5N/uUreqdzhnLj45Li4fC3Z52ndN714dyaYEiIXR9H51mDXKWv5oM7ZOs'
  // var key = CryptoJS.enc.Utf8.parse('8Co5CsG5yrH0VT7M')
  // var iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')

  // 解密
  // var decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
  //   iv: iv,
  //   padding: CryptoJS.pad.Pkcs7,
  //   mode: CryptoJS.mode.CBC
  // })

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
  try {
    const handles = await window.showOpenFilePicker({
      // types: [
      //   {
      //     description: 'Images',
      //     accept: {
      //       'image/*': ['.png', '.gif', '.jpeg', '.jpg']
      //     }
      //   }
      // ],
      // excludeAcceptAllOption: true,
      multiple: true
    })
    // files.value = new Array(handles.length).fill({})
    await uploadFiles(handles)
  } catch (err) {
    console.log(err)
  }
}

const uploadFiles = async (handles) => {
  files.value = []
  const tasks = []
  const limit = pLimit(3)
  for (const [index, handle] of handles.entries()) {
    const file = await handle.getFile()
    const upload = await API.oss.initNewMultipartUpload(file.name)
    const { uploadId, newFilename, oldTags } = upload
    files.value.push({ originalName: file.name, name: newFilename, totalSize: file.size, percent: 0 })
    let chunkSize = calculatePartSize(file.size)
    const chunks = await chunkFile(file, chunkSize)
    const task = limit(async () => {
      await checksumSHA1(file, (loaded, total) => (files.value[index].checksumPercent = Math.round((loaded / total) * 100)))
      await uploadParts(chunks, index, uploadId, oldTags)
    })
    tasks.push(task)
  }
  await Promise.all(tasks)
  console.log('all uploaded')
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
  let partNumber = 1
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

const uploadParts = async (chunks, fileIndex, uploadId, oldTags) => {
  console.log(chunks, fileIndex, uploadId, oldTags)
  let etags = new Array(chunks.length).fill(null)
  let uploaded = 0
  let chunksProgress = new Array(chunks.length).fill(0)

  const tasks = []
  const limit = pLimit(3)
  for (const [i, chunk] of chunks.entries()) {
    const formData = new FormData()
    const partNumber = chunk.partNumber
    if (i <= oldTags?.length) {
      etags[i] = matchingTag[i]
    } else {
      formData.append('file', chunk.file)
      formData.append('filename', encodeURIComponent(files.value[fileIndex].name))
      formData.append('uploadId', uploadId)
      formData.append('partNumber', partNumber)
      const task = limit(async () => {
        const etag = await API.oss
          .uploadPart(formData, (progress) => {
            chunksProgress[i] = progress
            uploaded = calcProgress(chunksProgress)
            if (uploaded > files.value[fileIndex].totalSize) uploaded = files.value[fileIndex].totalSize
            const percent = parseFloat(((uploaded / files.value[fileIndex].totalSize) * 100).toFixed())
            if (percent > files.value[fileIndex].percent) files.value[fileIndex].percent = percent
            console.log('fileidx', fileIndex, 'partNumber', partNumber, 'loaded:', uploaded, 'total:', files.value[fileIndex].totalSize, 'percent:', files.value[fileIndex].percent)
          })
          .catch((err) => {
            console.log(err)
            files.value[fileIndex].status = 'exception'
          })
        etags[i] = etag
      })
      tasks.push(task)
    }
  }
  await Promise.all(tasks)

  files.value[fileIndex].percent = 100
  console.log('100%', files.value[fileIndex].originalName)
  // console.log('&&&etags', JSON.stringify(etags));
  const resp = await API.oss.completeMultipartUpload(files.value[fileIndex].name, uploadId, etags).catch((err) => {
    console.log(err)
    files.value[fileIndex].status = 'exception'
  })
  return resp
  // console.log(resp);
}

const calcProgress = (chunksProgress) => {
  return chunksProgress.reduce((acc, val) => acc + val, 0)
}

// function hexToBase64(hexStr) {
//   const bytes = new Uint8Array(hexStr.length / 2)
//   for (let i = 0; i < hexStr.length; i += 2) {
//     bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16)
//   }
//   return btoa(String.fromCharCode.apply(null, bytes))
// }

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
