<template>
  <VueDraggable v-model="qItems[qItemIndex].options" tag="ul" handle=".q-handle" class="options" ghostClass="ghost-opt">
    <li v-for="(item, index) in qItems[qItemIndex].options" :id="item.id" :key="item.id" class="item" @click.stop="clickOption($event, index)">
      <icon name="handle" class="q-handle" />
      <span class="checkbox"></span>
      <XEditer class="text" v-model="item.text" :autofocus="index == autoFocusIndex ? true : false"></XEditer>
      <!-- <div v-if="item.fill?.isShow" class="fillbox"></div> -->
      <icon name="del" class="ico remove" size="1.5em" title="删除" @click.stop="removeOption(index)"></icon>
    </li>
  </VueDraggable>

  <div @click.stop="addOption" class="add-option"><icon name="plus" />添加选项</div>

  <!-- 选项设置 -->
  <Teleport to="#__WENJUAN_SETTINGS" v-if="currentItemIndex === qItemIndex">
    <div class="num">{{ qItemIndex + 1 }}. 多选题</div>
    <a-tabs v-model:activeKey="tabName" type="card" class="tabs">
      <!-- Tabs:题目设置 -->
      <a-tab-pane key="item" tab="题目设置">
        <div class="prop-item">
          <h4>本题必答</h4>
          <a-switch v-model:checked="qItems[qItemIndex].required" size="small" />
        </div>
        <div class="prop-item">
          <h4>可选范围</h4>
          <div style="display: flex; flex-direction: row; align-items: center">
            <div style="margin-right: 4px">最少</div>
            <a-select v-model:value="qItems[qItemIndex].minRange" placeholder="请选择" size="small" style="width: 70px" @change="fixMaxRange">
              <a-select-option :value="0">不限</a-select-option>
              <a-select-option v-for="i in qItems[qItemIndex].options.length" :key="i" :value="i"> {{ i }}项 </a-select-option>
            </a-select>
            <div style="margin: 0 4px 0 12px">最多</div>
            <a-select v-model:value="qItems[qItemIndex].maxRange" placeholder="请选择" size="small" style="width: 70px">
              <a-select-option :value="0">不限</a-select-option>
              <a-select-option v-for="i in maxRangeArray" :key="i" :value="i"> {{ i }}项 </a-select-option>
            </a-select>
          </div>
        </div>
      </a-tab-pane>
      <!-- Tabs:选项设置 -->
      <a-tab-pane v-if="currentOptionIndex >= 0" :key="'option'" :tab="'第' + (currentOptionIndex + 1) + '项设置'">
        <div class="prop-item">
          <h4>选项内容</h4>
          <XEditer style="width: 200px" class="text" v-model="qItems[qItemIndex].options[currentOptionIndex].text"></XEditer>
        </div>
      </a-tab-pane>
    </a-tabs>
  </Teleport>
</template>
<script setup>
import { inject, ref, onMounted, watch, computed, onBeforeMount } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6)
const { qItemIndex } = defineProps(['qItemIndex'])
const qItems = inject('qItems')
const currentItemIndex = inject('currentItemIndex')
const currentOptionIndex = ref(-1)
// const hoveredOptionIndex = ref(-1)
const autoFocusIndex = ref(-1)
const tabName = ref('')

const maxRangeArray = computed(() => {
  var arr = []
  for (let i = qItems.value[qItemIndex].minRange; i <= qItems.value[qItemIndex].options.length; i++) {
    if (i) arr.push(i)
  }
  return arr
})

watch(currentOptionIndex, () => {
  console.log('currentOptionIndex', currentOptionIndex.value)
  setTab()
})

function addOption() {
  qItems.value[qItemIndex].options.push({ text: '', id: nanoid(), fill: { isShow: false } })
  currentOptionIndex.value = qItems.value[qItemIndex].options.length - 1
  autoFocusIndex.value = currentOptionIndex.value
}

function removeOption(index) {
  if (qItems.value[qItemIndex].options.length <= 1) {
    qItems.value[qItemIndex].options[0].text = ''
    return
  }
  qItems.value[qItemIndex].options.splice(index, 1)
  if (qItems.value[qItemIndex].minRange > qItems.value[qItemIndex].options.length) {
    qItems.value[qItemIndex].minRange = qItems.value[qItemIndex].options.length
  }
  if (qItems.value[qItemIndex].maxRange > qItems.value[qItemIndex].minRange) {
    qItems.value[qItemIndex].maxRange = qItems.value[qItemIndex].options.length
  }
  currentOptionIndex.value = -1
}

