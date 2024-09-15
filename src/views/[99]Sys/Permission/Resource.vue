<template>
  <div class="mb-3 flex items-center gap-3">
    <a-button @click="removeSel">批量删除勾选项</a-button>
    <div class="relative flex items-center">
      <icon name="search" class="absolute m-2"></icon>
      <input class="h-8 w-56 rounded-md border border-secondary bg-primary px-8 outline-none duration-300 focus:border-brand-500 focus:ease-in" placeholder="搜索组或权限点名称" v-model="keywords" />
    </div>
  </div>

  <div class="flex max-h-[calc(100%-46px)] w-[800px] overflow-y-auto rounded-md border border-primary">
    <ul class="border-r border-primary">
      <li v-for="root in roots" :key="root.id" class="cursor-pointer px-5 py-3 text-base" :class="{ 'bg-secondary font-semibold': activeTabKey === root.id }" @click="onChange(root.id)">{{ root.name }}</li>
    </ul>
    <div class="hl-area relative flex-1" style="overflow-y: auto">
      <div v-if="keywords && resourcesFiltered.length == 0" class="p-4 text-secondary">没有符合条件的数据。<a href="####" @click="keywords = ''">清除搜索关键词</a></div>

      <div class="list"><ResourceList :data="resourcesFiltered.children" :pid="0" @open="openEditor" @remove="remove" v-if="resources"></ResourceList></div>
    </div>
  </div>

  <a-drawer title="资源编辑器" width="500px" :open="resourceEditor" @close="resourceEditor = false">
    <a-form ref="resourceFormRef" :model="resourceForm" :rules="vRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 20 }" @finish="submit">
      <a-form-item label="名称" :wrapper-col="{ span: 12 }" name="name">
        <a-input v-model:value="resourceForm.name" />
      </a-form-item>
      <a-form-item label="编码" name="code" required>
        <a-input v-if="editorMode === 1 ? currentResource.code : getCodePrefix(currentResource.code)" v-model:value="resourceForm.code" :addon-before="editorMode === 1 ? currentResource.code + '.' : getCodePrefix(currentResource.code) + '.'" />
        <a-input v-else v-model:value="resourceForm.code" />
      </a-form-item>
      <a-form-item label="类型" name="type" :wrapper-col="{ span: 20 }">
        <a-radio-group v-model:value="resourceForm.type">
          <a-radio :value="1" :checked="true">页面</a-radio>
          <a-radio :value="2">功能</a-radio>
          <a-radio :value="3">数据</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="排序" name="order" :wrapper-col="{ span: 5 }">
        <a-input v-model:value="resourceForm.order" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6 }">
        <a-button type="primary" html-type="submit">保存</a-button>
        <a-button type="link" @click="resourceEditor = false">取消</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
  <!-- <Teleport to="body">
    <div class="mask">hello</div>
    <div id="mp-dialog" class="mp-dialog">
      <div>确认删除？</div>
      <div class="flex justify-end gap-5">
        <a-button type="primary">确认</a-button>
        <a-button>取消</a-button>
      </div>
    </div>
  </Teleport> -->
</template>

<script setup>
import { ref, reactive, onMounted, inject, watch, computed, nextTick } from 'vue'
// import vDebounce from '@/directives/debounce'
import debounceRef from '@/js/debounceRef'
import ResourceList from './ResourceList.vue'
// import { resourceData } from './data'
import API from '@/api/API'

const resourceEditor = ref(false)
const resourceFormRef = ref()
const resourceForm = reactive({ type: 1 })
const isLoading = ref(false)
const activeTabKey = ref(null)
const keywords = debounceRef('', 500)
const resources = ref(null)
const EDITOR_MODE = { add: 1, edit: 2 }
let roots, orderMap, editorMode, currentResource

async function onChange(val) {
  activeTabKey.value = val
  // console.log(d)

  const res = await API.permission.resource.list(val, false)
  // orderMap = new Map(res.map((item) => [item.id, item.order ? 999 - item.order : 999]))
  resources.value = buildTree(res)
}

