<template>
  <div class="settings-container" data-simplebar>
    <a-form :model="formState" layout="vertical">
      <!-- 基础设置 -->
      <a-card title="基础设置" class="setting-card">
        <a-form-item label="答题时限（0表示不限时）" name="timeLimit">
          <a-input-number v-model:value="formState.timeLimit" :min="0" :max="999" style="width: 120px" addon-after="分钟" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="用户答题次数限制" name="submitLimit">
          <a-form-item-rest>
            <a-space>
              <a-select v-model:value="formState.submitLimitType" style="width: 120px">
                <a-select-option value="none">不限制</a-select-option>
                <a-select-option value="once">只允许一次</a-select-option>
                <a-select-option value="daily">每日限制</a-select-option>
                <a-select-option value="weekly">每周限制</a-select-option>
                <a-select-option value="monthly">每月限制</a-select-option>
              </a-select>
              <a-input-number v-if="formState.submitLimitType !== 'once'" v-model:value="formState.submitLimitCount" :min="1" :max="999" style="width: 120px" placeholder="次" :disabled="formState.submitLimitType === 'none'">
                <template #addonAfter>次</template>
              </a-input-number>
            </a-space>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="问卷收集起止时间" name="collectTime">
          <a-range-picker v-model:value="collectTime" show-time value-format="YYYY-MM-DD HH:mm:ss" :placeholder="['开始时间', '结束时间']" />
        </a-form-item>
        <a-form-item label="问卷标签" name="tags">
          <a-select v-model:value="formState.tags" mode="tags" placeholder="请输入标签，多个标签用逗号或空格分隔" :token-separators="[',', '，', ' ']" />
        </a-form-item>
      </a-card>

      <!-- 外观和封面设置 -->
      <a-card title="外观和封面设置" class="setting-card">
        <a-form-item label="封面图片" name="coverImage">
          <a-upload v-model:file-list="fileList" list-type="picture-card" :show-upload-list="false" :before-upload="beforeUpload" @change="handleCoverChange">
            <img v-if="formState.coverImage" :src="formState.coverImage" alt="封面" style="width: 100%" />
            <div v-else>
              <icon name="plus" />
              <div style="margin-top: 8px">上传封面</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="背景图片" name="backgroundImage">
          <a-upload v-model:file-list="bgFileList" list-type="picture-card" :show-upload-list="false" :before-upload="beforeUpload" @change="handleBgChange">
            <img v-if="formState.backgroundImage" :src="formState.backgroundImage" alt="背景" style="width: 100%" />
            <div v-else>
              <icon name="plus" />
              <div style="margin-top: 8px">上传背景</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="字体设置" name="fontFamily">
          <a-select v-model:value="formState.fontFamily">
            <a-select-option value="default">默认字体</a-select-option>
            <a-select-option value="serif">宋体</a-select-option>
            <a-select-option value="sans-serif">黑体</a-select-option>
            <a-select-option value="cursive">楷体</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="主题色" name="themeColor">
          <div class="theme-color-container">
            <div class="color-presets">
              <div v-for="(color, name) in colorSchemes" :key="name" class="color-block" :style="{ backgroundColor: color }" @click="handleColorSchemeSelect(color)" :class="{ active: formState.themeColor === color }"></div>
            </div>
            <div class="custom-color">
              <input type="color" class="color-input" :value="formState.themeColor" @input="handleCustomColorChange" title="自定义颜色" />
            </div>
          </div>
        </a-form-item>
      </a-card>

      <!-- 显示设置 -->
      <a-card title="显示设置" class="setting-card">
        <a-form-item label="显示答题进度条" name="showProgress">
          <a-switch v-model:checked="formState.showProgress" />
        </a-form-item>
        <a-form-item label="显示题号" name="showQuestionNumber">
          <a-switch v-model:checked="formState.showQuestionNumber" />
        </a-form-item>
        <a-form-item label="每页显示一题" name="showOnePerPage">
          <a-switch v-model:checked="formState.showOnePerPage" />
        </a-form-item>
      </a-card>

      <!-- 提交设置 -->
      <a-card title="提交设置" class="setting-card">
        <a-form-item label="允许重复提交" name="allowMultiSubmit">
          <a-switch v-model:checked="formState.allowMultiSubmit" />
        </a-form-item>
        <a-form-item label="提交成功提示语" name="submitSuccessMessage">
          <a-input v-model:value="formState.submitSuccessMessage" placeholder="请输入提交成功后显示的提示语" />
        </a-form-item>
      </a-card>
    </a-form>
  </div>
  <div class="form-actions">
    <a-button type="primary" @click="saveSettings">保存设置</a-button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, computed, reactive } from 'vue'
