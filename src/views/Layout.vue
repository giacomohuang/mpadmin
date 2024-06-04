<template>
  <a-config-provider :theme="{ algorithm: antTheme, token: { colorPrimary: '#61A66C' } }">
    <header>
      <div class="logo"><img src="@/assets/logo.png" width="24" /></div>
      <div class="app-name">{{ $t('appname', '管理运营平台') }}</div>
      <div class="title">{{ $t($route.meta.title) }}</div>
      <div class="my">
        <a-dropdown>
          <a @click.prevent style="font-size: 16px; display: flex; align-items: center">
            <img width="40" height="40" src="@/assets/avatar.jpg" class="avatar" />
            <div>Luciano Pavarotti</div>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a @click="router.push('/my/account')">{{ $t('route.myaccount') }}</a>
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
          <a @click.prevent> <Icon name="global" class="icon2em" /></a>
          <template #overlay>
            <a-menu @click="onChangeLocale">
              <a-menu-item key="zh-CN">简体中文</a-menu-item>
              <a-menu-item key="en"> English</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="theme">
        <Icon name="theme-light" class="icon" @click="setThemeMode('light')" :class="{ active1: themeMode === 'light' }"></Icon>
        <Icon name="theme-dark" class="icon" @click="setThemeMode('dark')" :class="{ active2: themeMode === 'dark' }"></Icon>
        <Icon name="theme-system" class="icon" @click="setThemeMode('system')" :class="{ active3: themeMode === 'system' }"></Icon>
      </div>
    </header>
    <div class="main-wrap">
      <ul class="main-menu">
        <template v-for="(item, index) in menuList" :key="index">
          <RouterLink custom :to="item.path" v-slot="{ isActive }">
            <li class="item" :class="{ active: index === currentMenuIndex, 'init-active': isActive && currentMenuIndex === -1 }" v-if="!item.hidden" @click.stop="changeSubNav(item, index)">
              {{ $t(item.meta.title) }}
            </li>
          </RouterLink>
        </template>
      </ul>
      <!-- v-if="subMenuList.length !== 1 && !subMenuList[0].children" -->
      <div v-if="subMenuList.length !== 1" class="sub-menu">
        <SubMenu :active_name="activeMenuName" :data="subMenuList"></SubMenu>
      </div>
      <main>
        <PerfectScrollbar>
          <router-view />
        </PerfectScrollbar>
      </main>
    </div>
  </a-config-provider>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { router, dynamicRoutes } from '../router/router'
import SubMenu from './SubMenu.vue'
import { RouterLink, RouterView } from 'vue-router'
import { changeLocale } from '../i18n'
import { theme } from 'ant-design-vue'

const { useToken } = theme
const { token } = useToken()

const menuList = ref([])
const subMenuList = ref([])
const activeMenuName = ref(router.currentRoute.name)
const currentMenuIndex = ref(-1)
const themeMode = ref(getThemeMode())
const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
const antTheme = ref('')

setThemeCss(themeMode.value)

darkMode.addEventListener('change', (e) => {
  if (themeMode.value == 'system')
    if (e.matches) {
      setThemeCss('dark')
    } else {
      setThemeCss('light')
    }
})

const onChangeLocale = ({ key }) => {
  changeLocale(key)
}

function setThemeCss(mode) {
  if (mode == 'dark') {
    antTheme.value = theme.darkAlgorithm
    document.body.setAttribute('data-theme', 'dark')
  } else {
    antTheme.value = theme.lightAlgorithm
    document.body.setAttribute('data-theme', 'light')
  }
}

function getThemeMode() {
  let mode = localStorage.getItem('themeMode')
  // 如果缓存中没有设置模式，则优先根据系统配置设置模式
  if (!mode) {
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      mode = 'dark'
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      mode = 'light'
    } else {
      mode = 'light'
    }
  }
  return mode
}

function setThemeMode(mode) {
  themeMode.value = mode
  localStorage.setItem('themeMode', mode)
  if (mode == 'system') {
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeCss('dark')
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeCss('light')
    } else {
      setThemeCss('light')
    }
  } else {
    setThemeCss(mode)
  }
}

