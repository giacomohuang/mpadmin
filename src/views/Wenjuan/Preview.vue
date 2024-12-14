<template>
  <div class="mobile-container">
    <div class="mobile-frame">
      <!-- 手机状态栏 -->
      <div class="status-bar">
        <span class="time">{{ currentTime }}</span>
        <div class="right-icons"></div>
      </div>

      <!-- Dynamic Island -->
      <div class="dynamic-island"></div>

      <div class="preview-container" data-simplebar>
        <!-- 问卷标题 -->
        <div class="header">
          <div class="title">{{ qName }}</div>
        </div>

        <!-- 问卷题目列表 -->
        <div class="main">
          <div v-for="(item, index) in qItems" :key="item.id" class="q-item">
            <!-- 题目标题 -->
            <div class="title">
              <span class="required" v-if="item.required">*</span>
              <span class="number">{{ index + 1 }}. </span>
              <span class="text" v-html="item.title"></span>
            </div>

            <!-- 根据题目类型渲染不同组件 -->
            <div class="content">
              <!-- 填空题 -->
              <template v-if="item.type === 'FillBlank'">
                <div v-if="!item.multiMode" class="fill-blank">
                  <a-input v-model:value="answers[item.id]" :placeholder="item.options[0]?.placeholder || '请填写'" :maxLength="item.options[0]?.maxLength || undefined" />
                </div>
                <div v-else class="multi-blank">
                  <div v-for="(opt, idx) in item.options" :key="opt.id" class="blank-item">
                    <div class="blank-title" v-html="opt.text"></div>
                    <a-input v-model:value="answers[item.id + '_' + idx]" :placeholder="opt.placeholder || '请填写'" :maxLength="opt.maxLength || undefined" />
                  </div>
                </div>
              </template>

              <!-- 单选题 -->
              <template v-if="item.type === 'SingleChoice'">
                <a-radio-group v-model:value="answers[item.id]">
                  <div v-for="opt in item.options" :key="opt.id" class="radio-item">
                    <a-radio :value="opt.id">
                      <span v-html="opt.text"></span>
                    </a-radio>
                    <a-input v-if="opt.fill?.show && answers[item.id] === opt.id" v-model:value="answers[item.id + '_fill']" :placeholder="opt.fill.placeholder || '请填写'" :maxLength="opt.fill.length || undefined" />
                  </div>
                </a-radio-group>
              </template>

              <!-- 多选题 -->
              <template v-if="item.type === 'MultiChoice'">
                <a-checkbox-group v-model:value="answers[item.id]" :min="item.minRange || 0" :max="item.maxRange || item.options.length">
                  <div v-for="opt in item.options" :key="opt.id" class="checkbox-item">
                    <a-checkbox :value="opt.id">
                      <span v-html="opt.text"></span>
                    </a-checkbox>
                    <a-input v-if="opt.fill?.show && answers[item.id]?.includes(opt.id)" v-model:value="answers[item.id + '_' + opt.id]" :placeholder="opt.fill.placeholder || '请填写'" :maxLength="opt.fill.length || undefined" />
                  </div>
                </a-checkbox-group>
              </template>

              <!-- 图片选择 -->
              <template v-if="item.type === 'ImageChoice'">
                <div class="image-choice">
                  <div v-for="opt in item.options" :key="opt.id" class="image-item" :class="{ active: answers[item.id] === opt.id }" @click="answers[item.id] = opt.id">
                    <img :src="OSS_PREFIX + opt.imageUrl" :alt="opt.text" />
                    <div class="image-text" v-html="opt.text"></div>
                  </div>
                </div>
              </template>

              <!-- 评分题 -->
              <template v-if="item.type === 'Rate'">
                <div class="rate-wrap">
                  <template v-if="item.maxScore <= 10">
                    <a-rate v-model:value="answers[item.id]" :count="item.maxScore" :allow-half="item.step === 0.5" :character="item.customIcon ? () => h(Icon, { name: item.customIcon.icon }) : undefined" />
                  </template>
                  <template v-else>
                    <a-slider v-model:value="answers[item.id]" :min="item.minScore" :max="item.maxScore" :step="item.step" />
                  </template>
                  <div v-if="item.showLabels" class="rate-labels">
                    <span>{{ item.minLabel }}</span>
                    <span>{{ item.maxLabel }}</span>
                  </div>
                </div>
              </template>

              <!-- NPS -->
              <template v-if="item.type === 'NPS'">
                <div class="nps-wrap">
                  <div class="nps-scores">
                    <div v-for="score in 11" :key="score - 1" class="score-item" :class="{ active: answers[item.id] === score - 1 }" @click="answers[item.id] = score - 1">
                      {{ score - 1 }}
                    </div>
                  </div>
                  <div v-if="item.showLabels" class="nps-labels">
                    <span>{{ item.minLabel }}</span>
                    <span>{{ item.maxLabel }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="footer">
          <a-button type="primary" @click="submit" :loading="submitting">提交</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import Icon from '@/components/Icon.vue'
import 'simplebar'
import '@/assets/simplebar.css'

const qItems = inject('qItems')
const qName = inject('qName')
const answers = ref({})
const submitting = ref(false)
const currentTime = ref('')
const OSS_PREFIX = import.meta.env.VITE_UPLOAD_URL_PREFIX

// 提交答案
async function submit() {
  // 验证必答题是否已答
  for (const item of qItems.value) {
    if (item.required && !answers.value[item.id]) {
      console.log('第', item.index + 1, '题为必答题')
      message.warning(`第${item.index + 1}题为必答题`)
      return
    }
  }

  // submitting.value = true
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>

<style scoped lang="scss">
.mobile-container {
  display: flex;
  align-items: center;
  justify-content: center;
  // background: #f5f5f5;
}

.mobile-frame {
  width: 402px; // iPhone 16 Pro 宽度
  height: 874px; // iPhone 16 Pro 高度
  background: white;
  border-radius: 55px; // 更大的圆角
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  border: 12px solid #1a1a1a; // 深色边框

  // 移除原有的 before 伪元素
  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: #000;
    border-radius: 100px;
    z-index: 100;
  }
}

.dynamic-island {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 37px;
  background: #000;
  border-radius: 20px;
  z-index: 100;
}

.status-bar {
  height: 44px; // 更高的状态栏
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 14px;
  color: #000;
  position: relative;
  z-index: 101;

  .right-icons {
    display: flex;
    gap: 6px;
  }
}

.preview-container {
  height: calc(100% - 44px); // 调整内容区域高度
  padding-top: 20px; // 为 Dynamic Island 留出空间
  overflow-y: auto;
  max-width: 100%;
  margin: 0;
  background: var(--bg-primary);

  .main {
    padding: 12px;
  }

  .q-item {
    margin-bottom: 16px;
    padding: 12px;
  }

  .footer {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 12px;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
  }
}

.header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid var(--border-light);

  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.fill-blank {
  .blank-item {
    margin-bottom: 12px;

    .blank-title {
      margin-bottom: 8px;
    }
  }
}

.radio-item,
.checkbox-item {
  margin-bottom: 12px;

  :deep(.ant-input) {
    margin-top: 8px;
    margin-left: 24px;
  }
}

.image-choice {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;

  .image-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;

    &.active {
      border-color: var(--c-brand);
    }

    img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .image-text {
      padding: 8px;
      text-align: center;
    }
  }
}

.rate-wrap,
.nps-wrap {
  .rate-labels,
  .nps-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    color: var(--text-secondary);
    font-size: 12px;
  }
}

.nps-scores {
  display: flex;
  justify-content: space-between;

  .score-item {
    width: 25px;
    height: 25px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-medium);
    border-radius: 50%;
    cursor: pointer;

    &.active {
      background: var(--c-brand);
      color: white;
      border-color: var(--c-brand);
    }
  }
}
</style>
