<template>
  <VueDraggable v-model="qItems[props.index].options" handle=".handle" item-key="id" ghost-class="ghost">
    <div v-for="(element, index) in qItems[props.index].options" :key="element.id" class="option" @mouseover="hoveredOptionIndex = index" @click="clickOption($event, index)" @mouseout="hoveredOptionIndex = -1">
      <icon name="menu" class="handle" />
      <span class="checkbox"></span>
      <XEditer class="text" v-model="element.name" :class="{ inputbox: element.fill?.isShow }" :autofocus="index == autoFocusIndex ? true : false"></XEditer>
      <icon name="del" class="ico remove" size="1.5em" :class="{ visable: hoveredOptionIndex == index }" title="删除" @click="removeOption(index)"></icon>
    </div>
    <div class="title"></div>
  </VueDraggable>
  <div style="margin: 12px 0 0px 28px"><a href="####" @click="addOption">+ 添加选项</a></div>

  <!-- 选项设置 -->
  <Teleport to="#settings" v-if="selectedTopicIndex === props.index">
    <div class="num">{{ props.index + 1 }}. 多选题</div>
    <a-tabs v-model:activeKey="tabPosition" type="card" class="tabs" id="optionPanel">
      <!-- Tabs:选项 -->
      <a-tab-pane key="topic" tab="题目设置">
        <div class="prop-item">
          <h4>本题必答</h4>
          <a-switch v-model:checked="qItems[props.index].required" size="small" />
        </div>
        <div class="prop-item">
          <h4>可选范围</h4>
          <div style="display: flex; flex-direction: row; align-items: center">
            <div style="margin-right: 4px">最少</div>
            <a-select v-model:value="qItems[props.index].minRange" placeholder="请选择" size="small" style="width: 60px" @change="fixMaxRange">
              <a-select-option :value="0">不限</a-select-option>
              <a-select-option v-for="i in qItems[props.index].options.length" :key="i" :value="i"> {{ i }}项 </a-select-option>
            </a-select>
            <div style="margin: 0 4px 0 12px">最多</div>
            <a-select v-model:value="qItems[props.index].maxRange" placeholder="请选择" size="small" style="width: 60px">
              <a-select-option :value="0">不限</a-select-option>
              <a-select-option v-for="i in maxRangeArray" :key="i" :value="i"> {{ i }}项 </a-select-option>
            </a-select>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane v-if="selectedOptionIndex >= 0" :key="'option'" :tab="'第' + (selectedOptionIndex + 1) + '项设置'"> </a-tab-pane>
    </a-tabs>
  </Teleport>
</template>
<script setup>
import { inject, ref, onMounted, watch, computed } from 'vue'
import XEditor from '@/components/wenjuan/XEditer.vue'
import { VueDraggable } from 'vue-draggable-plus'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 8)
const props = defineProps(['index'])
const qItems = inject('qItems')
const selectedTopicIndex = inject('selectedTopicIndex')
const selectedOptionIndex = inject('selectedOptionIndex')
const hoveredOptionIndex = ref(-1)
const autoFocusIndex = ref(-1)
const tabPosition = ref('')

qItems.value[props.index].minRange = qItems.value[props.index].minRange || 0
qItems.value[props.index].maxRange = qItems.value[props.index].maxRange || 0

// const onClickOutside = (element, callback) => {
//   document.addEventListener('click', (e) => {
//     if (!element.contains(e.target)) callback()
//   })
// }

// document.onclick = (ev) => {
//   console.log(ev.target)
// }

function addOption() {
  qItems.value[props.index].options.push({ name: '', id: nanoid(), fill: { isShow: false } })
  selectedOptionIndex.value = qItems.value[props.index].options.length - 1
  autoFocusIndex.value = selectedOptionIndex.value
}

function removeOption(index) {
  if (qItems.value[props.index].options.length <= 1) {
    qItems.value[props.index].options[0].name = ''
    return
  }
  qItems.value[props.index].options.splice(index, 1)
  if (qItems.value[props.index].minRange > qItems.value[props.index].options.length) {
    qItems.value[props.index].minRange = qItems.value[props.index].options.length
  }
  if (qItems.value[props.index].maxRange > qItems.value[props.index].minRange) {
    qItems.value[props.index].maxRange = qItems.value[props.index].options.length
  }
  selectedOptionIndex.value = -1
}

