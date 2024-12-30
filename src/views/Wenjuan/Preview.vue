<template>
  <div class="mobile-container">
    <div class="mobile-frame" :style="Q.settings?.backgroundImage ? { backgroundImage: `url(${OSS_PREFIX}${Q.settings.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
      <!-- 手机状态栏 -->
      <div class="status-bar">
        <span class="time">{{ currentTime }}</span>
        <div class="right-icons">
          <span v-if="timeLeft" class="time-left">{{ formatTimeLeft }}</span>
        </div>
      </div>

      <!-- Dynamic Island -->
      <div class="dynamic-island"></div>

      <!-- 添加进度条到顶部 -->
      <div class="top-progress-bar" v-if="Q.settings?.showProgress">
        <div class="progress-text">答题进度</div>
        <a-progress :percent="answeredProgress" size="small" />
      </div>

      <div class="preview-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseLeave" :class="{ dragging: isDragging }">
        <!-- 单页模式：问卷标题和封面 -->
        <template v-if="Q.settings?.showOnePerPage">
          <!-- 封面页 -->
          <div v-if="isOnCoverPage" class="cover-page">
            <div class="header">
              <div class="cover-image" v-if="Q.settings?.coverImage">
                <img :src="OSS_PREFIX + Q.settings.coverImage" alt="封面图片" />
              </div>
              <div class="title">{{ Q.name }}</div>
            </div>
            <div class="start-button">
              <a-button type="primary" size="large" @click="startAnswering">
                滑动屏幕开始
                <template #icon><RightOutlined /></template>
              </a-button>
            </div>
          </div>

          <!-- 题目页 -->
          <template v-else>
            <div v-if="currentQuestion" class="q-item single-page" :key="currentQuestion.id">
              <!-- 题目标题 -->
              <div class="title">
                <span class="required" v-if="currentQuestion.required">*</span>
                <span class="number" v-if="Q.settings?.showQuestionNumber">{{ getQuestionDisplayIndex(currentQuestion.id) }}. </span>
                <span class="text" v-html="currentQuestion.title"></span>
              </div>

              <!-- 题目内容 -->
              <div class="content">
                <QuestionContent :item="currentQuestion" />
              </div>
            </div>
          </template>
        </template>

        <!-- 普通模式 -->
        <template v-else>
          <div class="header">
            <div class="cover-image" v-if="Q.settings?.coverImage">
              <img :src="OSS_PREFIX + Q.settings.coverImage" alt="封面图片" />
            </div>
            <div class="title">{{ Q.name }}</div>
          </div>

          <div class="main">
            <div v-for="(item, index) in Q.data" :key="item.id" class="q-item" v-show="!isHidden(item.id)">
              <!-- 题目标题 -->
              <div class="title">
                <span class="required" v-if="item.required">*</span>
                <span class="number" v-if="Q.settings?.showQuestionNumber">{{ getQuestionDisplayIndex(item.id) }}. </span>
                <span class="text" v-html="item.title"></span>
              </div>

              <!-- 题目内容 -->
              <div class="content">
                <QuestionContent :item="item" />
              </div>
            </div>
          </div>
        </template>

        <!-- 分页导航和提交按钮 -->
        <div class="footer" v-if="!isOnCoverPage">
          <!-- 分页导航按钮 -->
          <div v-if="Q.settings?.showOnePerPage" class="page-navigation">
            <a-button v-if="showPrevButton" @click="prevQuestion" class="nav-button prev"> 上一题 </a-button>
            <span class="page-indicator">{{ currentPage + 1 }} / {{ visibleQuestions.length }}</span>
            <a-button v-if="showNextButton" @click="nextQuestion" class="nav-button next" type="primary"> 下一题 </a-button>
            <a-button v-if="!showNextButton" type="primary" @click="submit" :loading="submitting" :disabled="!isInCollectTime || submitting"> 提交 </a-button>
          </div>

          <!-- 普通模式下的提交按钮 -->
          <a-button v-if="!Q.settings?.showOnePerPage" type="primary" @click="submit" :loading="submitting" :disabled="!isInCollectTime || submitting"> 提交 </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed, onUnmounted, provide } from 'vue'
import { message, Image } from 'ant-design-vue'
import { RightOutlined } from '@ant-design/icons-vue'
import QuestionContent from './components/QuestionContent.vue'
import 'simplebar'
import '@/assets/simplebar.css'

