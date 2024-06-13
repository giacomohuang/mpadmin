import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { router } from '../router/router'

const SUPPORT_LOCALES = ['en', 'zh-CN']
const sysLocale = navigator.language

const currentLocale = localStorage.getItem('locale') || (SUPPORT_LOCALES.includes(sysLocale) ? sysLocale : 'en')

const i18n = createI18n({
  locale: currentLocale,
  legacy: false
})

// 初始化时载入默认语言
// console.log('current', currentLocale)
await loadLocaleMessages(i18n, currentLocale)

// 切换语言
export async function changeLocale(locale) {
  await loadLocaleMessages(i18n, locale)
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
  const title = router.currentRoute.value.meta.title
  if (title) {
    document.title = `${i18n.global.t('appname')} - ${i18n.global.t(title)}`
  } else {
    document.title = `${i18n.global.t('appname')}`
  }
}

// 懒加载语言包
export async function loadLocaleMessages(i18n, locale) {
  // load locale messages with dynamic import
  const messages = await import(`../locales/${locale}.json`)
  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)
  return nextTick()
}

export default i18n
