<template>
  <a-config-provider :theme="{ algorithm: theme.lightAlgorithm, token: { colorPrimary: '#61A66C' } }">
    <header class="header">
      <div class="logo"><img src="@/assets/logo.png" width="24" /></div>
      <div class="app-name">{{ $t('appname', '管理运营平台') }}</div>
      <div class="title">{{ $t($route.meta.title) }}</div>
      <div class="my">
        <a-dropdown>
          <a @click.prevent style="font-size: 16px; display: flex; align-items: center; margin-right: 20px">
            <img width="40" height="40" src="@/assets/avatar.jpg" class="avatar" />
            <div>UserName</div>
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
          <a @click.prevent> <Icon name="global" style="width: 2em; height: 2em" /></a>
          <template #overlay>
            <a-menu @click="onChangeLocale">
              <a-menu-item key="zh-CN">简体中文</a-menu-item>
              <a-menu-item key="en"> English</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
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
      <div class="main">
        <PerfectScrollbar>
          <router-view />
        </PerfectScrollbar>
      </div>
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

const onChangeLocale = ({ key }) => {
  changeLocale(key)
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
.main-wrap {
  background: v-bind('token.colorPrimaryBg');
  display: flex;
  flex-direction: row;
  padding-top: 64px;
  height: 100vh;
  min-width: 1000px;
}

.header {
  display: flex;
  flex-direction: row;
  position: absolute;
  align-items: center;
  padding: 0 12px;
  height: 64px;
  width: 100%;
  min-width: 1000px;
  font-size: 16px;
  background-color: rgb(255 255 255 / 0.7);
  border-bottom: 1px solid #e9eaec;
  z-index: 101;
  backdrop-filter: saturate(50%) blur(4px);
  box-shadow: 0px 4px 4px 0px rgba(210, 210, 210, 0.3);
}

.logo {
  margin-left: 12px;
}
.app-name {
  font-size: 24px;
  padding: 0 20px 0 16px;
  margin-right: 20px;
  border-right: 2px solid #ccc;
  // border-radius: 5px;
  color: #333;
  font-weight: 600;
}
.title {
  font-size: 18px;
  flex-grow: 1;
}

.avatar {
  border-radius: 50%;
  margin-right: 8px;
}

.main-menu {
  z-index: 100;
  user-select: none;
  min-width: 120px;
  padding: 12px 0;
  // background: #413e4c;
  background: #fff;
  // border-right: 1px solid #eee;
  box-shadow: 4px 0px 4px 0px rgba(210, 210, 210, 0.3);
  color: #333;
  font-size: 14px;
  // &:lang(en) {
  //   min-width: 160px;
  // }

  .active,
  .init-active {
    background: #f7f7f7;
    color: #333;
    font-weight: 600;
    &::before {
      transform: scaleY(1);
      transition:
        cubic-bezier(0.645, 0.045, 0.355, 1),
        transform 0.15s;
      background: #37f;
    }
  }

  .item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 0 8px 8px;
    margin: 0;
    vertical-align: middle;
    transition:
      cubic-bezier(0.645, 0.045, 0.355, 1),
      background-color 0.25s;
    &:hover:not(.active),
    &:active:not(.active) {
      background: #f7f7f7;
      color: #333;
      transition:
        cubic-bezier(0.645, 0.045, 0.355, 1),
        background-color 0.25s;
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
  background: #fff;
  color: #333;
}

.sub-menu {
  z-index: 100;
  // display: none;
  user-select: none;
  width: 150px;
  min-width: 150px;
  background: #f9f9f9;
  padding-top: 14px;
  font-size: 14px;

  box-shadow: 4px 0px 4px 0px rgba(210, 210, 210, 0.3);
  // border-right: 1px solid #e9eaec;
}

.main {
  position: relative;
  flex-grow: 1;
  background: #fff;
  margin: 12px;
  border-radius: 12px;
}

/* <PerfectScrollbar> */
.ps {
  height: calc(100vh - 68px - 12px - 12px);
}
</style>