const resourcesFiltered = computed(() => {
  if (!keywords.value) return resources.value
  const ids = new Set()
  const directMatch = resources.value.filter((item) => item.name.includes(keywords.value) || item.code.includes(keywords.value))
  const matched = []

  directMatch.forEach((item) => {
    // 插入本身
    if (!ids.has(item.id)) {
      matched.push(item)
      ids.add(item.id)
    }

    let pathArr = item.path.split('-')
    // 查所有父元素,并插入
    let i
    for (i = 0; i < item.level - 1; i++) {
      if (!ids.has(parseInt(pathArr[i]))) {
        ids.add(parseInt(pathArr[i]))
        const parent = resources.value.find((a) => {
          return a.id == pathArr[i]
        })
        if (parent) {
          matched.push(parent)
        }
      }
    }

    // 查所有子元素,并插入
    const children = resources.value.filter((itm) => {
      if (!ids.has(itm.id) && itm.path.startsWith(item.path + '-')) {
        ids.add(itm.id)
        return true
      } else {
        return false
      }
    })
    // console.log('children', children)
    matched.push(...children)
  })
  return matched.sort(compareFn)
})

watch(resourcesFiltered, () => {
  nextTick(() => {
    if (!CSS.highlights) {
      warn('CSS Custom Highlight API not supported.')
      return
    }
    // 清除上个高亮
    CSS.highlights.clear()
    if (!resourcesFiltered.value || !keywords.value) return
    const article = document.querySelector('.hl-area')
    if (!article) return
    const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
    const allTextNodes = []
    let currentNode = treeWalker.nextNode()
    while (currentNode) {
      allTextNodes.push(currentNode)
      currentNode = treeWalker.nextNode()
    }
    // 查找所有文本节点是否包含搜索词
    const ranges = allTextNodes
      .map((el) => {
        return { el, text: el.textContent.toLowerCase() }
      })
      .map(({ text, el }) => {
        const indices = []
        let startPos = 0
        while (startPos < text.length) {
          const index = text.indexOf(keywords.value, startPos)
          if (index === -1) break
          indices.push(index)
          startPos = index + keywords.value.length
        }

        // 根据搜索词的位置创建选区
        return indices.map((index) => {
          const range = new Range()
          range.setStart(el, index)
          range.setEnd(el, index + keywords.value.length)
          return range
        })
      })

    // 创建高亮对象
    const searchResultsHighlight = new Highlight(...ranges.flat())
    // 注册高亮
    CSS.highlights.set('search-results', searchResultsHighlight)
  })
})

function removeSel() {
  const items = resources.value.filter((item) => {
    if (item.checked) {
      removeItems.push(items)
    }
  })
}

// 清空所有数据
function clearData(data) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = null // 或者设置为默认值
    }
  }
}

function getCodePrefix(code) {
  if (!code || code.indexOf('.') === -1) {
    return ''
  }
  return code.replace(/\.[^.]+$/, '')
}

