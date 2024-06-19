<template>
  <header>
    <div class="logo">
      <a href="/"><img src="@/assets/logo.png" width="24" /></a>
    </div>
    <div class="app-name">{{ $t('appname') }}</div>
    <div class="title">{{ $t($route.meta.title) }}</div>
    <div class="my">
      <a-dropdown>
        <a @click.prevent style="font-size: 16px; display: flex; align-items: center">
          <img width="30" height="30" src="@/assets/avatar.jpg" class="avatar" />
          <div>{{ store.accountname }}</div>
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click="router.push('/my/profile')">{{ $t('route.profile') }}</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="logout">{{ $t('route.logout') }}</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="lang">
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
    <div class="theme">
      <Icon name="theme-light" size="2em" class="icon" @click="store.changeTheme('light')" :class="{ active1: store.theme === 'light' }"></Icon>
      <Icon name="theme-dark" size="2em" class="icon" @click="store.changeTheme('dark')" :class="{ active2: store.theme === 'dark' }"></Icon>
      <Icon name="theme-system" size="2em" class="icon" @click="store.changeTheme('system')" :class="{ active3: store.theme === 'system' }"></Icon>
    </div>
  </header>
  <div class="main-wrap">
    <aside class="main-menu">
      <RouterLink custom :to="item.path" v-for="(item, index) in menu" :key="index">
        <div v-if="!item.isHidden" @click="changeSubMenu(index)" :class="['item', { 'router-link-active': index == currentMenuIdx || (currentMenuIdx == -1 && $route.path.indexOf(item.path + '/') == 0) }]"><Icon name="carousel" size="2em"></Icon>{{ $t(item.meta.title) }}</div>
      </RouterLink>
    </aside>
    <!-- v-if="" -->
    <aside class="sub-menu" v-if="!submenu.redirect">
      <SubMenu :data="submenu.children"></SubMenu>
    </aside>
    <main>
      <!-- <PerfectScrollbar> -->
      <router-view />
      <!-- </PerfectScrollbar> -->
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs, reactive, inject } from 'vue'
import { router, dynamicRoutes } from '../router/router'
import { changeLocale } from '../js/i18n'
import SubMenu from './SubMenu.vue'
import { useStore } from '../stores/stores'

const store = useStore()
const { accountname, accountid } = toRefs(store)
const helper = inject('helper')
const accessToken = helper.decodeToken()
// const accountname = accessToken.accountname
if (!accountname.value) accountname.value = accessToken.accountname
if (!accountid.value) accountid.value = accessToken.id

const menu = ref(dynamicRoutes)
const submenu = ref(router.currentRoute.value.matched[0])
const currentMenuIdx = ref(-1)
const onChangeLocale = ({ key }) => {
  changeLocale(key)
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

function logout() {
  helper.removeToken()
  store.accountid = undefined
  router.push('/login')
}

onMounted(() => {})
</script>

<style scoped lang="scss">
header {
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;
  padding: 0 12px;
  height: 64px;
  width: 100%;
  min-width: 1000px;
  font-size: 16px;
  background-color: var(--bg-layout);
  // background-image: radial-gradient(transparent 1px, #fff 1px);
  // background-size: 4px 4px;
  // backdrop-filter: saturate(50%) blur(4px);
  border-bottom: 1px solid var(--color-border);
  z-index: 12;
  box-shadow: 0px 4px 4px 0px var(--color-shadow);
}

.logo {
  margin-left: 12px;
}
.app-name {
  font-size: 24px;
  padding: 0 20px 0 16px;
  margin-right: 20px;
  border-right: 2px solid #ccc;
  color: var(--text-primary);
  font-weight: 600;
}
.title {
  color: var(--text-primary);
  font-size: 18px;
  flex-grow: 1;
}

.my,
.lang {
  display: block;
  padding: 0 10px;
  margin: 0 10px;
}

.avatar {
  border-radius: 50%;
  margin-right: 8px;
  // box-sizing: content-box;
  // border: 2px solid #ffffffff;
  // &: hover;
  // &:active {
  //   // border: 2px solid var(--color-background-2);
  //   box-shadow: 0px 0px 8px 2px var(--t-gray5);
  // }
}

.theme {
  cursor: pointer;
  color: var(--c-gray4);
  .active1 {
    color: var(--c-yellow4);
  }
  .active2 {
    color: var(--c-blue3);
  }
  .active3 {
    color: var(--c-black);
  }
}

.main-wrap {
  position: relative;
  background: var(--bg-main);
  display: flex;
  flex-direction: row;
  height: calc(100vh - 64px);
  // margin-top: 68px;
  min-width: 1000px;
}

.main-menu {
  z-index: 11;
  user-select: none;
  min-width: 120px;
  padding-top: 20px;
  background: var(--bg-main);
  // border-right: 1px solid var(--color-border);
  box-shadow: 4px 0px 4px 0px var(--color-shadow);
  color: #333;
  font-size: 14px;
  // &:lang(en) {
  //   min-width: 160px;
  // }
  .item {
    color: var(--text-primary);
    display: flex;
    position: relative;
    align-items: center;
    cursor: pointer;
    padding: 8px 0 8px 4px;
    margin: 0;
    line-height: 32px;
    // vertical-align: middle;
    // transition:
    //   cubic-bezier(0.645, 0.045, 0.355, 1),
    //   background-color 0.25s;
    &:hover:not(.router-link-active),
    &:active:not(.router-link-active) {
      background: none;
      color: var(--c-brand);
      //   cubic-bezier(0.645, 0.045, 0.355, 1),
      //   background-color 0.25s;
    }
  }
}

.router-link-active {
  background: var(--bg-layout-active);
  color: var(--c-brand);
  font-weight: 600;
  // &::after {
  //   content: ' ';
  //   display: block;
  //   position: absolute;
  //   right: 0px;
  //   width: 4px;
  //   height: 40px;
  //   border-radius: 5px;
  //   background-color: var(--bg-brand);
  // }
}

.sub-menu {
  z-index: 11;
  position: relative;
  background: var(--bg-component);
  box-shadow: 4px 0px 4px 0px var(--color-shadow);
  display: flex;
  flex-direction: column;
  width: 140px;
  padding-top: 20px;
  height: calc(100vh - 64px);
}

main {
  position: relative;
  flex-grow: 1;
  background: var(--bg-main);
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 25px;
  // padding-top: 64px;
}

/* <PerfectScrollbar> */
.ps {
  height: calc(100vh - 64px);
}
</style>
