<script setup>
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from './stores/stores'
import { theme as antdTheme } from 'ant-design-vue'
import { storeToRefs } from 'pinia'

// 全局主题: [dark, light, system]
const store = useStore()
const { theme } = storeToRefs(store)
theme.value = getTheme()
console.log(theme.value)

watch(theme, (val) => {
  console.log('watch', val)
  setTheme(val)
})

// console.log(Theme.value)
// 媒体查询当前系统是否为暗黑模式
const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
// antv组件主题
const antTheme = ref('')
const antColorPrimary = ref(getComputedStyle(document.documentElement).getPropertyValue('--c-brand'))

setTheme(theme.value)

darkMode.addEventListener('change', (e) => {
  if (theme.value == 'system')
    if (e.matches) {
      setThemeCss('dark')
    } else {
      setThemeCss('light')
    }
})

// 从本地存储/系统配置中获取主题模式
function getTheme() {
  let mode = localStorage.getItem('theme')
  // 如果缓存中没有设置模式，则优先根据系统配置设置模式
  if (!mode || !['dark', 'light', 'system'].includes(mode)) {
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      mode = 'dark'
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      mode = 'light'
    } else {
      mode = 'light'
    }
  }
  return mode
}

function setTheme(mode) {
  theme.value = mode
  localStorage.setItem('theme', mode)
  if (mode == 'system') {
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeCss('dark')
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeCss('light')
    } else {
      setThemeCss('light')
    }
  } else {
    setThemeCss(mode)
  }
}

function setThemeCss(mode) {
  if (mode == 'dark') {
    antTheme.value = antdTheme.darkAlgorithm
    document.body.setAttribute('data-theme', 'dark')
  } else {
    antTheme.value = antdTheme.defaultAlgorithm
    document.body.setAttribute('data-theme', 'light')
  }
}
</script>

<template>
  <a-config-provider :theme="{ algorithm: antTheme, token: { colorPrimary: antColorPrimary } }">
    <RouterView />
  </a-config-provider>
</template>

<style scoped></style>
