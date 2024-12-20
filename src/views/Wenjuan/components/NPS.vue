<template>
  <div class="nps-inner">
    <div class="nps-score-container">
      <div class="nps-scores">
        <div v-for="score in qItems[qItemIndex].maxScore - qItems[qItemIndex].minScore + 1" :key="score - 1"
          class="score-item" :class="{ active: qItems[qItemIndex].value === score - 1 + qItems[qItemIndex].minScore }"
          @click="qItems[qItemIndex].value = score - 1 + qItems[qItemIndex].minScore">
          <a-tooltip :title="qItems[qItemIndex].tips[score - 1]?.text">
            {{ score - 1 + qItems[qItemIndex].minScore }}
          </a-tooltip>
        </div>
      </div>
      <div v-if="qItems[qItemIndex].showLabels" class="nps-labels">
        <span class="min-label">{{ qItems[qItemIndex].minLabel }}</span>
        <span class="max-label">{{ qItems[qItemIndex].maxLabel }}</span>
      </div>
    </div>
  </div>

  <!-- 设置面板 -->
  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="currentItemIndex === qItemIndex">
    <div class="num">{{ qItemIndex + 1 }}. NPS题</div>

    <div class="prop-item">
      <h4>此题必答</h4>
      <a-switch v-model:checked="qItems[qItemIndex].required" size="small" />
    </div>

    <div class="prop-item">
      <h4>最低分</h4>
      <a-input-number v-model:value="qItems[qItemIndex].minScore" :min="0" :max="qItems[qItemIndex].maxScore"
        size="small" style="width: 100px" @change="handleMinScoreChange">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>

    <div class="prop-item">
      <h4>最高分</h4>
      <a-input-number v-model:value="qItems[qItemIndex].maxScore" :min="qItems[qItemIndex].minScore" :max="10"
        size="small" style="width: 100px" @change="handleMaxScoreChange">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>

    <div class="prop-item">
      <h4>极值标签</h4>
      <a-switch v-model:checked="qItems[qItemIndex].showLabels" size="small" />
    </div>

    <template v-if="qItems[qItemIndex].showLabels">
      <div class="prop-item">
        <h4>最低分标签</h4>
        <a-input v-model:value="qItems[qItemIndex].minLabel" size="small" placeholder="不可能" style="width: 120px" />
      </div>
      <div class="prop-item">
        <h4>最高分标签</h4>
        <a-input v-model:value="qItems[qItemIndex].maxLabel" size="small" placeholder="一定会" style="width: 120px" />
      </div>
    </template>

    <!-- 评分提示设置 -->
    <div class="prop-item column">
      <h4>评分提示</h4>
      <div class="tips-list">
        <div v-for="(tip, index) in qItems[qItemIndex].tips" :key="index" class="tip-item">
          <a-input-number v-model:value="tip.score" :min="qItems[qItemIndex].minScore"
            :max="qItems[qItemIndex].maxScore" @change="(val) => handleTipScoreChange(val, index)" class="tip-score"
            size="small">
            <template #addonAfter>分</template>
          </a-input-number>
          <a-input v-model:value="tip.text" size="small" placeholder="请输入分数描述" />
          <icon name="del" class="remove-tip" @click="removeTip(index)" />
        </div>
        <a-button type="dashed" size="small" @click="addTip"> 添加提示 </a-button>
      </div>
    </div>
  </Teleport>
</template>

<router lang="json">{
  "isRouter": false
}</router>

<script setup>
import { inject, onBeforeMount, watch } from 'vue'
import { message } from 'ant-design-vue'
import { cleanupScoreRanges, cleanupConditions } from '../cleanup'

const props = defineProps(['qItemIndex'])

const qItems = inject('qItems')
const currentItemIndex = inject('currentItemIndex')

const cleanup = () => {
  cleanupScoreRanges(qItems.value)
  cleanupConditions(qItems.value)
}

