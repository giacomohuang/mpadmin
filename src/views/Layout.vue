<template>
  <header class="min-w[640px] relative z-20 flex h-16 w-full items-center gap-5 border-b border-solid border-primary bg-primary">
    <div class="shrink-0 whitespace-nowrap border-r-2 border-solid border-primary px-5">
      <a href="/" class="flex">
        <img src="@/assets/logo.png" class="mr-4 h-6 w-6" />
        <div class="text-2xl/none font-semibold text-primary">{{ $t('common.appname') }}</div>
      </a>
    </div>
    <div class="grow whitespace-nowrap text-lg text-primary">
      {{ $t($route.meta.title) }}
    </div>
    <div class="mx-3">
      <a-dropdown>
        <a @click.prevent class="flex items-center text-base">
          <img src="@/assets/avatar.jpg" class="mr-2 h-[30px] w-[30px] rounded-full" />
          <div class="flex">
            <span class="max-w-20 overflow-hidden text-ellipsis text-nowrap md:max-w-32">
              {{ store.realname }}
            </span>
            <span class="overflow-hidden text-ellipsis text-nowrap before:content-['('] after:content-[')'] md:max-w-32">
              {{ store.accountname }}
            </span>
          </div>
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click="router.push('/my/profile')">{{ $t('my.profile._title') }}</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="signout">{{ $t('signout._title') }}</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="mx-3 hidden md:block">
      <a-dropdown>
        <a @click.prevent> <Icon name="global" size="2em" /></a>
        <template #overlay>
          <a-menu @click="onChangeLocale">
            <a-menu-item key="zh-CN">简体中文</a-menu-item>
            <a-menu-item key="en">English</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="mr-3 hidden cursor-pointer flex-nowrap text-tertiary md:flex">
      <Icon name="theme-light" size="2em" class="icon" @click="store.changeTheme('light')" :class="{ 'text-orange-400': store.theme === 'light' }"></Icon>
      <Icon name="theme-dark" size="2em" class="icon" @click="store.changeTheme('dark')" :class="{ 'text-blue-500': store.theme === 'dark' }"></Icon>
      <Icon name="theme-system" size="2em" class="icon" @click="store.changeTheme('system')" :class="{ 'text-black': store.theme === 'system' }"></Icon>
    </div>
  </header>
  <div class="relative flex h-[calc(100vh-64px)] flex-row bg-primary">
    <aside class="z-20 min-w-8 select-none bg-primary pt-5 md:min-w-32">
      <RouterLink custom :to="item.path" v-for="(item, index) in menu" :key="index">
        <div v-if="!item.isHidden" @click="changeSubMenu(index)" :class="['item', { 'router-link-active': index == currentMenuIdx || (currentMenuIdx == -1 && $route.name.indexOf(item.name + '-') == 0) }]">
          <Icon name="carousel" size="2em"></Icon>
          <span class="hidden md:inline">{{ $t(item.meta.title) }}</span>
        </div>
      </RouterLink>
    </aside>
    <!-- v-if="" -->
    <aside class="h-[calc(100vh - 64px)] relative -left-[1px] z-20 flex w-36 flex-col border-r border-primary bg-secondary pt-5" v-if="!submenu.redirect">
      <SubMenu :data="submenu.children"></SubMenu>
    </aside>
    <main class="h-[calc(100vh - 64px)] min-w[640px] relative grow overflow-y-auto bg-primary" id="mp-main-wrap">
      <a-spin :spinning="globalLoading" style="margin: 20px"></a-spin>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs, provide } from 'vue'
import { router } from '../router/router'
import dynamicRoutes from 'virtual:router'
import { changeLocale } from '../js/i18n'
import SubMenu from './SubMenu.vue'
import { useStore } from '../stores/stores'
import helper from '../js/helper'
import API from '../api/API'
import PerfectScrollbar from 'perfect-scrollbar'
import '@/assets/perfect-scrollbar.css'

const globalLoading = ref(false)
provide('globalLoading', globalLoading)
const store = useStore()
const { accountname, accountid, realname, locale } = toRefs(store)

const accountInfo = helper.decodeToken()
// const accountname = accessToken.accountname
accountname.value = accountInfo.accountname
accountid.value = accountInfo.id
realname.value = accountInfo.realname

const menu = ref(dynamicRoutes)
const submenu = ref(router.currentRoute.value.matched[0])
const currentMenuIdx = ref(-1)
const onChangeLocale = async ({ key }) => {
  await changeLocale(key)
  locale.value = key
}
// menu.value =
// 取根节点下的子菜单
function changeSubMenu(index) {
  submenu.value = menu.value[index]
  currentMenuIdx.value = index
  if (submenu.value.redirect) {
    // 如果定义了redirect，直接跳转
    router.push({ path: submenu.value.redirect })
  }
}

async function signout() {
  const resp = await API.account.signout()
  store.accountid = undefined
  helper.removeToken()
  router.push('/signin')
}

onMounted(() => {
  // new PerfectScrollbar('#mp-main-wrap')
})
</script>

<style scoped lang="scss">
.item {
  @apply relative m-0 flex cursor-pointer items-center py-2 pr-[4px] leading-8 text-primary;
  &:hover:not(.router-link-active) {
    @apply text-brand-600;
  }
}

.router-link-active {
  @apply bg-secondary font-semibold;
}
</style>