function clickOption(ev, index) {
  // ev.stopPropagation()
  selectedOptionIndex.value = index
  const el = ev.currentTarget
  // console.log(el)
  el.classList.add('focus')
  document.addEventListener('mouseup', clickOutSide)

  function clickOutSide(event) {
    event.stopPropagation()
    const targetElement = event.target
    console.log('triggered click out side')
    console.log(targetElement)
    const optionPanel = document.getElementById('optionPanel')
    if (el.contains(targetElement) || event.target.contains(optionPanel)) {
      // console.log('esss')
      return
    } else {
      callback(el)
    }
  }

  function callback(element) {
    element.classList.remove('focus')
    document.removeEventListener('mouseup', clickOutSide)
    selectedOptionIndex.value = -1
  }
  // ev.stopPropagation()
}

function setTabPostion() {
  if (selectedOptionIndex.value == -1) {
    tabPosition.value = 'topic'
  } else {
    tabPosition.value = 'option'
  }
}

onMounted(() => {
  setTabPostion()
})

// // init
// // 赋予默认值

watch(selectedOptionIndex, () => {
  setTabPostion()
})

let maxRangeArray = computed(() => {
  var arr = []
  for (let i = qItems.value[props.index].minRange; i <= qItems.value[props.index].options.length; i++) {
    if (i) arr.push(i)
  }
  return arr
})

if (!qItems.value[props.index].options) {
  qItems.value[props.index].options = [{ name: '选项1' }]
}

// 可选范围-根据最小值的选择修正最大值
function fixMaxRange() {
  if (qItems.value[props.index].maxRange < qItems.value[props.index].minRange && qItems.value[props.index].maxRange != 0) {
    qItems.value[props.index].maxRange = qItems.value[props.index].minRange
  }
}
</script>

<style scoped lang="scss">
.title {
  font-size: 12px;
  color: #000;
  line-height: 180%;
  padding: 0 0 4px 0;
  font-weight: 800;
}
.handle {
  cursor: pointer;
  opacity: 0.5;
  color: #000;
  margin: 6px 0 0 4px;

  &:hover,
  &:active {
    opacity: 1;
  }
}
.option {
  display: flex;
  // width: 100%;
  align-items: flex-start;
  margin-bottom: 6px;
  // background: #fff;
  &:hover .text {
    border: 1px dashed #68cef8;
  }
  // &:focus-within .text {
  //   border: 1px solid #68cef8;
  // }
}
.checkbox {
  // display: flex;
  // float: left;
  border: 1px solid #ccc;
  border-radius: 2px;
  width: 15px;
  height: 15px;
  margin: 5px 5px 0 5px;
  // margin-top: 8px;
}
.text {
  width: 100%;
  border: 1px solid #ffffff00;
  border-radius: 4px;
  :deep(.ProseMirror) {
    padding: 4px;
    min-height: 27px;
  }
}
.focus .text {
  border: 1px solid #68cef8 !important;
}

.ico {
  padding-top: 6px;
  cursor: pointer;
  color: #888;
  &:link,
  &:visited {
    color: #888;
  }
  visibility: hidden;
}

.visable {
  visibility: visible;
}
.remove {
  margin-left: 6px;
  &:hover,
  &:active {
    color: #f56c6c;
  }
}
.ghost {
  text-indent: -9999px;
  background: rgb(255, 233, 233);
  height: 10px;
  .checkbox {
    display: none;
  }
  :deep(*) {
    display: none;
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
</style>

<style lang="scss">
.inputbox .ProseMirror p:last-child {
  &::after {
    content: ' ';
    display: inline-block;
    position: relative;
    border: 1px solid #ccc;
    top: 0px;
    border-radius: 4px;
    width: 100px;
    height: 20px;
    margin-left: 8px;
  }
}
// .ProseMirror-trailingBreak {
//   // content: ' ';
//   // display: none;
// }
</style>
