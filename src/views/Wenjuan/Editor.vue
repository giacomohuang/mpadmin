<template>
  <div class="header">
    <div class="q-name">
      <a-tag color="blue" v-if="qPublished && !qDraft">草稿</a-tag>
      <a-tag color="green" v-if="qPublished">问卷收集中</a-tag>
      <!-- <a-tag color="red">已结束</a-tag> -->
      <span class="text" @click.stop="editQName">{{ qName }}</span>
      <icon class="icon-edit" name="edit" />
    </div>
    <div class="actions">
      <a-button @click="preview">预览</a-button>
      <a-button @click="publish">发布</a-button>
    </div>
  </div>
  <div class="main">
    <aside class="q-types" width="200">
      <VueDraggable v-model="QTYPES" tag="ul" animation="100" :group="{ name: 'group', pull: 'clone', put: false }" :clone="onClone" :sort="false">
        <li v-for="item in QTYPES" :key="item.id" @click="addItem(item)">{{ item.title }}</li>
      </VueDraggable>
    </aside>
    <main class="q-items" data-simplebar>
      <div class="tips" v-if="!qItems || qItems.length == 0">请点击题型按钮或将题型拖动到这里</div>
      <VueDraggable v-model="qItems" tag="ul" animation="100" group="group" ghostClass="dragging" @end="onDropped" @add="onDropped">
        <li v-for="(item, index) in qItems" class="q-item" :id="item.id" :key="item.id" :class="index == currentItemIndex ? 'selected' : ''" @mouseup="changeEditingItem(index)">
          <div class="title">
            <div class="number"><span class="required" :class="{ visible: item.required }">*</span>{{ index + 1 }}.&nbsp;&nbsp;</div>
            <XEditer class="text" v-model="qItems[index].title"></XEditer>
            <div class="logic-tag" @click="logicDrawer = true" :class="{ enabled: item.logic?.conditions?.length > 0 }">逻辑</div>
            <div class="opr">
              <a-tooltip title="复制" placement="top">
                <icon name="copy" class="items" @click="duplicateItem(index)" />
              </a-tooltip>
              <a-tooltip title="删除" placement="top">
                <icon name="remove" class="items" @click="removeItem(index)" />
              </a-tooltip>
            </div>
          </div>
          <div class="content">
            <component :is="QtypeComponents[item.type]" :qItemIndex="index" :key="item.id"></component>
          </div>
        </li>
      </VueDraggable>
    </main>
    <aside class="settings" width="300" id="__WENJUAN_SETTINGS">
      <div id="__WENJUAN_SETTINGS_CONTENT"></div>
    </aside>
  </div>
  <div class="footer">
    <div class="saved-time" v-if="savedTime">已自动保存: {{ savedTime }}</div>
  </div>
  <a-modal v-model:open="editNameModal" title="编辑问卷名称">
    <template #footer>
      <a-button @click.stop="editNameModal = false">取消</a-button>
      <a-button type="primary" @click.stop="updateQName">确定</a-button>
    </template>
    <a-input v-model:value="qNameInput" size="large" placeholder="请输入问卷名称" style="margin: 40px 0" />
  </a-modal>
  <Teleport to="body">
    <div class="drawer" v-if="logicDrawer">
      <div class="close" @click="logicDrawer = false"><icon name="remove" /></div>
      <Logic />
    </div>
  </Teleport>
  <a-modal v-model:open="previewModal" :footer="null" width="500px" wrapClassName="preview-modal">
    <template #closeIcon>
      <div class="preview-close"><icon name="remove" /></div>
    </template>
    <Preview v-if="previewModal" />
  </a-modal>
</template>

<router lang="json">
{
  "param": "/:id?"
}
</router>

<script setup>
import { provide, ref, nextTick, onBeforeMount, onBeforeUnmount, defineAsyncComponent, watch, onMounted } from 'vue'
import XEditer from '@/components/XEditer.vue'
import { VueDraggable } from 'vue-draggable-plus'
import 'simplebar'
import '@/assets/simplebar.css'
import API from '@/api/API'
import { customAlphabet } from 'nanoid'
import Logic from './Logic.vue'
import { router } from '@/router/router'
import Preview from './Preview.vue'
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 12)
import { debounce } from 'lodash-es'

const QTYPES = ref([
  { id: '0', title: '填空题', type: 'FillBlank' },
  { id: '1', title: '多选题', type: 'MultiChoice' },
  { id: '2', title: '单选题', type: 'SingleChoice' },
  { id: '4', title: '图片选择', type: 'ImageChoice' },
  { id: '5', title: '评分题', type: 'Rate' },
  { id: '6', title: 'NPS', type: 'NPS' }
])

