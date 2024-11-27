<template>
  <div class="rate-wrap">
    <!-- 评分区域 -->
    <div class="rate-content">
      <template v-if="qItems[qItemIndex].maxScore <= 10">
        <div class="rate-inner">
          <a-rate v-model:value="qItems[qItemIndex].value" :count="qItems[qItemIndex].maxScore" :allow-half="qItems[qItemIndex].step === 0.5" :tooltips="qItems[qItemIndex].tips.map((tip) => tip.text)" v-bind="rateProps" />
          <div v-if="qItems[qItemIndex].showLabels" class="rate-labels">
            <span class="min-label">{{ qItems[qItemIndex].minLabel }}</span>
            <span class="max-label">{{ qItems[qItemIndex].maxLabel }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="slider-inner">
          <a-slider v-model:value="qItems[qItemIndex].value" :min="qItems[qItemIndex].minScore" :max="qItems[qItemIndex].maxScore" :step="qItems[qItemIndex].step" />
          <div v-if="qItems[qItemIndex].showLabels" class="slider-labels">
            <span class="min-label">{{ qItems[qItemIndex].minLabel || qItems[qItemIndex].minScore }}</span>
            <span class="max-label">{{ qItems[qItemIndex].maxLabel || qItems[qItemIndex].maxScore }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- 设置面板 -->
  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="currentItemIndex === qItemIndex">
    <div class="num">{{ qItemIndex + 1 }}. 评分题</div>

    <div class="prop-item">
      <h4>此题必答</h4>
      <a-switch v-model:checked="qItems[qItemIndex].required" size="small" />
    </div>
    <div class="prop-item">
      <h4>最低分</h4>
      <a-input-number v-model:value="qItems[qItemIndex].minScore" :min="0" :max="qItems[qItemIndex].maxScore" size="small" style="width: 100px">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>
    <div class="prop-item">
      <h4>最高分</h4>
      <a-input-number v-model:value="qItems[qItemIndex].maxScore" :min="1" :max="100" size="small" style="width: 100px">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>
    <div class="prop-item">
      <h4>量级刻度</h4>
      <a-radio-group v-model:value="qItems[qItemIndex].step" size="small">
        <a-radio-button :value="1">1</a-radio-button>
        <a-radio-button :value="0.5">0.5</a-radio-button>
      </a-radio-group>
    </div>
    <div v-if="qItems[qItemIndex].maxScore <= 10" class="prop-item">
      <h4>自定义图标</h4>
      <div class="icon-preview" @click="showIconSelect = true">
        <template v-if="qItems[qItemIndex].customIcon">
          <Icon :name="qItems[qItemIndex].customIcon.icon" :key="qItems[qItemIndex].customIcon.icon" />
          <icon name="remove" size="1.2em" class="clear-icon" @click="clearIcon" />
        </template>
        <template v-else>
          <icon name="plus" />
          <span>选择图标</span>
        </template>
      </div>
    </div>

    <div class="prop-item">
      <h4>极值标签</h4>
      <a-switch v-model:checked="qItems[qItemIndex].showLabels" size="small" />
    </div>

    <template v-if="qItems[qItemIndex].showLabels">
      <div class="prop-item">
        <h4>最低分标签</h4>
        <a-input v-model:value="qItems[qItemIndex].minLabel" size="small" placeholder="最低" style="width: 120px" />
      </div>
      <div class="prop-item">
        <h4>最高分标签</h4>
        <a-input v-model:value="qItems[qItemIndex].maxLabel" size="small" placeholder="最高" style="width: 120px" />
      </div>
    </template>

    <!-- 评分提示设置 -->
    <div class="prop-item column">
      <h4>评分提示</h4>
      <div class="tips-list">
        <div v-for="(tip, index) in qItems[qItemIndex].tips" :key="index" class="tip-item">
          <a-input-number v-model:value="tip.score" :min="qItems[qItemIndex].minScore" :max="qItems[qItemIndex].maxScore" @change="(val) => handleScoreChange(val, index)" class="tip-score" size="small">
            <template #addonAfter>分</template>
          </a-input-number>
          <a-input v-model:value="tip.text" size="small" placeholder="请输入分数描述" />
          <icon name="del" class="remove-tip" @click="removeTip(index)" />
        </div>
        <a-button type="dashed" size="small" @click="addTip"> 添加提示 </a-button>
      </div>
    </div>

    <!-- 图标选择弹窗 -->
    <a-modal v-model:open="showIconSelect" :title="'选择图标'" :footer="null" width="800px" :destroyOnClose="true">
      <IconSelect @iconSelect="handleIconSelect" />
    </a-modal>
  </Teleport>
  <Teleport to=".assist">
    <pre>{{ JSON.stringify(qItems, null, 2) }}</pre>
  </Teleport>
</template>

<script setup>
import { inject, computed, onBeforeMount, watch, ref, h } from 'vue'
import { message } from 'ant-design-vue'
import IconSelect from '../IconSelect.vue'
import Icon from '../Icon.vue'

const props = defineProps(['qItemIndex'])
const qItems = inject('qItems')
const currentItemIndex = inject('currentItemIndex')
const showIconSelect = ref(false)

// 计算rate组件的props
const rateProps = computed(() => {
  const item = qItems.value[props.qItemIndex]
  if (item.customIcon) {
    return {
      character: () =>
        h(Icon, {
          name: item.customIcon.icon,
          key: item.customIcon.icon,
          style: { fontSize: '20px' }
        })
    }
  }
  return {}
})

// 处理图标选择
function handleIconSelect({ iconType, icon }) {
  qItems.value[props.qItemIndex].customIcon = {
    type: iconType,
    icon: icon
  }
  setTimeout(() => {
    showIconSelect.value = false
  }, 0)
}

const getCurrentTip = computed(() => {
  const currentValue = Math.floor(qItems.value[props.qItemIndex].value)
  const tips = qItems.value[props.qItemIndex].tips
  if (!tips.length) return ''

  const validTips = tips.filter((tip) => tip.score !== null && tip.score !== undefined)
  if (!validTips.length) return ''

  validTips.sort((a, b) => a.score - b.score)
  let closestTip = validTips[0]

  for (const tip of validTips) {
    if (tip.score <= currentValue) {
      closestTip = tip
    } else {
      break
    }
  }

  return closestTip.text
})

function handleScoreChange(newScore, currentIndex) {
  if (newScore === null || newScore === undefined) {
    qItems.value[props.qItemIndex].tips[currentIndex].score = qItems.value[props.qItemIndex].minScore
    return
  }

  const tips = qItems.value[props.qItemIndex].tips
  const duplicateIndex = tips.findIndex((tip, index) => tip.score === newScore && index !== currentIndex)

  if (duplicateIndex !== -1) {
    // 从最小分开始找一个未使用的分数
    const minScore = qItems.value[props.qItemIndex].minScore
    const maxScore = qItems.value[props.qItemIndex].maxScore
    let availableScore = minScore

    while (availableScore <= maxScore) {
      if (!tips.some((tip) => tip.score === availableScore)) {
        qItems.value[props.qItemIndex].tips[currentIndex].score = availableScore
        // message.success('已自动调整为可用分数')
        return
      }
      availableScore++
    }

    // 如果找不到可用分数，还原为原来的分数
    qItems.value[props.qItemIndex].tips[currentIndex].score = tips[currentIndex].score
    message.warning('没有可用的分数')
    return
  }

  // 如果没有重复，更新为新分数
  qItems.value[props.qItemIndex].tips[currentIndex].score = newScore
}

function addTip() {
  const tips = qItems.value[props.qItemIndex].tips
  const minScore = qItems.value[props.qItemIndex].minScore

  // 找到一个未使用的分数
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

onBeforeMount(() => {
  // 初始化默认值
  const item = qItems.value[props.qItemIndex]
  item.required ??= false
  item.minScore ??= 0
  item.maxScore ??= 5
  item.step ??= 1
  item.value ??= 0
  item.tips ??= []
  item.customIcon ??= null
  item.showLabels ??= false
  item.minLabel ??= ''
  item.maxLabel ??= ''
})

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

// 添加清除图标的功能
function clearIcon(e) {
  e.stopPropagation()
  qItems.value[props.qItemIndex].customIcon = null
}
</script>

<style scoped lang="scss">
.rate-wrap {
  padding: 12px 0;
}

.rate-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rate-tips {
  color: var(--text-secondary);
  font-size: 14px;
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
  .help {
    margin-left: 4px;
    color: var(--text-secondary);
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

.icon-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px dashed var(--border-medium);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  position: relative;

  &:hover {
    border-color: var(--c-brand);
    color: var(--c-brand);

    .clear-icon {
      display: block;
    }
  }
}

.clear-icon {
  display: none;
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 2px;
  background: var(--bg-primary);
  border-radius: 50%;
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);

  &:hover {
    color: var(--c-red);
    border-color: var(--c-red);
  }
}

.rate-inner {
  position: relative;
  width: fit-content;
}

.rate-labels {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.slider-inner {
  position: relative;
  width: 80%;
}

.slider-labels {
  position: absolute;
  width: 100%;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  // margin-top: -12px;
  padding: 0 4px;
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
