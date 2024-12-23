<template>
  <div class="fill-blank">
    <!-- 单项填空模式 -->
    <div v-if="!qItems[qItemIndex].multiMode" class="single-blank">
      <div class="user-blank">
        {{ qItems[qItemIndex].options[0].placeholder || '请填写' }}
      </div>
    </div>

    <!-- 多项填空模式 -->
    <VueDraggable v-else v-model="qItems[qItemIndex].options" tag="ul" handle=".q-handle" class="options" ghostClass="ghost-blank">
      <li v-for="(item, index) in qItems[qItemIndex].options" :key="item.id" class="item" @click.stop="clickBlank($event, index)">
        <icon name="handle" class="q-handle" />
        <div class="content">
          <XEditer class="text" v-model="item.text" :autofocus="index == autoFocusIndex ? true : false"></XEditer>
          <div class="user-blank">
            {{ item.placeholder || '用户填写内容' }}
          </div>
        </div>
        <icon name="del" class="ico remove" size="1.5em" title="删除" @click.stop="removeBlank(index)"></icon>
      </li>
    </VueDraggable>

    <!-- 多项填空模式下的添加按钮 -->
    <div v-if="qItems[qItemIndex].multiMode" @click.stop="addBlank" class="add-blank"><icon name="plus" />添加填空项</div>
  </div>

  <!-- 设置面板 -->
  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="currentItemIndex === qItemIndex">
    <div class="num">{{ qItemIndex + 1 }}. 填空题</div>
    <a-tabs v-model:activeKey="tabName" type="card" class="tabs">
      <a-tab-pane key="item" tab="题目设置">
        <div class="prop-item">
          <h4>多项填空</h4>
          <a-switch v-model:checked="qItems[qItemIndex].multiMode" size="small" @change="handleModeChange" />
        </div>
        <template v-if="!qItems[qItemIndex].multiMode">
          <div class="prop-item">
            <h4>本题必答</h4>
            <a-switch v-model:checked="qItems[qItemIndex].options[0].required" size="small" />
          </div>
          <div class="prop-item">
            <h4>占位文字</h4>
            <a-input v-model:value="qItems[qItemIndex].options[0].placeholder" size="small" style="width: 200px" />
          </div>
          <div class="prop-item">
            <h4>
              字数限制<a-tooltip title="0或空为不限制"><icon name="help" /></a-tooltip>
            </h4>
            <div class="range-input">
              <a-input-number v-model:value="qItems[qItemIndex].options[0].maxLength" size="small" :min="0" :max="2000" style="width: 150px">
                <template #addonAfter>字</template>
              </a-input-number>
            </div>
          </div>
          <div class="prop-item">
            <h4>格式限制</h4>
            <a-select v-model:value="qItems[qItemIndex].options[0].format" size="small" style="width: 150px">
              <a-select-option value="text">文字</a-select-option>
              <a-select-option value="number">数字</a-select-option>
              <a-select-option value="email">Email</a-select-option>
              <a-select-option value="url">网址</a-select-option>
              <a-select-option value="idcard">身份证</a-select-option>
              <a-select-option value="phone">手机号码</a-select-option>
            </a-select>
          </div>
        </template>
      </a-tab-pane>
      <a-tab-pane v-if="currentBlankIndex >= 0 && qItems[qItemIndex].multiMode" key="blank" :tab="'第' + (currentBlankIndex + 1) + '项设置'">
        <div class="prop-item">
          <h4>本项必答</h4>
          <a-switch v-model:checked="qItems[qItemIndex].options[currentBlankIndex].required" size="small" />
        </div>
        <div class="prop-item">
          <h4>占位文字</h4>
          <a-input v-model:value="qItems[qItemIndex].options[currentBlankIndex].placeholder" size="small" style="width: 200px" />
        </div>
        <div class="prop-item">
          <h4>字数限制</h4>
          <div class="range-input">
            <a-input-number v-model:value="qItems[qItemIndex].options[currentBlankIndex].maxLength" size="small" :min="0" :max="2000" style="width: 80px">
              <template #addonAfter>字</template>
            </a-input-number>
          </div>
        </div>
        <div class="prop-item">
          <h4>格式限制</h4>
          <a-select v-model:value="qItems[qItemIndex].options[currentBlankIndex].format" size="small" style="width: 200px">
            <a-select-option value="text">文字</a-select-option>
            <a-select-option value="number">数字</a-select-option>
            <a-select-option value="email">Email</a-select-option>
            <a-select-option value="url">网址</a-select-option>
            <a-select-option value="idcard">身份证</a-select-option>
            <a-select-option value="phone">手机号码</a-select-option>
          </a-select>
        </div>
      </a-tab-pane>
    </a-tabs>
  </Teleport>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { inject, ref, onBeforeMount, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6)
