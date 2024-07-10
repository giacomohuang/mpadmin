import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// import Antd from 'ant-design-vue'
// import './mocks/index'
import { router } from './router/router'
import './router/permission'
import i18n from './js/i18n'
// import 'ant-design-vue/dist/reset.css'
import './assets/main.css'
import 'virtual:svg-icons-register'
import Icon from './components/Icon.vue'

const app = createApp(App)

if (!localStorage.getItem('locale')) {
  localStorage.setItem('locale', 'zh-CN')
}

app.use(router).use(createPinia()).use(i18n).component('Icon', Icon).mount('#app')
