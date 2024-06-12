import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => {
    return {
      theme: '',
      username: '',
      accountid: ''
    }
  },
  // 也可以这样定义
  // state: () => ({ count: 0 })
  actions: {
    changeTheme(value) {
      this.theme = value
      // console.log(this.mode)
    }
  }
})
