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
          <div class="title">{{ Q.name }}</div>
        </div>

        <!-- 问卷题目列表 -->
        <div class="main">
          <div v-for="(item, index) in Q.data" :key="item.id" class="q-item" v-show="!isHidden(item.id)">
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
                    <a-input v-model:value="answers[item.id + '_' + opt.id]" :placeholder="opt.placeholder || '请填写'" :maxLength="opt.maxLength || undefined" />
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
                  <a-radio-group v-model:value="answers[item.id]">
                    <div v-for="opt in item.options" :key="opt.id" class="image-item">
                      <div class="image-preview">
                        <a-image
                          :src="OSS_PREFIX + opt.imageUrl"
                          :alt="opt.text"
                          :preview="{
                            src: OSS_PREFIX + opt.imageUrl,
                            mask: false
                          }"
                        />
                      </div>
                      <div class="image-text">
                        <a-radio :value="opt.id"><span v-html="opt.text"></span></a-radio>
                      </div>
                    </div>
                  </a-radio-group>
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
import { ref, inject, onMounted, h, watch, computed } from 'vue'
import { message, Image } from 'ant-design-vue'
import Icon from '@/components/Icon.vue'
import 'simplebar'
import '@/assets/simplebar.css'

const Q = inject('Q')
const answers = ref({})
const submitting = ref(false)
const currentTime = ref('')
const OSS_PREFIX = import.meta.env.VITE_UPLOAD_URL_PREFIX

// 添加逻辑状态管理
const logicStates = ref({})

// 计算每个题目的显示状态
const isHidden = (id) => {
  return logicStates.value[id]?.hidden || false
}

// 检查选项是否被选中
const isOptionSelected = (questionId, optionId) => {
  if (!answers.value[questionId]) return false

  const question = Q.data.find((q) => q.id === questionId)
  if (!question) return false

  if (question.type === 'MultiChoice') {
    return answers.value[questionId]?.includes(optionId)
  } else {
    return answers.value[questionId] === optionId
  }
}

// 检查题目是否已答
const isQuestionAnswered = (questionId) => {
  const answer = answers.value[questionId]
  if (!answer) return false

  const question = Q.data.find((q) => q.id === questionId)
  if (!question) return false

  switch (question.type) {
    case 'MultiChoice':
      return Array.isArray(answer) && answer.length > 0
    case 'SingleChoice':
    case 'ImageChoice':
      return answer !== undefined && answer !== null
    case 'FillBlank':
      if (question.multiMode) {
        return Object.keys(answers.value).some((key) => key.startsWith(questionId + '_') && answers.value[key])
      }
      return !!answer
    case 'Rate':
    case 'NPS':
      return answer !== undefined && answer !== null
    default:
      return false
  }
}

// 检查评分范围
const checkScoreRange = (question, rangeId) => {
  const answer = answers.value[question.id]
  if (answer === undefined || answer === null) return false

  const range = question.scoreRanges?.find((r) => r.id === rangeId)
  if (!range) return false

  return answer >= range.min && answer <= range.max
}

// 计算输出端口的状态
const calculateOutputState = (question, portId) => {
  switch (portId) {
    case 'show':
      return !logicStates.value[question.id]?.hidden
    case 'hide':
      return logicStates.value[question.id]?.hidden
    case 'answered':
      return isQuestionAnswered(question.id)
    case 'unanswered':
      return !isQuestionAnswered(question.id)
    default:
      // 处理选项和评分范围
      if (['SingleChoice', 'MultiChoice', 'ImageChoice'].includes(question.type)) {
        const option = question.options.find((opt) => opt.id === portId)
        if (option) {
          const isSelected = isOptionSelected(question.id, portId)
          return option.select === false ? !isSelected : isSelected
        }
      } else if (['Rate', 'NPS'].includes(question.type)) {
        return checkScoreRange(question, portId)
      }
      return false
  }
}

// 处理输入端口的逻辑
const processInputPort = (fromQuestion, toQuestion, portId, condition) => {
  if (!logicStates.value[toQuestion.id]) {
    logicStates.value[toQuestion.id] = { hidden: false }
  }

  switch (portId) {
    case 'jump':
      if (condition) {
        // 获取from和to题目的索引
        const fromIndex = Q.data.findIndex((q) => q.id === fromQuestion.id)
        const toIndex = Q.data.findIndex((q) => q.id === toQuestion.id)
        // 隐藏中间的所有题目
        for (let i = fromIndex + 1; i < toIndex; i++) {
          const id = Q.data[i].id
          if (!logicStates.value[id]) {
            logicStates.value[id] = { hidden: false }
          }
          logicStates.value[id].hidden = true
        }
      }
      break
    case 'show':
      logicStates.value[toQuestion.id].hidden = !condition
      break
    case 'hide':
      logicStates.value[toQuestion.id].hidden = condition
      break
  }
}