const vRules = {
  name: [
    { required: true, message: '名称不能为空' },
    {
      validator: async (_rule, value) => {
        if (value == 'huangjia') {
          return Promise.reject('重名了')
        } else {
          return Promise.resolve()
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '编码不能为空' },
    {
      validator: async (_rule, value) => {
        const code = getCodePrefix(currentResource.code) + value
        console.log(code)
        if (code === 'dashboard.lalala') {
          return Promise.reject('编码已存在，请更换')
        } else {
          return Promise.resolve()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function remove(ev, path) {
  let removeItems = []
  for (let index = resources.value.length - 1; index >= 0; index--) {
    if (resources.value[index].path === path || resources.value[index].path.startsWith(path + '-')) {
      removeItems.push(resources.value[index].id)
    }
  }
  await API.permission.resource.remove(removeItems)
  const res = await API.permission.resource.list(activeTabKey.value, false)
  orderMap = new Map(res.map((item) => [item.id, item.order ? 999 - item.order : 999]))
  resources.value = res.sort(compareFn)
}

function openEditor(item, mode) {
  // console.e
  currentResource = item
  console.log(currentResource, mode)
  resourceEditor.value = true
  editorMode = EDITOR_MODE[mode]

  // 新增模式
  if (EDITOR_MODE[mode] === EDITOR_MODE.add) {
    nextTick(() => {
      clearData(resourceForm)
      resourceForm.type = 1
    })
  }
  // 修改模式
  else if (EDITOR_MODE[mode] === EDITOR_MODE.edit) {
    resourceForm.name = item.name
    resourceForm.code = item.code.split('.').pop()
    resourceForm.type = item.type
    resourceForm.order = item.order
  }
}

async function submit() {
  const item = { ...resourceForm }
  // 新增模式
  if (editorMode === EDITOR_MODE.add) {
    console.log('add')
    item.level = currentResource.level + 1
    item.pid = currentResource.id
    // 这里先传父节点路径，到服务器端获得了节点id后再拼接成完整的path
    item.path = currentResource.path
    item.code = currentResource.code + '.' + resourceForm.code
    item.id = null
    await API.permission.resource.add(item)
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.edit) {
    item.path = currentResource.path
    item.code = currentResource.code
    item.pid = currentResource.pid
    item.id = currentResource.id
    item.level = currentResource.level
    item.code = getCodePrefix(currentResource.code) + '.' + resourceForm.code
    console.log('edit', item)
    await API.permission.resource.update(item)
  } else {
    throw new Error('Editor Mode Error.')
  }

  const res = await API.permission.resource.list(activeTabKey.value, false)
  orderMap = new Map(res.map((item) => [item.id, item.order ? 999 - item.order : 999]))
  resources.value = res.sort(compareFn)
  resourceEditor.value = false
}

const compareFn = (a, b) => {
  let pathOrderA = '',
    pathOrderB = ''
  a.path.split('-').forEach((item) => {
    const id = parseInt(item)
    pathOrderA += `(${orderMap.get(id)})${id}-`
  })
  b.path.split('-').forEach((item) => {
    const id = parseInt(item)
    pathOrderB += `(${orderMap.get(id)})${id}-`
  })
  // console.log(pathOrderA, pathOrderB)
  return pathOrderA > pathOrderB ? 1 : -1
}

function buildTree(items) {
  // const tree = [{ id: null, code: '', name: '页面与功能', type: 1, pid: null, children: [] }]
  const tree = []
  const itemMap = new Map(items.map((item) => [item.id, item]))

  items.forEach((item) => {
    const parent = item.pid === null ? tree : itemMap.get(item.pid)
    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(itemMap.get(item.id))
  })
  return tree
}

onMounted(async () => {
  isLoading.value = true
  roots = await API.permission.resource.list(null, true)
  activeTabKey.value = roots[0].id

  const res = await API.permission.resource.list(activeTabKey.value, false)
  resources.value = buildTree(res)
  // orderMap = new Map(res.map((item) => [item.id, item.order ? 999 - item.order : 999]))
  //  = res.sort(compareFn)
})
</script>

<style scoped lang="scss">
/*
.mask {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1999;
  min-height: 100vh;
  min-width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
}
#mp-dialog {
  z-index: 2000;
  position: absolute;
  width: 200px;
  padding: 12px;
  border: 1px solid var(--border-primary);
  border-radius: 5px;
  background: var(--bg-primary);
  display: none;
  &:before,
  &:after {
    content: '';
    width: 0;
    height: 0;
    font-size: 0;
    overflow: hidden;
    display: block;
    border-width: 5px;
    border-color: var(--border-primary) transparent transparent transparent;
    // border-style: dashed dashed dashed dashed;
    position: absolute;
    bottom: -10px;
    left: 20px;
  }

  &:after {
    bottom: -9px;
    border-color: white transparent transparent transparent;
  }
}
*/
::highlight(search-results) {
  background-color: #4e9a06;
  color: white;
}
</style>
