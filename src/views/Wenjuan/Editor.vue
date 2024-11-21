<template>
  <div class="main">
    <aside class="q-types" width="200">
      <VueDraggable v-model="QTYPES" tag="ul" animation="100" ghostClass="dragging" :group="{ name: 'group', pull: 'clone', put: false }" :clone="onClone" :sort="false">
        <li v-for="item in QTYPES" :key="item.id" @click="addTopic(item)">{{ item.name }}</li>
      </VueDraggable>
    </aside>
    <main class="q-items" data-simplebar>
      <div class="tips" v-if="!qItems || qItems.length == 0">请点击题型按钮或将题型拖动到这里</div>
      <VueDraggable v-model="qItems" tag="ul" animation="100" group="group" ghostClass="dragging" @end="onDropped" @add="onDropped">
        <li v-for="(item, index) in qItems" class="q-item" :id="item.id" :key="item.id" :class="index == selectedTopicIndex ? 'selected' : ''" @mouseup="changeEditingTopic(index)">
          <div class="number"><span class="required" :class="{ visible: item.required }">*</span>{{ index + 1 }}.&nbsp;&nbsp;</div>
          <div class="wrap">
            <div class="title">
              <XEditer class="text" v-model="qItems[index].title"></XEditer>
              <div class="opr">
                <a-tooltip title="移动" placement="top">
                  <icon name="menu" class="handle items" />
                </a-tooltip>
                <a-tooltip title="复制" placement="top">
                  <icon name="data" class="items" @click="duplicateTopic(index)" />
                </a-tooltip>
                <a-tooltip title="删除" placement="top">
                  <icon name="del" class="items" @click="removeTopic(index)" />
                </a-tooltip>
              </div>
            </div>
            <component :is="TopicComponents[item.type]" :index="index" :key="item.id"></component>
          </div>
        </li>
      </VueDraggable>
    </main>
    <aside class="settings" width="300" id="settings"></aside>
  </div>
</template>

<script setup>
import { provide, ref, computed, nextTick, onBeforeMount, onBeforeUnmount, defineAsyncComponent } from 'vue'
import XEditer from '@/components/wenjuan/XEditer.vue'
import { VueDraggable } from 'vue-draggable-plus'
import 'simplebar'
import '@/assets/simplebar.css'
import API from '@/api/API'
import { customAlphabet } from 'nanoid'
import 'simplebar'
import '@/assets/simplebar.css'
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 8)

const QTYPES = ref([
  {
    id: '1',
    name: '多选题',
    type: 'MultiChoice',
    // default data
    title: '多选题',
    required: true,
    options: [
      { name: '选项1', value: 0, id: nanoid(), fill: { isShow: true, length: 20, type: 'text' } },
      { name: '选项2', value: 1, id: nanoid(), fill: { isShow: false, length: 20, type: 'text' } },
      { name: '选项3', value: 2, id: nanoid(), fill: { isShow: false, length: 20, type: 'text' } }
    ]
  },
  {
    id: '2',
    name: '单选题',
    type: 'SingleChoice'
  },
  {
    id: '3',
    name: '下拉选择',
    type: 'DropDown'
  },
  {
    id: '4',
    name: '图片选择',
    type: 'ImageChoice'
  },
  {
    id: '5',
    name: '评分',
    type: 'RankChoice'
  }
])

// import XEditor from '../components/XEditer.vue'
// import Utils from '@/base/utils'

// const qItemsRef = ref(null)
// const qTypesRef = ref(null)

function onClone(data) {
  const d = JSON.parse(JSON.stringify(data))
  const id = nanoid()
  d.id = id
  return d
}

function scrollFn(el) {
  console.log(el)
}

const TopicComponents = {
  MultiChoice: defineAsyncComponent(() => import('@/components/wenjuan/MultiChoice.vue')),
  SingleChoice: defineAsyncComponent(() => import('@/components/wenjuan/SingleChoice.vue'))
}

const selectedTopicIndex = ref(0)
const qItems = ref([])
const selectedOptionIndex = ref(-1)
const settings = ref(null)

provide('qItems', qItems)
provide('selectedOptionIndex', selectedOptionIndex)
provide('selectedTopicIndex', selectedTopicIndex)

// 数据初始化

function addTopic(payload) {
  const data = JSON.parse(JSON.stringify(payload))

  data.id = nanoid()
  qItems.value.push(data)
  selectedTopicIndex.value = qItems.value.length - 1
  nextTick(() => {
    const el = document.getElementById(data.id)
    el.scrollIntoView({ block: 'nearest' })
  })
}

function removeTopic(index) {
  qItems.value.splice(index, 1)
  if (qItems.value.length == 1) {
    selectedTopicIndex.value = 0
  } else {
    selectedTopicIndex.value = index - 1
  }
}

function duplicateTopic(index) {
  console.log(index)
  qItems.value.splice(index, 0, JSON.parse(JSON.stringify(qItems.value[index])))
  qItems.value[index + 1].id = nanoid()
  selectedTopicIndex.value = index + 1
  nextTick(() => {
    const el = document.getElementById(qItems.value[index + 1].id)
    el.scrollIntoView({ block: 'nearest' })
  })
}

function onDropped(e) {
  selectedTopicIndex.value = e.newIndex
}

function changeEditingTopic(index) {
  console.log('click')
  selectedTopicIndex.value = index
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
  // position: absolute;
  top: 50px;
  padding: 10px;
  margin: 10px;
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  text-align: center;
  color: #333;
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
    // box-shadow: 0 0 0 2px var(--c-brand-200);
  }
  .dragging {
    /* display: none; */
    border: 2px dashed var(--c-brand-500);
    // border: 0;
    box-shadow: none;
    background-color: var(--bg-brand);
    > * {
      opacity: 0;
    }
  }

  li {
    margin: 20px;
    display: flex;
    padding: 20px;
    border-radius: 5px;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    box-shadow: 1px 3px 5px 2px var(--border-light);

    .wrap {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .title {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .number {
      font-size: 16px;
      padding-top: 10px;
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
        border: 1px solid #ffffff00;
        border-radius: 4px;
      }
      &:hover {
        :deep(.editor) {
          border: 1px dashed #68cef8;
        }
      }
      &:focus-within {
        :deep(.editor) {
          border: 1px solid #68cef8;
        }
      }
    }

    .opr {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      justify-content: flex-end;
      margin-left: 50px;
      padding: 8px 0;

      .items {
        opacity: 0.5;
        margin-right: 8px;
        &:hover,
        &:active {
          opacity: 1;
        }
      }
    }
  }
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
