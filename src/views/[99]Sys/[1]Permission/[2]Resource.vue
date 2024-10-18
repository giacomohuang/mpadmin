<template>
  <div class="m-8">
    <div class="z-50 mb-3 flex items-center gap-3">
      <!-- <a-button @click="removeSel">批量删除勾选项</a-button> -->
      <a-radio-group v-model:value="resourceType">
        <a-radio-button value="0">全部</a-radio-button>
        <a-radio-button value="1">仅页面</a-radio-button>
        <a-radio-button value="2">页面+功能</a-radio-button>
        <a-radio-button value="3">页面+数据</a-radio-button>
      </a-radio-group>
      <div class="relative flex items-center">
        <icon name="search" class="absolute m-2"></icon>
        <input class="h-8 w-56 rounded-md border border-secondary bg-primary px-8 outline-none duration-300 focus:border-brand-500 focus:ease-in" placeholder="输入关键词搜索" v-model="keywords" />
      </div>
    </div>

    <div class="flex w-[800px] rounded-md border border-primary">
      <div class="border-r border-primary">
        <div class="sticky top-0">
          <ul ref="rootsRef">
            <li v-for="root in roots" :key="root.id" :data-id="root.id" draggable="true" class="flex cursor-pointer justify-center px-5 py-3 text-base" :class="{ 'bg-secondary font-semibold': currentRootId === root.id }" @click="onChange(root.id)">{{ root.name }}</li>
          </ul>
          <div class="flex cursor-pointer justify-center px-5 py-3">
            <div class="w-[60px] rounded-md border border-transparent py-1 text-center text-base hover:border-brand-500 hover:text-brand-500" @click="openEditor(null, EDITOR_MODE.ADD)">+</div>
          </div>
        </div>
      </div>
      <div class="hl-area relative flex-1" style="overflow-y: auto">
        <div v-if="keywords && !resourceTree.children" class="p-4 text-secondary">没有符合条件的数据。<a href="####" @click="keywords = ''">清除搜索关键词</a></div>
        <div class="list" ref="listRef"><ResourceList :data="resourceTree.children" @open="openEditor" @remove="remove" @reorder="reorder" @toggleCollapse="toggleCollapse" v-if="resourceTree"></ResourceList></div>
      </div>
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
          <a-radio :value="1" :checked="resourceType <= 1">页面</a-radio>
          <a-radio :value="2" :checked="resourceType == 2">功能</a-radio>
          <a-radio :value="3" :checked="resourceType == 3">数据</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6 }">
        <a-button type="primary" html-type="submit">保存</a-button>
        <a-button type="link" @click="resourceEditor = false">取消</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, provide } from 'vue'
import debounceRef from '@/js/debounceRef'
import ResourceList from './ResourceList.vue'
import API from '@/api/API'
import { DnD } from '@/js/DnD.js'

// 常量定义
const EDITOR_MODE = { ADD: 1, EDIT: 2 }

// 响应式状态
const resourceEditor = ref(false)
const resourceFormRef = ref()
const resourceForm = reactive({ type: 1 })
const isLoading = ref(false)
const currentRootId = ref(null)
const keywords = debounceRef('', 500)
const resourceTree = ref(null)
const collapseIds = ref(new Set())
const resourceType = ref('0')
const roots = ref(null)
const rootsRef = ref(null)
const listRef = ref(null)

// DnD 实例
const dndResource = new DnD(listRef, (ids) => reorder(ids))
const dndRoot = new DnD(rootsRef, (ids) => reorder(ids))

// 非响应式状态
let editorMode
let currentResource = null
let resourceData = null

// 提供上下文
provide('resourceType', resourceType)
provide('collapseIds', collapseIds)

// 辅助函数
const buildTree = (data) => {
  const rsdata = JSON.parse(JSON.stringify(data))
  // console.log(rsdata)
  let items

  // 根据关键词过滤
  if (keywords.value) {
    const nodes = new Map()
    const itemMap = new Map(rsdata.map((item) => [item.id, item]))
    const hitItems = rsdata.filter((item) => item.name.toLowerCase().includes(keywords.value) && (resourceType.value == 0 || resourceType.value == item.type))
    // console.log(keywords.value)
    hitItems.forEach((item) => {
      const id = item.id
      let pid = item.pid
      if (!nodes.has(id)) {
        nodes.set(id, item)
        while (pid) {
          const parent = itemMap.get(pid)
          if (!parent) break
          nodes.set(parent.id, parent)
          pid = parent.pid
        }
        getChildren(id)
      }
    })
    items = Array.from(nodes.values())
    // 获取当前节点下的所有子节点
    function getChildren(id) {
      rsdata.forEach((itm) => {
        if (itm.pid == id) {
          nodes.set(itm.id, itm)
          getChildren(itm.id)
        }
      })
    }
  } else {
    items = rsdata
  }

  // 构建树形结构
  const tree = []
  const itemMap = new Map(items.map((item) => [item.id, item]))
  items.forEach((item) => {
    const parent = item.pid === null ? tree : itemMap.get(item.pid)
    if (!parent.children) {
      parent.children = []
    }
    let index = parent.children.findIndex((itm) => item.type < itm.type || (item.type === itm.type && item.order < itm.order))
    if (index != -1) {
      parent.children.splice(index, 0, item)
    } else {
      parent.children.push(item)
    }
  })
  return tree
}