const Q = inject('Q')
const answers = ref({})
provide('answers', answers) // 提供 answers 给子组件使用
const submitting = ref(false)
const currentTime = ref('')
const OSS_PREFIX = import.meta.env.VITE_UPLOAD_URL_PREFIX

// 分页相关
const currentPage = ref(-1) // 改为 -1，表示封面页
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)
const SWIPE_THRESHOLD = 50 // 滑动阈值

// 获取可见的题目列表
const visibleQuestions = computed(() => {
  return Q.data.filter((q) => !isHidden(q.id))
})

// 获取题目的显示序号（1-based）
const getQuestionDisplayIndex = (questionId) => {
  return visibleQuestions.value.findIndex((q) => q.id === questionId) + 1
}

// 当前显示的题目
const currentQuestion = computed(() => {
  if (!Q.settings?.showOnePerPage) return null
  if (currentPage.value === -1) return null // 封面页
  return visibleQuestions.value[currentPage.value]
})

// 是否显示上一页按钮
const showPrevButton = computed(() => {
  return Q.settings?.showOnePerPage && currentPage.value > -1
})

// 是否显示下一页按钮
const showNextButton = computed(() => {
  return Q.settings?.showOnePerPage && currentPage.value < visibleQuestions.value.length - 1
})

// 是否在封面页
const isOnCoverPage = computed(() => {
  return Q.settings?.showOnePerPage && currentPage.value === -1
})

// 开始答题
const startAnswering = () => {
  currentPage.value = 0
  // 如果是每页一题模式，在这里初始化计时器
  if (Q.settings?.showOnePerPage) {
    initTimer()
  }
}

// 处理触摸开始
const handleTouchStart = (e) => {
  if (!Q.settings?.showOnePerPage) return
  touchStartX.value = e.touches[0].clientX
}

// 处理触摸结束
const handleTouchEnd = (e) => {
  if (!Q.settings?.showOnePerPage) return
  touchEndX.value = e.changedTouches[0].clientX
  handleSwipe(touchEndX.value - touchStartX.value)
}

// 处理鼠标按下
const handleMouseDown = (e) => {
  if (!Q.settings?.showOnePerPage) return
  isDragging.value = true
  touchStartX.value = e.clientX
}

// 处理鼠标移动
const handleMouseMove = (e) => {
  if (!isDragging.value) return
  e.preventDefault() // 防止拖动时选中文本
}

// 处理鼠标松开
const handleMouseUp = (e) => {
  if (!isDragging.value) return
  isDragging.value = false
  touchEndX.value = e.clientX
  handleSwipe(touchEndX.value - touchStartX.value)
}

// 处理鼠标离开容器
const handleMouseLeave = (e) => {
  if (isDragging.value) {
    isDragging.value = false
    touchEndX.value = e.clientX
    handleSwipe(touchEndX.value - touchStartX.value)
  }
}

// 统一处理滑动逻辑
const handleSwipe = (swipeDistance) => {
  if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
    if (swipeDistance > 0 && showPrevButton.value) {
      // 向右滑动，显示上一题
      prevQuestion()
    } else if (swipeDistance < 0) {
      if (isOnCoverPage.value) {
        // 在封面页向左滑动，开始答题
        startAnswering()
      } else if (showNextButton.value) {
        // 向左滑动，显示下一题
        nextQuestion()
      }
    }
  }
}

// 上一题
const prevQuestion = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (currentPage.value < visibleQuestions.value.length - 1) {
    currentPage.value++
  }
}

// 时间限制相关
const timeLeft = ref(null)
const timer = ref(null)

// 检查问卷是否在收集时间范围内
const isInCollectTime = computed(() => {
  if (!Q.settings?.collectTime?.[0] || !Q.settings?.collectTime?.[1]) return true
  const now = new Date().getTime()
  const start = new Date(Q.settings.collectTime[0]).getTime()
  const end = new Date(Q.settings.collectTime[1]).getTime()
  return now >= start && now <= end
})