function clickOption(ev, index) {
  // ev.stopPropagation()
  currentOptionIndex.value = index
  const el = ev.currentTarget
  // console.log(el)
  el.classList.add('focus')
  document.addEventListener('mouseup', clickOutSide)

  function clickOutSide(event) {
    event.stopPropagation()
    const targetEl = event.target
    const settingsWrapBox = document.getElementById('__WENJUAN_SETTINGS').getBoundingClientRect()
    const inside = event.clientX > settingsWrapBox.left && event.clientX < settingsWrapBox.right && event.clientY > settingsWrapBox.top && event.clientY < settingsWrapBox.bottom
    if (inside || el.contains(targetEl)) {
      return
    } else {
      console.log('outside')
      callback(el)
    }
  }

  function callback(element) {
    element.classList.remove('focus')
    document.removeEventListener('mouseup', clickOutSide)
    currentOptionIndex.value = -1
  }
  // ev.stopPropagation()
}

function setTab() {
  if (currentOptionIndex.value == -1) {
    tabName.value = 'item'
  } else {
    tabName.value = 'option'
  }
}

onBeforeMount(() => {
  qItems.value[qItemIndex].minRange = qItems.value[qItemIndex].minRange || 0
  qItems.value[qItemIndex].maxRange = qItems.value[qItemIndex].maxRange || 0
  if (!qItems.value[qItemIndex].options) {
    qItems.value[qItemIndex].options = [{ text: '选项1' }]
  }
  setTab()
})

onMounted(() => {})

// // init
// // 赋予默认值

// 可选范围-根据最小值的选择修正最大值
function fixMaxRange() {
  if (qItems.value[qItemIndex].maxRange < qItems.value[qItemIndex].minRange && qItems.value[qItemIndex].maxRange != 0) {
    qItems.value[qItemIndex].maxRange = qItems.value[qItemIndex].minRange
  }
}
</script>

<style scoped lang="scss">
h4 {
  margin: 0;
  padding: 0;
  line-height: 100%;
}

:has(.ghost-opt) {
  .item:not(.ghost-opt) > * {
    pointer-events: none;
    user-select: none;
  }
  .item {
    .text {
      border-color: transparent !important;
    }
    .remove {
      opacity: 0 !important;
    }
  }
}

.options {
  padding: 0;

  .item {
    display: flex;
    margin-bottom: 8px;
    align-items: flex-start;
    border: 2px solid transparent;
    &:hover {
      .text {
        border: 1px dashed var(--c-brand);
      }
      .remove {
        opacity: 1;
      }
    }
    &.ghost-opt {
      /* display: none; */
      border-radius: 4px;
      border: 2px dashed var(--c-brand);
      // border: 0;
      box-shadow: none;
      background-color: var(--bg-brand);
      > * {
        opacity: 0;
      }
    }
  }
}

.q-handle {
  cursor: pointer;
  opacity: 0.5;
  color: var(--text-primary);
  margin-top: 1px;
  flex-shrink: 0;
  &:hover,
  &:active {
    opacity: 1;
  }
}

.checkbox {
  flex-shrink: 0;
  border: 1px solid #ccc;
  border-radius: 2px;
  width: 15px;
  height: 15px;
  margin-left: 10px;
  margin-top: 4px;
}
.text {
  flex-grow: 1;
  border: 1px solid #ffffff00;
  border-radius: 4px;
  padding: 4px;
  margin-left: 6px;
  transition: border 0.15s ease-in-out;
}
.focus .text {
  border: 1px solid var(--c-brand) !important;
}

.add-option {
  cursor: pointer;
  width: fit-content;
  color: var(--c-brand);
  padding: 4px 16px;
  border-radius: 4px;
  margin-left: 14px;
  &:hover {
    color: var(--c-brand);
    outline: 1px solid var(--c-brand);
  }
}

.ico {
  // padding-top: 6px;
  cursor: pointer;
  color: #888;
  &:link,
  &:visited {
    color: #888;
  }
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.remove {
  flex-shrink: 0;
  margin-left: 6px;
  &:hover,
  &:active {
    color: #f56c6c;
  }
}

.num {
  margin: 18px 8px;
  font-size: 16px;
  font-weight: 800;
}

.prop-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
}

/* 添加 Ant Design 相关样式覆盖 */
:deep(.ant-tabs-card) {
  border-left: 0px;
}

.fillbox {
  width: 40px;
  height: 20px;
  background: var(--bg-primary);
  border-radius: 4px;
  margin-left: 6px;
  border: 1px solid var(--border-medium);
}

pre {
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
