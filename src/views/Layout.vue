<template>
  <div class="layout">
    <header class="header">
      <div class="logo-container">
        <a href="/" class="logo-link">
          <img src="@/assets/logo.png" class="logo-image" />
          <div class="app-name">{{ $t('common.appname') }}</div>
        </a>
      </div>
      <div class="page-title">
        {{ $t($route.meta.title) }}
      </div>
      <div class="user-dropdown">
        <a-dropdown>
          <a @click.prevent class="user-info">
            <img src="@/assets/avatar.jpg" class="avatar" />
            <div class="user-name">
              <span class="real-name">
                {{ store.realname }}
              </span>
              <span class="account-name">
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
      <div class="language-dropdown">
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
      <div class="theme">
        <Icon name="theme-light" size="2em" class="icon" @click="store.changeTheme('light')" :class="{ 'active-light': store.theme === 'light' }"></Icon>
        <Icon name="theme-dark" size="2em" class="icon" @click="store.changeTheme('dark')" :class="{ 'active-dark': store.theme === 'dark' }"></Icon>
        <Icon name="theme-system" size="2em" class="icon" @click="store.changeTheme('system')" :class="{ 'active-system': store.theme === 'system' }"></Icon>
      </div>
      <div class="assistant-icon"><img src="@/assets/assistant.png" width="20px" height="20px" @click="showAssistant = !showAssistant" /></div>
    </header>
    <aside class="menu">
      <div style="display: flex; align-items: center; justify-content: center; margin: 10px">
        <div class="toggle-menu" :class="{ mini: miniMenu }" @click="miniMenu = !miniMenu"></div>
      </div>
      <RouterLink custom :to="item.path" v-for="(item, index) in menu" :key="index">
        <div class="wrapper" @mouseenter="handleMenuHover(index)" @click="changeSubMenu(index)">
          <div :class="['item', { active: isActiveMenu(item), hover: index === hoveredMenuIndex }]">
            <Icon name="carousel" size="2em"></Icon>
            <span class="text">{{ $t(item.meta.title) }}</span>
          </div>
        </div>
      </RouterLink>
    </aside>
    <aside class="submenu" :class="{ float: miniMenu }" v-if="showSubmenu" @mouseleave="handleSubmenuLeave" @mouseenter="handleSubmenuEnter" ref="submenuRef">
      <SubMenu :data="submenu.children"></SubMenu>
    </aside>

    <div class="main-content">
      <a-spin :spinning="globalLoading" style="margin: 20px"></a-spin>
      <router-view />
    </div>
    <aside class="assist" v-show="showAssistant">
      <div class="assist-header">
        <Icon name="assist" size="2em"></Icon>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs, provide, watch, onUnmounted, computed, nextTick } from 'vue'
import { router } from '../router/router'
import dynamicRoutes from 'virtual:router'
import { changeLocale } from '../js/i18n'
import SubMenu from './SubMenu.vue'
import { useStore } from '../stores/stores'
import helper from '../js/helper'
import API from '../api/API'
// import PerfectScrollbar from '@/components/PerfectScrollerBar'
// import '@/assets/perfect-scrollbar.css'
import { useRoute } from 'vue-router'

const globalLoading = ref(false)
provide('globalLoading', globalLoading)
const store = useStore()
const route = useRoute()
const { accountname, accountid, realname, locale } = toRefs(store)

const showAssistant = ref(false)
const miniMenu = ref(false)

const accountInfo = helper.decodeToken()
// const accountname = accessToken.accountname
accountname.value = accountInfo.accountname
accountid.value = accountInfo.id
realname.value = decodeURIComponent(accountInfo.realname)
const menu = ref(dynamicRoutes)
const submenu = ref(route.matched[0].name)
const currentMenuIdx = ref(-1)
const onChangeLocale = async ({ key }) => {
  await changeLocale(key)
  locale.value = key
}

const isActiveMenu = (item) => {
  if (route.matched.length > 0) {
    return route.matched[0].name === item.name || route.name.startsWith(item.name + '-')
  }
  return false
}

const activeMenuIndex = computed(() => {
  return menu.value.findIndex((item) => isActiveMenu(item))
})

watch(activeMenuIndex, (newIndex) => {
  if (newIndex !== -1) {
    currentMenuIdx.value = newIndex
    submenu.value = menu.value[newIndex]
  }
})

function changeSubMenu(index) {
  submenu.value = menu.value[index]
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

const showSubmenu = ref(!miniMenu.value)
const submenuRef = ref(null)
const hoverTimeout = ref(null)
const hoveredMenuIndex = ref(-1)

const handleMenuHover = (index) => {
  if (miniMenu.value) {
    clearTimeout(hoverTimeout.value)
    submenu.value = menu.value[index]

    currentMenuIdx.value = index
    hoveredMenuIndex.value = index
    showSubmenu.value = true
    nextTick(() => {
      const offset = 115 + index * 70
      if (submenuRef.value.offsetHeight + offset > window.innerHeight) {
        submenuRef.value.style.bottom = 10 + 'px'
      } else {
        submenuRef.value.style.top = offset + 'px'
      }
    })
  }
}

const handleSubmenuEnter = () => {
  if (miniMenu.value) {
    clearTimeout(hoverTimeout.value)
  }
}

const handleSubmenuLeave = () => {
  if (miniMenu.value) {
    hoverTimeout.value = setTimeout(() => {
      showSubmenu.value = false
      hoveredMenuIndex.value = -1
    }, 100)
  }
}

watch(miniMenu, (newValue) => {
  showSubmenu.value = !newValue
  if (!newValue) {
    clearTimeout(hoverTimeout.value)
    hoveredMenuIndex.value = -1
  }
})

onMounted(() => {
  // new PerfectScrollbar('.main-content')
  // 初始化当前活动菜单
  if (activeMenuIndex.value !== -1) {
    currentMenuIdx.value = activeMenuIndex.value
    submenu.value = menu.value[activeMenuIndex.value]
  }
})

onUnmounted(() => {
  clearTimeout(hoverTimeout.value)
})
</script>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-areas:
    'header header header header'
    'menu submenu main assistant';
  grid-template-columns: auto auto 1fr auto;
  grid-template-rows: 64px 1fr;
  height: 100vh;
}

