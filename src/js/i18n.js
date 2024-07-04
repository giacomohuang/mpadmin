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
  fallbackLocale: 'zh-CN'
})

// 切换语言
export async function changeLocale(locale) {
  console.log('bbbbb', router.currentRoute.value.path)
  await loadLocaleData(locale, router.currentRoute.value.path)
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
export async function loadLocaleData(locale, path) {
  // load locale messages with dynamic import

  const p = `../locales/${locale}${path}.json`
  console.log('local path', p)
  try {
    // const [common, page] = await Promise.all([import(/* @vite-ignore */ `../locales/${locale}/common.json`), import(/* @vite-ignore */ `${p}.json`)])
    const common = await import(`../locales/${locale}/common.json`)
    const localeFile = Object.keys(localeFiles).find((path) => {
      return path === p
    })
    const page = await localeFiles[localeFile]()
    i18n.global.setLocaleMessage(locale, common.default)
    i18n.global.mergeLocaleMessage(locale, page.default)

    // set locale and locale message

    // console.log(page.default)
  } catch (e) {
    // i18n.global.setLocaleMessage(locale, global.default)
    console.log('locale file load error', e)
  }
  return nextTick()
}

export default i18n