// 检查提交次数限制
const checkSubmitLimit = () => {
  const { submitLimitType, submitLimitCount } = Q.settings
  if (submitLimitType === 'none') return true

  // TODO: 这里需要从后端获取用户的提交次数
  const userSubmitCount = 0

  switch (submitLimitType) {
    case 'once':
      return userSubmitCount === 0
    case 'daily':
    case 'weekly':
    case 'monthly':
      return userSubmitCount < submitLimitCount
    default:
      return true
  }
}

// 初始化答题计时器
const initTimer = () => {
  if (!Q.settings?.timeLimit) return

  timeLeft.value = Q.settings.timeLimit * 60 // 转换为秒
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer.value)
      message.warning('答题时间已到，系统将自动提交')
      submit()
    }
  }, 1000)
}

// 格式化剩余时间
const formatTimeLeft = computed(() => {
  if (!timeLeft.value) return ''
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 应用主题色
const applyThemeColor = () => {
  if (!Q.settings?.themeColor) return
  // document.documentElement.style.setProperty('--c-brand', Q.settings.themeColor)
}

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
  // 检查收集时间
  if (!isInCollectTime.value) {
    message.error('当前不在问卷收集时间范围内')
    return
  }

  // 检查提交次数限制
  if (!checkSubmitLimit()) {
    message.error('已超出允许的提交次数限制')
    return
  }

  // 验证必答题是否已答
  const visibleQuestions = Q.data.filter((q) => !isHidden(q.id))
  for (let i = 0; i < visibleQuestions.length; i++) {
    const item = visibleQuestions[i]
    if (item.required && !isQuestionAnswered(item.id)) {
      message.warning(`第${i + 1}题为必答题`)
      return
    }
  }

  try {
    submitting.value = true
    // TODO: 实际的提交逻辑

    // 显示成功提示语
    const successMessage = Q.settings?.submitSuccessMessage || '感谢您的参与！'
    message.success(successMessage)

    // 如果不允许重复提交，禁用提交按钮
    if (!Q.settings?.allowMultiSubmit) {
      submitting.value = true
    }
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  updateCurrentTime()
  setInterval(updateCurrentTime, 60000) // 每分钟更新一次时间

  // 只在非每页一题模式下初始化计时器
  if (!Q.settings?.showOnePerPage) {
    initTimer()
  }

  applyThemeColor() // 应用主题色

  // 检查收集时间
  if (!isInCollectTime.value) {
    message.warning('当前不在问卷收集时间范围内')
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

watch(
  answers,
  (newVal) => {
    console.log('answer changed', newVal)
  },
  { deep: true }
)

// 计算答题进度
const answeredProgress = computed(() => {
  const totalQuestions = Q.data.filter((q) => !isHidden(q.id)).length
  if (totalQuestions === 0) return 0

  const answeredQuestions = Q.data.filter((q) => !isHidden(q.id) && isQuestionAnswered(q.id)).length
  return Math.round((answeredQuestions / totalQuestions) * 100)
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
  height: calc(100% - 84px); // 调整高度以适应顶部进度条
  padding-top: 0; // 移除顶部padding
  overflow-y: auto;
  max-width: 100%;
  margin: 0;
  background: var(--bg-primary);
  user-select: none; // 防止拖动时选中文本

  &.dragging {
    cursor: grabbing;
    * {
      cursor: grabbing;
    }
  }

  .main {
    padding: 16px;
  }

  .q-item {
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &.single-page {
      margin-bottom: 180px;
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
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
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

  .cover-image {
    margin-bottom: 16px;

    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.status-bar {
  .time-left {
    font-size: 12px;
    color: var(--c-brand);
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
  }
}

.footer {
  .progress-bar {
    display: none;
  }
}

.page-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .nav-button {
    min-width: 100px;
  }

  .page-indicator {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.cover-page {
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;

  .header {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 16px;
    text-align: center;
    background: #fff;

    .cover-image {
      margin-bottom: 24px;

      img {
        max-width: 100%;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
    }
  }

  .start-button {
    padding: 24px;
    text-align: center;
    background: #fff;
    border-top: 1px solid var(--border-light);

    .ant-btn {
      height: 48px;
      padding: 0 32px;
      font-size: 16px;
      border-radius: 24px;

      .anticon {
        font-size: 18px;
        margin-left: 8px;
      }
    }
  }
}

// 添加顶部进度条样式
.top-progress-bar {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid var(--border-light);

  .progress-text {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
}
</style>
