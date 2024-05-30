<template>
  <a-config-provider :theme="{ algorithm: theme.lightAlgorithm, token: { colorPrimary: '#61A66C' } }">
    <header class="header">
      <a-button type="primary">Primary Button</a-button>
      <div class="logo"><img src="@/assets/logo.png" width="24" /></div>
      <div class="app-name">管理运营平台</div>
      <div class="module-title">{{ $t($route.meta.title) }}</div>
      <div class="lang">
        <a-dropdown>
          <a @click.prevent>{{ $t('lang') }} <DownOutlined /> </a>
          <template #overlay>
            <a-menu @click="onChangeLocale">
              <a-menu-item key="zh-CN">简体中文 </a-menu-item>
              <a-menu-item key="en"> English </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </header>
    <div class="main-wrap">
      <div><a-menu v-model:openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys" mode="inline" :inline-collapsed="state.collapsed" :items="items"></a-menu></div>
      <ul class="main-menu">
        <template v-for="(item, index) in menuList" :key="index">
          <RouterLink custom :to="item.path" v-slot="{ isActive }">
            <li class="item" :class="{ active: index === currentMenuIndex, 'init-active': isActive && currentMenuIndex === -1 }" v-if="!item.hidden" @click.stop="changeSubNav(item, index)">
              <!-- <Icon :id="item.icon"></Icon> -->
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
        <router-view />
      </div>
    </div>
  </a-config-provider>
</template>

<script setup>
import { onMounted, ref, reactive, h } from 'vue'
import { router, dynamicRoutes } from '../router/router'
import SubMenu from './SubMenu.vue'
import { RouterLink, RouterView } from 'vue-router'
import { changeLocale } from '../i18n'
import { theme } from 'ant-design-vue'
const { useToken } = theme
const { token } = useToken()

import { PieChartOutlined, MailOutlined, DownOutlined, DesktopOutlined, InboxOutlined, AppstoreOutlined } from '@ant-design/icons-vue'

const menuList = ref([])
const subMenuList = ref([])
const activeMenuName = ref(router.currentRoute.name)
const currentMenuIndex = ref(-1)

const onChangeLocale = ({ key }) => {
  changeLocale(key)
}
const state = reactive({
  collapsed: false,
  selectedKeys: ['1'],
  openKeys: ['sub1'],
  preOpenKeys: ['sub1']
})

const items = reactive([
  {
    key: '1',
    icon: () => h(PieChartOutlined),
    label: 'Option 1',
    title: 'Option 1'
  },
  {
    key: '2',
    icon: () => h(DesktopOutlined),
    label: 'Option 2',
    title: 'Option 2'
  },
  {
    key: '3',
    icon: () => h(InboxOutlined),
    label: 'Option 3',
    title: 'Option 3'
  },
  {
    key: 'sub1',
    icon: () => h(MailOutlined),
    label: 'Navigation One',
    title: 'Navigation One',
    children: [
      {
        key: '5',
        label: 'Option 5',
        title: 'Option 5'
      },
      {
        key: '6',
        label: 'Option 6',
        title: 'Option 6'
      },
      {
        key: '7',
        label: 'Option 7',
        title: 'Option 7'
      },
      {
        key: '8',
        label: 'Option 8',
        title: 'Option 8'
      }
    ]
  },
  {
    key: 'sub2',
    icon: () => h(AppstoreOutlined),
    label: 'Navigation Two',
    title: 'Navigation Two',
    children: [
      {
        key: '9',
        label: 'Option 9',
        title: 'Option 9'
      },
      {
        key: '10',
        label: 'Option 10',
        title: 'Option 10'
      },
      {
        key: 'sub3',
        label: 'Submenu',
        title: 'Submenu',
        children: [
          {
            key: '11',
            label: 'Option 11',
            title: 'Option 11'
          },
          {
            key: '12',
            label: 'Option 12',
            title: 'Option 12'
          }
        ]
      }
    ]
  }
])
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

// function getNav() {
//   for (let item of dynamicRoutes) {
//   }
// }
// function getSubNav() {}
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
  padding: 0 20px;
  margin-right: 20px;
  border-right: 1px solid #e9eaec;
  color: #333;
  font-weight: 600;
}
.module-title {
  font-size: 18px;
  flex-grow: 1;
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
  overflow-y: hidden;
  flex-grow: 1;
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  // min-width:
  // display: flex;
  // padding: 12px;
}
</style>
