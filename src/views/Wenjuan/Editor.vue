<template>
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
</template>

<script setup>
import { provide, ref, nextTick, onBeforeMount, onBeforeUnmount, defineAsyncComponent } from 'vue'
import XEditer from '@/components/XEditer.vue'
import { VueDraggable } from 'vue-draggable-plus'
import 'simplebar'
import '@/assets/simplebar.css'
import API from '@/api/API'
import { customAlphabet } from 'nanoid'
import 'simplebar'
import '@/assets/simplebar.css'
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 12)

const QTYPES = ref([
  { id: '0', title: '填空题', type: 'FillBlank' },
  { id: '1', title: '多选题', type: 'MultiChoice' },
  { id: '2', title: '单选题', type: 'SingleChoice' },
  { id: '4', title: '图片选择', type: 'ImageChoice' },
  { id: '5', title: '评分题', type: 'Rate' },
  { id: '6', title: '量表题', type: 'Scale' },
  { id: '7', title: 'NPS', type: 'NPS' }
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
  // RankChoice: defineAsyncComponent(() => import('@/components/wenjuan/RankChoice.vue'))
}

const currentItemIndex = ref(0)
const qItems = ref([])
const settings = ref(null)

provide('qItems', qItems)
provide('currentItemIndex', currentItemIndex)

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
  console.log(index)
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

onBeforeMount(async () => {
  const id = 12
  let t = await API.wenjuan.get(id).then((res) => {
    return res
  })
  qItems.value = t.data
  // console.log(qItems.value)
  settings.value = t.settings

  // dndQItems.init()
  // dndQTypes.init()
})

onBeforeUnmount(() => {
  // dndQItems.destroy()
})
</script>

<style scoped lang="scss">
.main {
  position: relative;
  display: grid;
  grid-template-areas: 'q-types q-items settings';
  grid-template-columns: 200px 1fr 300px;
  background: var(--bg-primary);
  height: calc(100vh - 64px);
  overflow: hidden;
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
  max-height: calc(100vh - 64px);
  background: var(--bg-secondary);

  .selected {
    border: 2px solid var(--c-brand-500);
  }
  .dragging {
    content-visibility: hidden;
    content: '';
    border: 2px dashed var(--c-brand-500);
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
    margin: 20px;
    // display: flex;
    padding: 20px 0;
    border-radius: 5px;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    box-shadow: 1px 3px 5px 2px var(--border-light);
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
</style>