menuList.value = dynamicRoutes
// 取根节点下的子菜单
subMenuList.value = router.currentRoute.value.matched[0].children

function changeSubNav(item, index) {
  // const dom = document.getElementsByClassName('menu-init-active')
  // if (dom && dom[0]) {
  //   console.log(dom[0].classList)
  //   dom[0].classList.remove('menu-init-active')
  // }
  if (item.children && item.children.length > 0) {
    // document.getElementsByClassName('')
    currentMenuIndex.value = index
    subMenuList.value = item.children
  }
  if (item.children.length == 1 && !item.children[0].children) {
    // 如果只有一个子菜单，直接跳转
    router.push({ path: item.path })
  }
}
// console.log(router.currentRoute.value)

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
  background-color: var(--color-background-1);
  // background-image: radial-gradient(transparent 1px, #fff 1px);
  // background-size: 4px 4px;
  // backdrop-filter: saturate(50%) blur(4px);
  border-bottom: 1px solid var(--color-border);
  z-index: 12;
  box-shadow: 0px 4px 4px 0px var(--color-border-shadow);
}

.main-wrap {
  position: relative;
  background: var(--color-background);
  display: flex;
  flex-direction: row;
  height: calc(100vh - 64px);
  // margin-top: 68px;
  min-width: 1000px;
}

.logo {
  margin-left: 12px;
}
.app-name {
  font-size: 24px;
  padding: 0 20px 0 16px;
  margin-right: 20px;
  border-right: 2px solid #ccc;
  color: var(--color-text);
  font-weight: 600;
}
.title {
  color: var(--color-text);
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
}

.theme {
  .icon {
    width: 2em;
    height: 2em;
    color: var(--t-gray4);
  }
  .active1 {
    color: var(--t-yellow4);
  }
  .active2 {
    color: var(--t-blue3);
  }
  .active3 {
    color: var(--t-black);
  }
}

.main-menu {
  z-index: 11;
  user-select: none;
  min-width: 120px;
  padding-top: 20px;
  // background: #413e4c;
  background: var(--color-background);
  // border-right: 1px solid var(--color-border);
  box-shadow: 4px 0px 4px 0px var(--color-border-shadow);
  color: #333;
  font-size: 14px;
  // &:lang(en) {
  //   min-width: 160px;
  // }

  .active,
  .init-active {
    background: var(--color-background-2);
    color: var(--color-text-active);
    font-weight: 600;
    &::before {
      transform: scaleY(1);
      // transition:
      //   cubic-bezier(0.645, 0.045, 0.355, 1),
      //   transform 0.15s;
      background: #37f;
    }
  }

  .item {
    color: var(--color-text);
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 0 8px 8px;
    margin: 0;
    vertical-align: middle;
    // transition:
    //   cubic-bezier(0.645, 0.045, 0.355, 1),
    //   background-color 0.25s;
    &:hover:not(.active),
    &:active:not(.active) {
      background: var(--color-background-2);
      color: var(--color-text-active);
      // transition:
      //   cubic-bezier(0.645, 0.045, 0.355, 1),
      //   background-color 0.25s;
    }
    // &:before {
    //   content: ' ';
    //   display: block;
    //   width: 4px;
    //   height: 40px;
    // }
  }

  svg {
    margin-right: 4px;
  }
}
.router-link-active {
  background: var(--color-background-2);
  color: #333;
}

.sub-menu {
  z-index: 11;
  // display: none;
  color: var(--color-text);
  user-select: none;
  width: 150px;
  min-width: 150px;
  background: var(--color-background-2);
  padding-top: 20px;
  font-size: 14px;
  box-shadow: 4px 0px 4px 0px var(--color-border-shadow);
  // border-right: 1px solid var(--color-border);
}

main {
  position: relative;
  flex-grow: 1;
  background: var(--color-background);

  // padding-top: 64px;
}

/* <PerfectScrollbar> */
.ps {
  height: calc(100vh - 64px);
}

.icon2em {
  width: 2em;
  height: 2em;
}
</style>