function onClone(data) {
  const d = JSON.parse(JSON.stringify(data))
  const id = nanoid()
  d.id = id
  return d
}
const QtypeComponents = {
  MultiChoice: defineAsyncComponent(() => import('@/components/wenjuan/MultiChoice.vue')),
  SingleChoice: defineAsyncComponent(() => import('@/components/wenjuan/SingleChoice.vue')),
  FillBlank: defineAsyncComponent(() => import('@/components/wenjuan/FillBlank.vue')),
  ImageChoice: defineAsyncComponent(() => import('@/components/wenjuan/ImageChoice.vue')),
  Rate: defineAsyncComponent(() => import('@/components/wenjuan/Rate.vue')),
  NPS: defineAsyncComponent(() => import('@/components/wenjuan/NPS.vue'))
}

const currentItemIndex = ref(0)
const qItems = ref([])
const qName = ref('')
const qId = ref(null)
// 是否是发布状态
const qPublished = ref(false)
// 是否是草稿
const qDraft = ref(false)
const qSettings = ref(null)
const logicDrawer = ref(false)
const logics = ref([])
const editNameModal = ref(false)
const savedTime = ref('')
const qNameInput = ref('')
const previewModal = ref(false)
provide('qItems', qItems)
provide('logics', logics)
provide('qName', qName)
provide('currentItemIndex', currentItemIndex)

// 检查并清理不合理的逻辑连接
function cleanupLogic() {
  // 遍历所有带有logic属性的题目
  qItems.value.forEach((item) => {
    if (item.logic && item.logic.conditions) {
      // 获取当前题目的索引
      const currentIndex = qItems.value.findIndex((q) => q.id === item.id)

      // 过滤出合理的连接（只保留连接到更大索引题目的连接）
      item.logic.conditions = item.logic.conditions.filter((conn) => {
        const targetIndex = qItems.value.findIndex((q) => q.id === conn.toLogicId)
        return targetIndex > currentIndex
      })
    }
    if (item.logic?.optionsSelect) {
      // console.log('hit')
      item.logic.optionsSelect = item.logic.optionsSelect.filter((option) => {
        return item.options.find((q) => q.id === option.id)
      })
    }
  })
}

async function updateQName() {
  qName.value = qNameInput.value
  editNameModal.value = false
  await API.wenjuan.update({ _id: qId.value, name: qName.value })
  savedTime.value = new Date().toLocaleString()
}

function editQName() {
  editNameModal.value = true
  qNameInput.value = qName.value
}

// 数据初始化

function addItem(payload) {
  const data = JSON.parse(JSON.stringify(payload))

  data.id = nanoid()
  qItems.value.push(data)
  currentItemIndex.value = qItems.value.length - 1
  nextTick(() => {
    const el = document.getElementById(data.id)
    el.scrollIntoView({ block: 'nearest' })
  })
}

function removeItem(index) {
  qItems.value.splice(index, 1)
  if (qItems.value.length == 1) {
    currentItemIndex.value = 0
  } else {
    currentItemIndex.value = index - 1
  }
}

function duplicateItem(index) {
  // console.log(index)
  qItems.value.splice(index, 0, JSON.parse(JSON.stringify(qItems.value[index])))
  qItems.value[index + 1].id = nanoid()
  currentItemIndex.value = index + 1
  nextTick(() => {
    const el = document.getElementById(qItems.value[index + 1].id)
    el.scrollIntoView({ block: 'nearest' })
  })
}

function onDropped(e) {
  currentItemIndex.value = e.newIndex
}

function changeEditingItem(index) {
  currentItemIndex.value = index
}

function preview() {
  previewModal.value = true
}

function saveDraft() {
  console.log('saveDraft')
}

async function save(data) {
  // 保存前先清理失效的逻辑选项
  cleanupLogic()
  await API.wenjuan.update({ _id: qId.value, ...data })
  savedTime.value = new Date().toLocaleString()
}

function publish() {
  console.log('publish')
}

const debouncedSave = debounce(async (data) => {
  if (!qId.value) return
  save(data)
}, 1000)

onBeforeMount(async () => {
  const id = router.currentRoute.value.params.id
  let t = {}
  if (!id) {
    t = { _id: null, published: false, name: '未命名问卷', qSettings: {}, data: [] }
    let res = await API.wenjuan.update(t) // console.res
    t._id = res._id
    qId.value = res._id
    router.replace(`/wenjuan/editor/${res._id}`)
  } else {
    t = await API.wenjuan.get(id)
  }
  qId.value = t._id
  qName.value = t.name
  qItems.value = t.data
  qPublished.value = t.published
  qSettings.value = t.settings

  watch(
    qItems,
    (newValue) => {
      debouncedSave({ data: newValue })
      qDraft.value = true
    },
    { deep: true }
  )
})

onMounted(() => {})

onBeforeUnmount(() => {
  // dndQItems.destroy()
})
</script>

