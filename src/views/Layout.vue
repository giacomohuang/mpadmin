<template>
  <header class="min-w[640px] border-primary bg-primary relative z-20 flex h-16 w-full items-center gap-5 border-b border-solid">
    <div class="border-primary shrink-0 whitespace-nowrap border-r-2 border-solid px-5">
      <a href="/" class="flex">
        <img src="@/assets/logo.png" class="mr-2 h-6 w-6" />
        <div class="text-primary text-2xl/none font-semibold">{{ $t('common.appname') }}</div>
      </a>
    </div>
    <div class="text-primary grow whitespace-nowrap text-lg">{{ $t($route.meta.title) }}</div>
    <div class="mx-3 shrink-0">
      <a-dropdown>
        <a @click.prevent class="flex items-center text-base">
          <img src="@/assets/avatar.jpg" class="mr-2 h-[30px] w-[30px] rounded-full" />
          <div>{{ store.realname }}({{ store.accountname }})</div>
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click="router.push('/my/profile')">{{ $t('common.route.profile') }}</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="signout">{{ $t('common.route.signout') }}</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="mx-3">
      <a-dropdown>
        <a @click.prevent> <Icon name="global" size="2em" /></a>
        <template #overlay>
          <a-menu @click="onChangeLocale">
            <a-menu-item key="zh-CN">简体中文</a-menu-item>
            <a-menu-item key="en"> English</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="mr-3 flex cursor-pointer flex-nowrap text-gray-300">
      <Icon name="theme-light" size="2em" class="icon" @click="store.changeTheme('light')" :class="{ 'text-[var(--c-orange40)]': store.theme === 'light' }"></Icon>
      <Icon name="theme-dark" size="2em" class="icon" @click="store.changeTheme('dark')" :class="{ 'text-[var(--c-blue30)]': store.theme === 'dark' }"></Icon>
      <Icon name="theme-system" size="2em" class="icon" @click="store.changeTheme('system')" :class="{ 'text-[var(--c-black)]': store.theme === 'system' }"></Icon>
    </div>
  </header>
  <div class="relative flex h-[calc(100vh-64px)] flex-row bg-[var(--bg-main)]">
    <aside class="z-20 min-w-[120px] select-none bg-[var(--bg-main)] pt-5">
      <RouterLink custom :to="item.path" v-for="(item, index) in menu" :key="index">
        <div v-if="!item.isHidden" @click="changeSubMenu(index)" :class="['item', { 'router-link-active': index == currentMenuIdx || (currentMenuIdx == -1 && $route.path.indexOf(item.path + '/') == 0) }]"><Icon name="carousel" size="2em"></Icon>{{ $t(item.meta.title) }}</div>
      </RouterLink>
    </aside>
    <!-- v-if="" -->
    <aside class="h-[calc(100vh - 64px)] border-primary bg-secondary relative -left-[1px] z-20 flex w-[140px] flex-col border-r pt-5" v-if="!submenu.redirect">
      <SubMenu :data="submenu.children"></SubMenu>
    </aside>
    <main class="h-[calc(100vh - 64px)] bg-primary relative grow overflow-y-auto">
      <a-spin :spinning="globalLoading" style="margin: 20px"></a-spin>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs, provide } from 'vue'
import { router, dynamicRoutes } from '../router/router'
import { changeLocale } from '../js/i18n'
import SubMenu from './SubMenu.vue'
import { useStore } from '../stores/stores'
import helper from '../js/helper'
import API from '../api/API'

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

onMounted(() => {})
</script>

<style scoped lang="scss">
// @media only screen and (max-width: 1536px) {
//   header,
//   .main-wrap {
//     max-width: 1536px;
//   }
// }
// @media only screen and (max-width: 1280px) {
//   header,
//   .main-wrap {
//     max-width: 1280px;
//   }
// }
// @media only screen and (max-width: 1024px) {
//   header,
//   .main-wrap {
//     max-width: 1024px;
//   }
// }
// @media only screen and (max-width: 768px) {
//   header,
//   .main-wrap {
//     max-width: 768px;
//   }
// }
// @media only screen and (max-width: 640px) {
//   header,
//   .main-wrap {
//     min-width: 640px;
//     width: 100vh;
//   }
//   .main-menu {
//     display: none;
//   }
//   header {
//     .title {
//       font-size: 12px;
//     }
//   }
// }

// header {
//   display: flex;
//   flex-direction: row;
//   position: relative;
//   align-items: center;
//   padding: 0 12px;
//   height: 64px;
//   width: 100%;
//   min-width: 640px;
//   // font-size: 16px;
//   background-color: var(--bg-main);
//   // background-image: radial-gradient(transparent 1px, #fff 1px);
//   // background-size: 4px 4px;
//   // backdrop-filter: saturate(50%) blur(4px);
//   border-bottom: 1px solid var(--color-border);
//   z-index: 12;
//   // box-shadow: 0px 4px 4px 0px var(--color-shadow);
// }

// .app-name {
//   font-size: 24px;
//   padding: 0 20px 0 16px;
//   margin-right: 20px;
//   border-right: 2px solid #ccc;
//   color: var(--text-primary);
//   font-weight: 600;
// }

// .title {
//   color: var(--text-primary);
//   font-size: 18px;
//   flex-grow: 1;
// }

// .my,
// .lang {
//   display: block;
//   padding: 0 10px;
//   margin: 0 10px;
// }

// .avatar {
//   border-radius: 50%;
//   margin-right: 8px;
//   // box-sizing: content-box;
//   // border: 2px solid #ffffffff;
//   // &: hover;
//   // &:active {
//   //   // border: 2px solid var(--color-background-2);
//   //   box-shadow: 0px 0px 8px 2px var(--t-gray5);
//   // }
// }

// .theme {
//   cursor: pointer;
//   color: var(--c-gray100);
//   .active1 {
//     color: var(--c-orange40);
//   }
//   .active2 {
//     color: var(--c-blue30);
//   }
//   .active3 {
//     color: var(--c-black);
//   }
// }

// .main-wrap {
//   position: relative;
//   background: var(--bg-main);
//   display: flex;
//   flex-direction: row;
//   height: calc(100vh - 64px);
//   // margin-top: 68px;
//   min-width: 640px;
// }

.item {
  @apply text-primary relative m-0 flex cursor-pointer items-center py-2 pr-[4px] leading-8;
  &:hover:not(.router-link-active),
  &:active:not(.router-link-active) {
    @apply text-[var(--c-brand100)];
  }
}

.router-link-active {
  @apply bg-[var(--bg-layout-active)] font-semibold text-[var(--c-brand100)];
}

// .sub-menu {
//   z-index: 11;
//   left: -1px;
//   position: relative;
//   background: var(--bg-component);
//   border-right: 1px solid var(--color-border);
//   // box-shadow: 4px 0px 4px 0px var(--color-shadow);
//   display: flex;
//   flex-direction: column;
//   width: 140px;
//   padding-top: 20px;
//   height: calc(100vh - 64px);
// }

// main {
//   position: relative;
//   flex-grow: 1;
//   background: var(--bg-main);
//   height: calc(100vh - 64px);
//   overflow-y: auto;
//   // padding: 25px;
//   // padding-top: 64px;
// }
</style>
