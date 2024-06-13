import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import './mocks/index'
import { router } from './router/router'
import './router/permission'
import i18n from './js/i18n'
import 'ant-design-vue/dist/reset.css'
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar'
import './assets/main.css'
import 'virtual:svg-icons-register'
import Icon from './components/Icon.vue'
import utils from './js/utils'
// import fib from 'virtual:fib'

// alert(`结果: ${fib(10)}`)
// import svgIcon from 'virtual:svg-icon'

const app = createApp(App)

if (!localStorage.getItem('localLang')) {
  localStorage.setItem('localLang', 'zh-CN')
}
// app.use(createPinia())

app.use(router).use(createPinia()).use(i18n).use(Antd).use(PerfectScrollbarPlugin).use(utils).component('Icon', Icon).mount('#app')
// console.log(utils.decodeToken())