// 计算所有逻辑
const calculateLogic = () => {
  // 重置所有逻辑状态
  logicStates.value = {}

  // 按顺序处理每个题目的逻辑
  Q.data.forEach((question) => {
    if (!question.logic?.conditions) return

    question.logic.conditions.forEach((condition) => {
      const toQuestion = Q.data.find((q) => q.id === condition.toLogicId)
      if (!toQuestion) return

      // 计算输出端口状态
      const outputState = calculateOutputState(question, condition.fromPortId)

      // 处理输入端口逻辑
      processInputPort(question, toQuestion, condition.toPortId, outputState)
    })
  })

  // 处理连锁反应
  let changed = true
  const maxIterations = Q.data.length * 2 // 防止无限循环
  let iterations = 0

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    Q.data.forEach((question) => {
      if (!question.logic?.conditions) return

      const oldState = JSON.stringify(logicStates.value[question.id])

      question.logic.conditions.forEach((condition) => {
        const toQuestion = Q.data.find((q) => q.id === condition.toLogicId)
        if (!toQuestion) return

        const outputState = calculateOutputState(question, condition.fromPortId)
        processInputPort(question, toQuestion, condition.toPortId, outputState)
      })

      const newState = JSON.stringify(logicStates.value[question.id])
      if (oldState !== newState) {
        changed = true
      }
    })
  }
}

// 监听答案变化
watch(
  answers,
  () => {
    calculateLogic()
  },
  { deep: true }
)

// 初始化时计算逻辑
onMounted(() => {
  calculateLogic()
})

// 添加图片预览方法
const previewImage = (url) => {
  Image.preview({
    src: url,
    maskClosable: true
  })
}

// 提交答案
async function submit() {
  // 验证必答题是否已答
  for (const item of Q.data) {
    if (item.required && !answers.value[item.id]) {
      console.log('第', item.index + 1, '题为必答题')
      message.warning(`第${item.index + 1}题为必答题`)
      return
    }
  }
}

onMounted(() => {
  console.log(answers.value)
})

watch(
  answers,
  (newVal) => {
    console.log('answer changed', newVal)
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.mobile-container {
  display: flex;
  align-items: center;
  justify-content: center;
  // background: #f5f5f5;
}

.mobile-frame {
  flex-shrink: 0;
  box-sizing: content-box;
  width: 430px; // iPhone 16 Pro 宽度
  height: 932px; // iPhone 16 Pro 高度
  background: white;
  border-radius: 55px; // 更大的圆角
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  border: 8px solid #1a1a1a;

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
  height: calc(100% - 44px);
  padding-top: 20px;
  overflow-y: auto;
  max-width: 100%;
  margin: 0;
  background: var(--bg-primary);

  .main {
    padding: 16px;
  }

  .q-item {
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .title {
      margin-bottom: 16px;
      font-size: 16px;
      line-height: 1.5;
      color: var(--text-primary);
      display: flex;

      // align-items: center;

      .required {
        color: #ff4d4f;
        margin-right: 4px;
      }

      .number {
        color: var(--text-secondary);
        margin-right: 4px;
      }
    }

    .content {
      padding: 0 4px;
    }
  }

  .footer {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 16px;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
    text-align: center;

    .ant-btn {
      min-width: 120px;
      height: 40px;
      font-size: 16px;
      border-radius: 20px;
    }
  }
}

.header {
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid var(--border-light);
  background: #fff;
  margin-bottom: 16px;

  .title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.fill-blank {
  .ant-input {
    border-radius: 8px;
    padding: 8px 12px;

    &:hover,
    &:focus {
      border-color: var(--c-brand);
    }
  }

  .blank-item {
    margin-bottom: 16px;

    .blank-title {
      margin-bottom: 8px;
      color: var(--text-secondary);
    }
  }
}

.radio-item,
.checkbox-item {
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  :deep(.ant-radio-wrapper),
  :deep(.ant-checkbox-wrapper) {
    font-size: 15px;
  }

  :deep(.ant-input) {
    margin-top: 8px;
    margin-left: 24px;
    border-radius: 6px;
  }
}

.image-choice {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;

  :deep(.ant-radio-group) {
    display: contents;
  }

  .image-item {
    border: 1px solid var(--border-light);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .image-preview {
      width: 100%;
      height: 160px;
      position: relative;
      overflow: hidden;

      :deep(.ant-image) {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          cursor: zoom-in;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }
    }

    .image-text {
      padding: 12px;
      background: #fff;
      border-top: 1px solid var(--border-light);

      :deep(.ant-radio-wrapper) {
        width: 100%;
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  }
}

.rate-wrap,
.nps-wrap {
  padding: 8px 0;

  :deep(.ant-rate) {
    font-size: 24px;
  }

  :deep(.ant-slider) {
    margin: 16px 8px;
  }

  .rate-labels,
  .nps-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    color: var(--text-secondary);
    font-size: 13px;
  }
}

.nps-scores {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;

  .score-item {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--border-medium);
    border-radius: 50%;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--c-brand);
      color: var(--c-brand);
    }

    &.active {
      background: var(--c-brand);
      color: white;
      border-color: var(--c-brand);
    }
  }
}
</style>
