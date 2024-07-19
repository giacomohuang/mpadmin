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
import SparkMD5 from 'spark-md5'
import API from '../../api/API'
import FetchEventSource from '../../api/fetcheventsource'
const aaa = ref('')
const state = reactive({
  dragover: false
})

// OpenAI test
// SSE Server-Sent Events
const handleClick = async () => {
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
  const handles = await window.showOpenFilePicker({
    description: '图片类型',
    accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg'] },
    multiple: true
  })
  handles.forEach(async (handle) => {
    const file = await handle.getFile()

    const onProgress = (progress) => {
      console.log(`Progress: ${(progress * 100).toFixed(2)}%`)
    }
    const CHUNKSIZE = 5 * 1024 * 1024

    const chunks = await chunkFile(file, CHUNKSIZE, onProgress)
    // console.log(chunks)
    const result = await API.oss.initNewMultipartUpload(file.name)
    const { uploadId, oldTags } = result
    await uploadPart(chunks, file.name, uploadId, oldTags)
  })
}

function hexToBase64(hexStr) {
  const bytes = new Uint8Array(hexStr.length / 2)
  for (let i = 0; i < hexStr.length; i += 2) {
    bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16)
  }
  return btoa(String.fromCharCode.apply(null, bytes))
}

async function chunkFile(file, chunkSize = 5 * 1024 * 1024, updateProgress) {
  const chunks = []
  const spark = new SparkMD5.ArrayBuffer()
  let loaded = 0
  const total = file.size

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    let partNumber = 0

    // 使用requestIdleCallback来确保UI线程不会被阻塞
    const processNextChunk = () => {
      if (loaded >= total) {
        resolve(chunks)
        return
      }

      const start = loaded
      const end = Math.min(start + chunkSize, total)
      const chunk = file.slice(start, end)

      reader.onloadend = () => {
        spark.append(reader.result)
        const hash = hexToBase64(spark.end())
        chunks.push({ file: chunk, hash, partNumber })
        partNumber++
        loaded = end
        updateProgress(loaded / total)
        requestIdleCallback(processNextChunk)
      }

      reader.onerror = reject
      reader.readAsArrayBuffer(chunk)
    }

    requestIdleCallback(processNextChunk)
  })
}

const uploadPart = async (chunks, filename, uploadId, oldTags) => {
  let etags = []
  for (let i = 0; i < chunks.length; i++) {
    const formData = new FormData()
    formData.append('file', chunks[i].file)
    formData.append('filename', encodeURIComponent(filename))
    formData.append('uploadId', uploadId)
    formData.append('partNumber', i + 1)
    formData.append('hash', chunks[i].hash)
    formData.append('oldTags', oldTags)
    const etag = await API.oss.uploadPart(formData)
    etags.push(etag)
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
