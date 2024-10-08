import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { router } from '../router/router'
const SUPPORT_LOCALES = ['en', 'zh-CN']
const sysLocale = navigator.language
const localeFiles = import.meta.glob('../locales/**/*.json')
const currentLocale = localStorage.getItem('locale') || (SUPPORT_LOCALES.includes(sysLocale) ? sysLocale : 'en')

const i18n = createI18n({
  locale: currentLocale,
  legacy: false,
  fallbackLocale: 'zh-CN',
  silentFallbackWarn: true,
  missingWarn: false,
  silentTranslationWarn: true,
  fallbackWarn: false
})

// 切换语言
export async function changeLocale(locale) {
  // console.log('bbbbb', router.currentRoute.value.path)
  // await loadLocaleData(locale, router.currentRoute.value.path)
  await loadLocaleData(locale)
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
  const title = router.currentRoute.value.meta.title
  // console.log(title)
  if (title) {
    document.title = `${i18n.global.t('common.appname')} - ${i18n.global.t(title)}`
  } else {
    document.title = `${i18n.global.t('common.appname')}`
  }
}

export function getLocale() {
  return i18n.global.locale.value
}

// 懒加载语言包
export async function loadLocaleData(locale) {
  // load locale messages with dynamic import
  // const p = `../locales/${locale}${path}.json`
  try {
    const lang = await import(`../locales/${locale}.json`)
    // console.log(lang)
    i18n.global.setLocaleMessage(locale, lang.default)
    // const common = await import(`../locales/${locale}/common.json`)
    // i18n.global.setLocaleMessage(locale, common.default)
    // const localeFile = Object.keys(localeFiles).find((path) => {
    //   return path === p
    // })
    // if (!localeFile) throw new Error('locale file load error')
    // const page = await localeFiles[localeFile]()
    // i18n.global.mergeLocaleMessage(locale, page.default)
  } catch (e) {
    console.log(e)
  } finally {
    return nextTick()
  }
}

// 加载组件中的语言包
export async function mergeCompData(locale, compName) {
  const p = `../locales/${locale}/comp/${compName}.json`
  console.log(p)
  const localeFile = Object.keys(localeFiles).find((path) => {
    return path === p
  })
  const page = await localeFiles[localeFile]()
  i18n.global.mergeLocaleMessage(locale, page.default)
}

export default i18n