const highlight = () => {
  if (!CSS.highlights) {
    warn('CSS Custom Highlight API not supported.')
    return
  }
  // 清除上个高亮
  CSS.highlights.clear()
  if (!resourceTree.value.children || !keywords.value) return
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
}

const getCodePrefix = (code) => {
  if (!code || code.indexOf('.') === -1) {
    return ''
  }
  return code.replace(/\.[^.]+$/, '')
}

const clearFormData = (data) => {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = null
    }
  }
}

// 主要功能函数
const onChange = async (val) => {
  currentRootId.value = val
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

const reorder = async (ids) => {
  await API.permission.resource.reorder(ids)
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

const toggleCollapse = (id) => {
  if (collapseIds.value.has(id)) {
    collapseIds.value.delete(id)
  } else {
    collapseIds.value.add(id)
  }
}

const remove = async (path, pid) => {
  const result = await API.permission.resource.remove(path)
  // 如果删除的是根节点数据，刷新roots列表
  if (pid == null) {
    roots.value = await API.permission.resource.list(null, true)
    roots.value.sort((a, b) => a.order - b.order)
    currentRootId.value = roots.value[0]?.id
  }
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

const openEditor = (item, mode) => {
  currentResource = item ? item : {}
  resourceEditor.value = true
  editorMode = mode
  if (item) {
    currentResource.maxOrder = item.children?.length
  } else {
    currentResource.maxOrder = roots.value.length
  }

  // 新增模式
  if (editorMode === EDITOR_MODE.ADD) {
    nextTick(() => {
      clearFormData(resourceForm)
      if (resourceType.value == 2) {
        resourceForm.type = 2
      } else if (resourceType.value == 3) {
        resourceForm.type = 3
      } else {
        resourceForm.type = 1
      }
    })
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.EDIT) {
    resourceForm.name = item.name
    resourceForm.code = item.code.split('.').pop()
    resourceForm.type = item.type
  }
}

const submit = async () => {
  const item = { ...resourceForm }
  let res
  // 新增模式
  if (editorMode === EDITOR_MODE.ADD) {
    item.id = null
    item.level = currentResource?.level ? currentResource.level + 1 : 1
    item.pid = currentResource?.id ? currentResource.id : null
    // 这里先传父节点路径，到服务器端获得了节点id后再拼接成完整的path
    item.path = currentResource?.path ? currentResource.path : ''
    item.code = currentResource?.code ? currentResource.code + '.' + resourceForm.code : resourceForm.code
    item.order = currentResource.maxOrder + 1
    res = await API.permission.resource.add(item)
    // 如果是顶层菜单
    if (!item.pid) {
      roots.value = await API.permission.resource.list(null, true)
      roots.value.sort((a, b) => a.order - b.order)
      currentRootId.value = res.id
    }
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.EDIT) {
    item.path = currentResource.path
    item.code = currentResource.code
    item.pid = currentResource.pid
    item.id = currentResource.id
    item.level = currentResource.level
    item.order = currentResource.order
    item.code = getCodePrefix(currentResource.code) + '.' + resourceForm.code
    res = await API.permission.resource.update(item)
    if (!item.pid) {
      roots.value = await API.permission.resource.list(null, true)
      roots.value.sort((a, b) => a.order - b.order)
    }
  } else {
    throw new Error('Invalid Editor Mode.')
  }

  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())

  // 滚动到新增节点的位置
  if (editorMode === EDITOR_MODE.ADD) {
    nextTick(() => {
      const el = document.getElementById('_MPRES_' + res.id)
      // 判断节点是不是在可视范围内
      const rect = el.getBoundingClientRect()
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
      if (!isVisible) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' })
      }
      el.classList.add('blink')
      el.onanimationend = () => {
        el.classList.remove('blink')
      }
    })
  }

  resourceEditor.value = false
}

// 生命周期钩子
onMounted(async () => {
  isLoading.value = true
  roots.value = await API.permission.resource.list(null, true)
  roots.value.sort((a, b) => a.order - b.order)

  currentRootId.value = roots.value[0]?.id

  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)

  dndResource.init()
  dndRoot.init()
  nextTick(() => {
    highlight()
  })
})

onBeforeUnmount(() => {
  dndResource.destroy()
  dndRoot.destroy()
})

// 监听器
watch(keywords, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

watch(resourceType, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

// 表单验证规则
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
</script>

<style scoped lang="scss">
.dragging {
  @apply border-2 border-dashed border-brand-500 bg-brand-50;
  > * {
    opacity: 0;
  }
}
// 避免在拖拽时触发子级元素事件
.list:has(.dragging) {
  .item * {
    pointer-events: none;
  }
  .item > .tools {
    display: none;
  }
}

::highlight(search-results) {
  background-color: #4e9a06;
  color: white;
}

:deep(.blink) {
  border: 2px dashed #4e9a06;
  animation: blink 0.15s 6;
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
}
</style>
