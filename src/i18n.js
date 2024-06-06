import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

const SUPPORT_LOCALES = ['en', 'zh-CN']
const sysLocale = navigator.language
const currentLocale = localStorage.getItem('locale') || SUPPORT_LOCALES.includes(sysLocale) ? sysLocale : 'zh-CN'

const i18n = createI18n({
  locale: currentLocale,
  legacy: false
})

export async function changeLocale(locale) {
  await loadLocaleMessages(i18n, locale)
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n, locale) {
  // load locale messages with dynamic import
  const messages = await import(`./locales/${locale}.js`)

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)

  return nextTick()
}
changeLocale(currentLocale)
export default i18n