<style scoped lang="scss">
.header {
  display: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 54px;
  background: var(--bg-primary);
  max-width: 100%;
  border-bottom: 1px solid var(--border-medium);
  .q-name {
    display: flex;
    align-items: center;
    gap: 5px;
    &:hover {
      .icon-edit {
        opacity: 1;
      }
    }
    .text {
      cursor: pointer;
      font-size: 1.25em;
      font-weight: 500;
      max-width: 400px;
      // flex-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .icon-edit {
      cursor: pointer;
      opacity: 0;
      color: var(--text-secondary);
      transition: opacity 0.15s ease;
    }
  }
  .actions {
    display: flex;
    gap: 5px;
  }
}
.main {
  position: relative;
  display: grid;
  grid-template-areas: 'q-types q-items settings';
  grid-template-columns: 200px 1fr 300px;
  background: var(--bg-primary);
  //撑满高度
  height: calc(100vh - 142px);
  overflow: hidden;
}

.footer {
  height: 24px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-medium);
  gap: 12px;
  .saved-time {
    color: var(--text-secondary);
    &.blink {
      animation: blink 0.15s 6;
    }
  }
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 1;
  }
  40% {
    opacity: 0;
  }
}

.q-types {
  grid-area: q-types;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);

  ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    // padding-inline-start: 0;
    padding: 15px;
    cursor: pointer;
  }
  li {
    width: 80px;
    list-style: none;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 5px;
    text-align: center;
    padding: 8px 2px;
    margin: 5px 0px;
    &:hover {
      border-color: #1890ff;
    }
  }
}

.tips {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  padding: 12px;
  margin: 20px;
  border: 1px dashed var(--border-dark);
  background: var(--bg-primary);
  border-radius: 4px;
  &:hover {
    border-color: var(--c-brand-500);
  }
}

.q-items {
  position: relative;
  min-width: 400px;
  grid-area: q-items;
  overflow-x: hidden;
  max-height: calc(100vh - 142px);
  background: var(--bg-secondary);

  .selected {
    outline: 2px solid var(--c-brand-500);
  }
  .dragging {
    content-visibility: hidden;
    content: '';
    outline: 2px dashed var(--c-brand-500);
    // border: 0;
    box-shadow: none;
    background-color: var(--bg-brand);
    // > * {
    //   opacity: 0;
    // }
  }

  ul {
    position: relative;
    z-index: 2;
    min-height: 80px;
  }

  li {
    // display: flex;
    // flex-direction: row;
    position: relative;
    margin: 20px;
    // display: flex;
    padding: 20px 0;
    border-radius: 5px;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    box-shadow: 1px 3px 5px 2px var(--border-light);
    box-sizing: border-box;
    &:hover {
      .opr {
        opacity: 1;
      }
    }

    .title {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }

    .number {
      font-size: 16px;
      margin-top: 11px;
      width: 80px;
      text-align: right;
      .required {
        color: red;
        margin-right: 4px;
        visibility: hidden;
      }
      .visible {
        visibility: visible;
      }
    }
    .text {
      padding-top: 2px;
      font-size: 16px;
      white-space: normal;
      width: 100%;
      position: relative;
      :deep(.ProseMirror) {
        padding: 8px;
      }
      :deep(.editor) {
        border: 1px solid transparent;
        border-radius: 4px;
      }
      &:hover {
        :deep(.editor:not(:focus-within)) {
          border: 1px dashed var(--border-dark);
        }
      }
      &:focus-within {
        :deep(.editor) {
          // border: 1px dashed var(--border-dark);
          background: var(--bg-tertiary);
        }
      }
    }

    .opr {
      display: flex;
      opacity: 0;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      justify-content: flex-end;
      margin: 0 12px;
      padding: 8px 0;
      transition: opacity 0.15s ease;

      .items {
        opacity: 0.5;
        margin-right: 8px;
        transition: opacity 0.15s ease;
        &:hover,
        &:active {
          opacity: 1;
        }
      }
    }
  }
}
.content {
  margin: 20px 20px 0px 50px;
}

:has(.dragging) {
  .q-item * {
    pointer-events: none;
  }
}

.settings {
  grid-area: settings;
  padding: 12px;
  background: var(--bg-primary);
  overflow-y: auto;
  border-left: 1px solid var(--border-light);
}

.drawer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background: var(--bg-primary);
  z-index: 1000;
  overflow: hidden;
  .close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1001;
    cursor: pointer;
  }
}

.logic-tag {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 40px;
  height: 24px;
  font-size: 12px;
  padding: 0;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-white);
  background: var(--c-gray-300);
  border-radius: 5px 0 3px 0;
  cursor: pointer;
  &:hover:not(.enabled) {
    background: var(--c-gray-600);
  }
  &:hover.enabled {
    background: var(--c-brand-600);
  }
  &.enabled {
    background: var(--c-brand);
  }
}

.preview-close {
  position: absolute;
  cursor: pointer;
  background: none;
  border: 1px solid var(--c-white);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 4px;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-white);
  &:hover {
    background: var(--bg-secondary);
    color: var(--c-brand);
  }
}
</style>

<style>
.preview-modal {
  .ant-modal-content {
    background: transparent;
    box-shadow: none;
  }
  .ant-modal-close {
    background: none;
    &:hover {
      background: none;
    }
  }
}
</style>
