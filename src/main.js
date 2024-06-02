import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import './mocks/index'
import { router } from './router/router'
import './router/permission'
import i18n from './i18n'
import 'ant-design-vue/dist/reset.css'
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar'
import 'vue3-perfect-scrollbar/style.css'
import './assets/main.css'

const app = createApp(App)
// await loadLocaleMessages(i18n, i18n.global.locale.value)
if (!localStorage.getItem('localLang')) {
  localStorage.setItem('localLang', 'zh-CN')
}
// app.use(createPinia())

app.use(router).use(i18n).use(Antd).use(PerfectScrollbarPlugin).mount('#app')