.header {
  grid-area: header;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);

  .logo-container {
    flex-shrink: 0;
    white-space: nowrap;
    border-right: 2px solid var(--border-light);
    padding: 0 20px;

    .logo-link {
      display: flex;
      align-items: center;

      .logo-image {
        margin-right: 16px;
        height: 24px;
        width: 24px;
      }

      .app-name {
        font-size: 24px;
        line-height: 1;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .page-title {
    flex-grow: 1;
    white-space: nowrap;
    font-size: 18px;
    color: var(--text-primary);
    padding-left: 20px;
  }

  .user-dropdown {
    margin: 0 12px;

    .user-info {
      display: flex;
      align-items: center;
      font-size: 16px;

      .avatar {
        margin-right: 8px;
        height: 30px;
        width: 30px;
        border-radius: 50%;
      }

      .user-name {
        display: flex;

        .real-name,
        .account-name {
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          @media (min-width: 768px) {
            max-width: 128px;
          }
        }

        .account-name {
          &::before {
            content: '(';
          }
          &::after {
            content: ')';
          }
        }
      }
    }
  }

  .language-dropdown {
    margin: 0 12px;
    display: none;

    @media (min-width: 768px) {
      display: block;
    }
  }

  .theme {
    margin-right: 12px;
    display: none;
    cursor: pointer;
    flex-wrap: nowrap;
    color: var(--text-tertiary);

    @media (min-width: 768px) {
      display: flex;
    }

    .icon {
      &.active-light {
        color: #fbbf24;
      }
      &.active-dark {
        color: #3b82f6;
      }
      &.active-system {
        color: #000000;
      }
    }
  }

  .assistant-icon {
    margin-left: 12px;
    cursor: pointer;
  }
}

.menu {
  grid-area: menu;
  background-color: var(--bg-secondary);
  padding-top: 10px;
  border-right: 1px solid var(--border-light);
  width: 100px;
  box-shadow: 0px 0 4px 0 rgba(100, 100, 100, 0.1);
  z-index: 1;

  .wrapper {
    cursor: pointer;
    &:hover .item:not(.active) {
      background-color: var(--c-brand-400);
      color: var(--c-white);
      font-weight: 600;
    }
    padding: 5px;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    // margin: 0;
    padding: 6px 0 12px 0;
    border-radius: 8px;

    color: var(--text-primary);
    border-radius: 10px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &.active {
      background-color: var(--c-brand);
      color: var(--c-white);
      font-weight: 600;
    }

    &.hover {
      background-color: var(--c-brand-400);
      color: var(--c-white);
      font-weight: 600;
    }

    .item-text {
      // display: none;
      display: block;
    }
  }
}

.submenu {
  // position: relative;
  grid-area: submenu;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  padding: 10px 0;
  z-index: 1;
  box-shadow: 2px 0 4px 0 rgba(100, 100, 100, 0.1);
  &.float {
    position: fixed; // 改为fixed以确保在滚动时保持位置
    left: 98px; // 与mini menu的宽度对应
    z-index: 1000; // 确保浮动在其他元素之上
    transition: opacity 0.3s ease;
    height: min-content;
    border: 1px solid var(--border-light);
    border-radius: 10px;
    box-shadow: 2px 2px 4px 0 rgba(1, 1, 1, 0.3);
  }
}

.toggle-menu {
  position: relative;
  width: 20px;
  height: 10px;
  border-top: 2px solid var(--border-medium);
  margin-bottom: 10px;
  cursor: pointer;

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 10px;
    border-color: var(--border-medium);
  }

  &:hover {
    border-color: var(--border-dark);
    &:before,
    &:after {
      border-color: var(--border-dark);
    }
  }

  &::before {
    top: 4px;
    border-top-width: 2px;
  }
  &::after {
    top: 2px;
    border-bottom-width: 2px;
  }
}

.assist {
  position: relative;
  grid-area: assistant;
  width: 400px;
  background-color: var(--bg-primary);
  border-left: 1px solid var(--border-light);
  box-shadow: 0px 0 4px 0 rgba(100, 100, 100, 0.1);
  &.float {
    position: absolute;
    top: 64px;
    bottom: 0;
    right: 0;
    height: calc(100vh - 64px);
    // z-index: 500;
  }
}
</style>

<style>
.main-content {
  position: relative;
  grid-area: main;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  /* padding: 20px; */
  /* overflow: hidden; */
}
</style>
