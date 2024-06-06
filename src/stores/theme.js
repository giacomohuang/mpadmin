import { defineStore } from 'pinia'

export const useTheme = defineStore('theme', {
  state: () => {
    return { mode: '' }
  },
  // 也可以这样定义
  // state: () => ({ count: 0 })
  actions: {
    changeMode(value) {
      this.mode = value
      console.log(this.mode)
    }
  }
})
