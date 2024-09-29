<template>
  <div class="z-50 mb-3 flex items-center gap-3">
    <a-select v-model:value="resourceType" style="width: 100px">
      <a-select-option value="0">全部资源</a-select-option>
      <a-select-option value="1">仅页面</a-select-option>
      <a-select-option value="2">页面+功能</a-select-option>
      <a-select-option value="3">页面+数据</a-select-option>
    </a-select>
    <div class="relative flex items-center">
      <icon name="search" class="absolute m-2"></icon>
      <input class="h-8 w-56 rounded-md border border-secondary bg-primary px-8 outline-none duration-300 focus:border-brand-500 focus:ease-in" placeholder="输入关键词搜索" v-model="keywords" />
    </div>
    <a-checkbox v-model:checked="settings.isRecursive">自动勾选子级</a-checkbox>
  </div>

  <div class="flex min-h-[500px] w-full flex-1 overflow-y-auto rounded-md border border-primary" style="max-height: calc(100vh - 400px)">
    <div class="border-r border-primary">
      <div class="sticky top-0">
        <ul ref="rootsRef">
          <li v-for="root in roots" :key="root.id" :data-id="root.id" class="flex cursor-pointer justify-center px-5 py-3 text-base" :class="{ 'bg-secondary font-semibold': currentRootId === root.id }" @click="onChange(root.id)">{{ root.name }}</li>
        </ul>
      </div>
    </div>
    <div class="hl-area relative flex-1 overflow-y-auto">
      <div v-if="keywords && !resourceTree.children" class="p-4 text-secondary">没有符合条件的数据。<a href="####" @click="keywords = ''">清除搜索关键词</a></div>
      <div class="list" ref="listRef"><ResourceSelectorList :data="resourceTree.children" pidEnabled="true" @toggleCollapse="toggleCollapse" @toggleSelect="toggleSelect" v-if="resourceTree"></ResourceSelectorList></div>
    </div>
  </div>
</template>

<router lang="json">
{
  "isMenu": false
}
</router>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, provide, computed, inject } from 'vue'
import debounceRef from '@/js/debounceRef'
import ResourceSelectorList from './ResourceSelectorList.vue'
import API from '@/api/API'

const { parentData } = defineProps(['parentData']),
  settings = reactive({ isRecursive: false }),
  isLoading = ref(false),
  currentRootId = ref(null),
  keywords = debounceRef('', 500),
  resourceTree = ref(null),
  collapseIds = ref(new Set()),
  resourceType = ref('0'),
  roots = ref(null),
  rootsRef = ref(null),
  listRef = ref(null)

provide('resourceType', resourceType)
provide('collapseIds', collapseIds)
const selectedIds = inject('selectedIds')

let resourceData = null

const buildTree = (data) => {
  const rsdata = JSON.parse(JSON.stringify(data))
  const parentIds = parentData ? new Set([...parentData.resources]) : new Set()
  let items

  // 根据关键词过滤
  if (keywords.value) {
    const nodes = new Map()
    const itemMap = new Map(rsdata.map((item) => [item.id, item]))
    const hitItems = rsdata.filter((item) => item.name.toLowerCase().includes(keywords.value) && (!parentData || parentIds.has(item.id)))
    console.log(keywords.value)
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
    items = rsdata.filter((item) => !parentData || parentIds.has(item.id))
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

watch(keywords, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

watch(resourceType, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

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

async function onChange(val) {
  currentRootId.value = val
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

function getCodePrefix(code) {
  if (!code || code.indexOf('.') === -1) {
    return ''
  }
  return code.replace(/\.[^.]+$/, '')
}

function toggleSelect(id) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
    getChildrenIds(id).forEach((id) => selectedIds.value.delete(id))
  } else {
    if (settings.isRecursive) {
      selectedIds.value.add(id)
      getChildrenIds(id).forEach((id) => selectedIds.value.add(id))
    } else {
      selectedIds.value.add(id)
    }
  }
}

function getChildrenIds(id) {
  const children = []
  resourceData.forEach((item) => {
    if (item.pid == id) {
      children.push(item.id)
      children.push(...getChildrenIds(item.id))
    }
  })
  return children
}

function toggleCollapse(id) {
  if (collapseIds.value.has(id)) {
    collapseIds.value.delete(id)
  } else {
    collapseIds.value.add(id)
  }
}

onMounted(async () => {
  isLoading.value = true
  const res = await API.permission.resource.list(null, true)
  const parentIds = parentData ? new Set([...parentData.resources]) : new Set()
  if (parentData) {
    roots.value = res.filter((item) => parentIds.has(item.id))
  } else {
    roots.value = res
  }
  roots.value.sort((a, b) => a.order - b.order)

  currentRootId.value = roots.value[0]?.id

  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)

  nextTick(() => {
    highlight()
  })
})

onBeforeUnmount(() => {})
</script>

<style scoped lang="scss">
::highlight(search-results) {
  background-color: #4e9a06;
  color: white;
}
</style>