import 'simplebar'
import 'simplebar/dist/simplebar.css'

import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const Q = inject('Q')
const settingsModal = inject('settingsModal')

const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
}

// 表单数据
const formState = reactive({
  // 基础设置
  title: '',
  description: '',
  status: true,
  tags: [],
  timeLimit: 0,
  submitLimitType: 'none',
  submitLimitCount: 1,

  // 外观和封面设置
  coverImage: '',
  backgroundImage: '',
  fontFamily: 'default',
  themeColor: '#1890ff',

  // 显示设置
  showProgress: true,
  showQuestionNumber: true,
  showOnePerPage: false,
  questionsPerPage: 5,

  // 提交设置
  allowMultiSubmit: false,
  submitSuccessMessage: '感谢您的参与！'
})

const collectTime = computed({
  get() {
    if (!formState.collectTime) {
      formState.collectTime = []
    }
    if (!formState.collectTime[0] || !formState.collectTime[1]) {
      return []
    }
    return [dayjs(formState.collectTime[0]), dayjs(formState.collectTime[1])]
  },
  set(value) {
    if (!value) {
      formState.collectTime = []
      return
    }
    formState.collectTime = [dayjs(value[0]).format('YYYY-MM-DD HH:mm:ss'), dayjs(value[1]).format('YYYY-MM-DD HH:mm:ss')]
  }
})

// 初始化数据
onMounted(() => {
  if (Q.settings) {
    Object.keys(Q.settings).forEach((key) => {
      formState[key] = Q.settings[key]
    })
  }
})

// 保存设置
const saveSettings = () => {
  Q.settings = { ...formState }
  settingsModal.value = false
}

const fileList = ref([])
const bgFileList = ref([])

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件！')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片必须小于 2MB!')
  }
  return isImage && isLt2M
}

const handleCoverChange = (info) => {
  if (info.file.status === 'done') {
    // 这里应该是你的实际上传接口返回的图片URL
    formState.coverImage = info.file.response.url
  }
}

const handleBgChange = (info) => {
  if (info.file.status === 'done') {
    // 这里应该是你的际上传接口返回的图片URL
    formState.backgroundImage = info.file.response.url
  }
}

const colorSchemes = {
  blue: '#1890ff', // 默认蓝
  green: '#52c41a', // 清新绿
  purple: '#722ed1', // 典雅紫
  orange: '#fa8c16', // 活力橙
  red: '#f5222d', // 热情红
  cyan: '#13c2c2' // 清爽青
}

const handleColorSchemeSelect = (color) => {
  formState.themeColor = color
}

const handleCustomColorChange = (e) => {
  formState.themeColor = e.target.value
}
</script>

<style scoped lang="scss">
.settings-container {
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  // background-color: var(--bg-secondary);

  .setting-card {
    margin-bottom: 24px;
  }

  .color-picker {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-block {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      border: 1px solid #d9d9d9;
    }

    .color-input {
      width: 32px;
      height: 32px;
      padding: 4px;
      border: 1px solid var(--border-medium);
      background-color: var(--bg-primary);
      border-radius: 3px;
      cursor: pointer;

      &::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      // &::-webkit-color-swatch {
      //   border: none;
      border-radius: 3px;
      // }
    }
  }
}

.form-actions {
  display: flex;
  height: 60px;
  justify-content: center;
  align-items: center;
}

.theme-color-container {
  display: flex;
  align-items: center;
  gap: 16px;

  .color-presets {
    display: flex;
    gap: 8px;
  }

  .color-block {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      border-color: #1890ff;
    }
  }

  .custom-color {
    width: 24px;
    height: 24px;
    .color-input {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: none;

      &::-webkit-color-swatch-wrapper {
        padding: 0;
        margin: 0;
      }
      &::-webkit-color-swatch {
        border: 0;
        // border: 2px solid #d9d9d9;
        border-radius: 4px;
      }
    }
  }
}
</style>
