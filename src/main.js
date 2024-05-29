import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import './mocks/index'
import { router } from './router/router'
import './router/permission'
import i18n from './i18n'
import './assets/main.css'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
// await loadLocaleMessages(i18n, i18n.global.locale.value)
if (!localStorage.getItem('localLang')) {
  localStorage.setItem('localLang', 'zh-CN')
}
// app.use(createPinia())

app.use(router).use(i18n).use(Antd).mount('#app')
