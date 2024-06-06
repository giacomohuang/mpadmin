<script setup>
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from './stores/theme'
import { theme } from 'ant-design-vue'
// 全局主题: [dark, light, system]
const globalTheme = useTheme()
globalTheme.mode = getThemeMode()

watch(globalTheme, (val) => {
  setThemeMode(val.mode)
})

// console.log(themeMode.value)
// 媒体查询当前系统是否为暗黑模式
const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
// antv组件主题
const antTheme = ref('')
const antColorPrimary = ref(getComputedStyle(document.documentElement).getPropertyValue('--c-brand'))

// 从本地存储/系统配置中获取主题模式
function getThemeMode() {
  let mode = localStorage.getItem('themeMode')
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

setThemeMode(globalTheme.mode)

darkMode.addEventListener('change', (e) => {
  if (globalTheme.mode == 'system')
    if (e.matches) {
      setThemeCss('dark')
    } else {
      setThemeCss('light')
    }
})

function setThemeMode(mode) {
  globalTheme.mode = mode
  localStorage.setItem('themeMode', mode)
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
    antTheme.value = theme.darkAlgorithm
    document.body.setAttribute('data-theme', 'dark')
  } else {
    antTheme.value = theme.lightAlgorithm
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