const { qItemIndex } = defineProps(['qItemIndex'])

const qItems = inject('qItems')
const currentItemIndex = inject('currentItemIndex')
const currentBlankIndex = ref(-1)
const autoFocusIndex = ref(-1)
const tabName = ref('item')

function addBlank() {
  if (!qItems.value[qItemIndex].options) {
    qItems.value[qItemIndex].options = []
  }
  qItems.value[qItemIndex].options.push({
    id: nanoid(),
    text: '题目' + (qItems.value[qItemIndex].options.length + 1),
    placeholder: '',
    required: false,
    maxLength: 0,
    format: 'text'
  })
  currentBlankIndex.value = qItems.value[qItemIndex].options.length - 1
  autoFocusIndex.value = currentBlankIndex.value
}

function removeBlank(index) {
  if (qItems.value[qItemIndex].options.length <= 1) {
    qItems.value[qItemIndex].options[0].text = ''
    return
  }
  qItems.value[qItemIndex].options.splice(index, 1)
  currentBlankIndex.value = -1
}

watch(currentBlankIndex, () => {
  setTab()
})

function setTab() {
  if (!qItems.value[qItemIndex].multiMode || currentBlankIndex.value == -1) {
    tabName.value = 'item'
  } else {
    tabName.value = 'blank'
  }
}

function clickBlank(ev, index) {
  currentBlankIndex.value = index
  const el = ev.currentTarget
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
      callback(el)
    }
  }

  function callback(element) {
    element.classList.remove('focus')
    document.removeEventListener('mouseup', clickOutSide)
    currentBlankIndex.value = -1
  }
}

function handleModeChange(checked) {
  if (checked && !qItems.value[qItemIndex].options?.length) {
    addBlank()
  } else if (!checked) {
    if (qItems.value[qItemIndex].options?.length > 1) {
      qItems.value[qItemIndex].options.splice(1)
    }
    currentBlankIndex.value = 0
  }
}

onBeforeMount(() => {
  // 初始化默认值
  qItems.value[qItemIndex].multiMode ??= false
  if (!qItems.value[qItemIndex].options) {
    addBlank()
  }
  setTab()
})
</script>

<style scoped lang="scss">
.user-blank {
  display: flex;
  align-items: center;
  padding: 12px;
  height: 42px;
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  min-width: 120px;
  color: var(--text-secondary);
}

.options {
  .item {
    display: flex;
    margin-bottom: 12px;
    align-items: flex-start;
    border: 2px solid transparent;

    &:hover {
      .text {
        border: 1px dashed var(--border-dark);
      }
      .remove {
        opacity: 1;
      }
      .q-handle {
        opacity: 1;
      }
    }
    &.ghost-blank {
      border-radius: 4px;
      border: 2px dashed var(--c-brand);
      background-color: var(--bg-brand);
      > * {
        opacity: 0 !important;
        user-select: none !important;
        pointer-events: none !important;
      }
    }

    .q-handle {
      cursor: pointer;
      opacity: 0;
      color: var(--text-primary);
      margin-top: 2px;
      flex-shrink: 0;
    }
  }

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.text {
  flex-grow: 1;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px;
  transition: border 0.15s ease-in-out;
}

.focus .text {
  border-color: transparent !important;
  background-color: var(--bg-tertiary);
}

.add-blank {
  cursor: pointer;
  width: fit-content;
  color: var(--c-brand);
  padding: 4px 16px;
  border-radius: 4px;
  margin-left: 8px;
  &:hover {
    color: var(--c-brand);
    outline: 1px solid var(--c-brand);
  }
}

.ico {
  cursor: pointer;
  color: var(--text-secondary);
  &:link,
  &:visited {
    color: var(--text-secondary);
  }
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.remove {
  flex-shrink: 0;
  margin-left: 6px;
  &:hover,
  &:active {
    color: var(--c-red);
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
  .help {
    margin-left: 4px;
    color: var(--text-secondary);
  }
}

.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