function handleTipScoreChange(newScore, currentIndex) {
  if (newScore === null || newScore === undefined) {
    qItems.value[props.qItemIndex].tips[currentIndex].score = qItems.value[props.qItemIndex].minScore
    return
  }

  const tips = qItems.value[props.qItemIndex].tips
  const duplicateIndex = tips.findIndex((tip, index) => tip.score === newScore && index !== currentIndex)

  if (duplicateIndex !== -1) {
    const minScore = qItems.value[props.qItemIndex].minScore
    const maxScore = qItems.value[props.qItemIndex].maxScore
    let availableScore = minScore

    while (availableScore <= maxScore) {
      if (!tips.some((tip) => tip.score === availableScore)) {
        qItems.value[props.qItemIndex].tips[currentIndex].score = availableScore
        return
      }
      availableScore++
    }
    qItems.value[props.qItemIndex].tips[currentIndex].score = tips[currentIndex].score
    message.warning('没有可用的分数')
    return
  }

  qItems.value[props.qItemIndex].tips[currentIndex].score = newScore
}

function addTip() {
  const tips = qItems.value[props.qItemIndex].tips
  const minScore = qItems.value[props.qItemIndex].minScore
  let score = minScore

  while (tips.some((tip) => tip.score === score)) {
    score++
    if (score > qItems.value[props.qItemIndex].maxScore) {
      message.warning('已经没有可用的分数')
      return
    }
  }

  qItems.value[props.qItemIndex].tips.push({
    score,
    text: ''
  })
}

function removeTip(index) {
  qItems.value[props.qItemIndex].tips.splice(index, 1)
}

function handleMinScoreChange(value) {
  if (value > qItems.value[props.qItemIndex].maxScore) {
    qItems.value[props.qItemIndex].minScore = qItems.value[props.qItemIndex].maxScore
  }
  cleanup()
}

function handleMaxScoreChange(value) {
  if (value < qItems.value[props.qItemIndex].minScore) {
    qItems.value[props.qItemIndex].maxScore = qItems.value[props.qItemIndex].minScore
  }
  cleanup()
}

// 监听分数范围变化
watch(
  () => [qItems.value[props.qItemIndex].minScore, qItems.value[props.qItemIndex].maxScore],
  ([newMin, newMax]) => {
    // 清理超出范围的提示
    qItems.value[props.qItemIndex].tips = qItems.value[props.qItemIndex].tips.filter((tip) => tip.score >= newMin && tip.score <= newMax)

    // 调整当前值到合法范围
    if (qItems.value[props.qItemIndex].value < newMin) {
      qItems.value[props.qItemIndex].value = newMin
    } else if (qItems.value[props.qItemIndex].value > newMax) {
      qItems.value[props.qItemIndex].value = newMax
    }
  }
)

onBeforeMount(() => {
  // 初始化默认值
  const item = qItems.value[props.qItemIndex]
  item.required ??= false
  item.value ??= null
  item.tips ??= []
  item.showLabels ??= true
  item.minLabel ??= '不可能'
  item.maxLabel ??= '一定会'
  item.minScore ??= 0
  item.maxScore ??= 10
})
</script>

<style scoped lang="scss">
.nps-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nps-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  max-width: 500px;
  margin-bottom: 24px;
}

.nps-scores {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 12px;
}

.score-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-medium);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--c-brand);
    color: var(--c-brand);
  }

  &.active {
    background-color: var(--c-brand);
    border-color: var(--c-brand);
    color: white;
  }
}

.nps-labels {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  // margin-top: 8px;
}

.prop-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;

  &.column {
    margin-top: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.tips-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .tip-score {
    width: 100px;
    flex-shrink: 0;
  }

  .remove-tip {
    flex-shrink: 0;
    cursor: pointer;
    color: var(--text-secondary);

    &:hover {
      color: var(--c-red);
    }
  }
}

.num {
  margin: 18px 8px;
  font-size: 16px;
  font-weight: 800;
}

.min-label {
  position: absolute;
  left: 0;
}

.max-label {
  position: absolute;
  right: 0;
}
</style>
