<template>
  <div class="i18n-input-wrapper">
    <a-input v-bind="$attrs" :value="modelValue[locale]" @input="handleInput" class="i18n-input">
      <template #addonAfter>
        <span class="i18n-tag" @click="showEditor">{{ currentLang }}</span>
      </template>
    </a-input>

    <!-- 编辑器模态框 -->
    <a-modal v-model:open="editorVisible" :title="'多语言编辑'" @ok="handleOk" @cancel="handleCancel">
      <div class="lang-container">
        <a-form-item-rest>
          <div v-for="lang in languages" :key="lang" class="lang-item">
            <div class="lang-label">{{ getLangLabel(lang) }}</div>
            <a-input v-model:value="translationData[lang]" />
            <a-button v-if="lang !== currentLang" type="link" size="small" @click="() => autoTranslate(lang)"> 翻译 </a-button>
          </div>
        </a-form-item-rest>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import CryptoJS from 'crypto-js'

const { locale } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// 从环境变量获取支持的语言列表和默认语言
let languages = import.meta.env.VITE_LANGUAGES?.split(',') || ['zh-CN', 'en']
const currentLang = locale.value

const editorVisible = ref(false)
const translationData = ref({ ...props.modelValue })

// 语言标签映射
const langLabels = {
  'zh-CN': '简体中文',
  en: 'English',
  ar: 'العربية',
  ja: '日本語',
  ko: '한국어'
}

const getLangLabel = (lang) => {
  return langLabels[lang] || lang
}

onMounted(() => {
  // 确保每个语言都有对应的属性
  languages = [currentLang, ...languages.filter((lang) => lang !== currentLang)]
  languages.forEach((lang) => {
    if (!translationData.value[lang]) {
      translationData.value[lang] = ''
    }
  })
})

const handleInput = (e) => {
  // 修改事件处理函数，从事件对象中获取值
  const value = typeof e === 'string' ? e : e.target.value
  const updatedValue = {
    ...props.modelValue,
    [locale.value]: value
  }
  emit('update:modelValue', updatedValue)
}

const showEditor = () => {
  // 使用父组件传入的多语言数据初始化编辑器
  translationData.value = { ...props.modelValue }
  languages.forEach((lang) => {
    if (!translationData.value[lang]) {
      translationData.value[lang] = ''
    }
  })
  editorVisible.value = true
}

const handleOk = () => {
  emit('update:modelValue', translationData.value)
  editorVisible.value = false
}

const handleCancel = () => {
  editorVisible.value = false
}

// 添加以下常量用于百度翻译
const BAIDU_API_URL = '/baiduapi'
const BAIDU_APP_ID = import.meta.env.VITE_BAIDU_APP_ID
const BAIDU_SECRET_KEY = import.meta.env.VITE_BAIDU_SECRET_KEY
console.log(BAIDU_APP_ID, BAIDU_SECRET_KEY)

// 添加 MD5 加密函数
function MD5(string) {
  return CryptoJS.MD5(string).toString()
}

// 修改 autoTranslate 函数
const autoTranslate = async (targetLang) => {
  try {
    const sourceText = translationData.value[currentLang]
    if (!sourceText) {
      message.warning('请先输入默认语言的文本')
      return
    }

    // 准备百度翻译所需参数
    const salt = new Date().getTime()
    const str = BAIDU_APP_ID + sourceText + salt + BAIDU_SECRET_KEY
    const sign = MD5(str)

    // 转换语言代码为百度支持的格式
    const baiduLangMap = {
      'zh-CN': 'zh',
      en: 'en',
      ja: 'jp',
      ko: 'kor',
      ar: 'ara'
    }

    const from = baiduLangMap[currentLang] || 'auto'
    const to = baiduLangMap[targetLang] || targetLang

    const params = new URLSearchParams({
      q: sourceText,
      from,
      to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    })

    const response = await fetch(`${BAIDU_API_URL}?${params.toString()}`)

    // 正确处理 ReadableStream
    const reader = response.body.getReader()
    let chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // 将所有数据块合并成一个 Uint8Array
    const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let position = 0
    for (const chunk of chunks) {
      concatenated.set(chunk, position)
      position += chunk.length
    }

    // 将 Uint8Array 转换为文本
    const text = new TextDecoder().decode(concatenated)
    const result = JSON.parse(text)

    if (result.trans_result && result.trans_result[0]) {
      translationData.value[targetLang] = result.trans_result[0].dst
      message.success('翻译完成')
    } else {
      throw new Error(result.error_msg || '翻译失败')
    }
  } catch (error) {
    message.error(`翻译失败: ${error.message}`)
  }
}
</script>

<style scoped>
.i18n-input-wrapper {
  display: inline-block;
  width: 100%;
}

.i18n-input {
  width: 100%;
}

.i18n-tag {
  cursor: pointer;
}

.i18n-tag:hover {
  background: #e6f7ff;
}

.lang-container {
  display: flex;
  flex-direction: column;
}

.lang-item {
  display: grid;
  grid-template-columns: 100px 1fr 40px;

  align-items: center;
  margin-bottom: 16px;
}

.lang-label {
  /* width: 200px; */
  text-align: right;
  padding-right: 10px;
  &:after {
    content: ':';
  }
}
</style>
