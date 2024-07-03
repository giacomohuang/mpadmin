import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import helper from '../js/helper'
import i18n, { loadLocaleData, getLocale } from '../js/i18n'
import account from '../api/account'

// import Layout1 from '@/views/Layout1.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // scrollBehavior(to, from, savedPosition) {
  //   return {
  //     el: 'main',
  //     top: 0
  //   }
  // },
  routes: [
    { path: '/signin', name: 'signin', component: () => import('@/views/Signin.vue'), meta: { title: 'common.route.signin', noAuth: true } },
    { path: '/404', name: '404', component: () => import('@/views/404.vue'), meta: { title: 'common.route.404', noAuth: true } },
    { path: '/:pathMatch(.*)', redirect: '/404', meta: { title: 'common.route.404', noAuth: true } }
  ]
})

const setTitle = (title) => {
  if (title) {
    document.title = `${i18n.global.t('common.appname')} - ${i18n.global.t(title)}`
  } else {
    document.title = i18n.global.t('common.appname')
  }
}

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  const { meta } = to
  // 载入路由对应的语言文件
  // console.log(getLocale())
  console.log(to.path)
  await loadLocaleData(getLocale(), to.path)
  setTitle(meta.title)
  // 如果当前页面不需要认证，则放行
  if (meta.noAuth) {
    console.log('pass')
    next()
  } else {
    try {
      const resp = await account.verifyToken(helper.getToken())
      if (resp.verify) {
        if (resp.newAccessToken && resp.newRefreshToken) {
          helper.setToken({ accessToken: resp.newAccessToken, refreshToken: resp.newRefreshToken })
        }
        next()
      } else {
        next({ path: '/signin' })
      }
    } catch (e) {
      next({ path: '/signin' })
    }
  }
})

export const dynamicRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: 'workspace/main',
    meta: { title: 'common.route.workspace', permissionId: '00010000' },
    isHidden: true
  },
  {
    path: '/workspace',
    component: Layout,
    name: 'workspace',
    meta: { title: 'common.route.workspace', permissionId: '000010000' },
    icon: '#icon-workspace',
    redirect: '/workspace/main',
    // isHidden: true,
    children: [{ path: '/workspace/main', component: () => import('@/views/Workspace/Main.vue'), meta: { title: 'common.route.workspace', permission: '0000010001' } }]
  },
  {
    path: '/account',
    component: Layout,
    name: 'account',
    meta: { title: 'common.route.account', permissionId: '000010000' },
    icon: '#icon-Account',
    children: [
      { path: '/account/accountlist', component: () => import('@/views/Account/AccountList.vue'), meta: { title: 'common.route.accountlist', permission: '0000010001' } },
      { path: '/account/permission', component: () => import('@/views/Account/Permission.vue'), meta: { title: 'common.route.permission', permission: '0000010001' } }
    ]
  },
  {
    path: '/voucher',
    component: Layout,
    name: 'voucher',
    meta: { title: 'common.route.voucher', permissionId: '100' },
    icon: '#icon-voucher',
    children: [
      {
        path: '/voucher/voucherlist',
        name: 'voucherlist',
        meta: { title: 'common.route.voucherlist', permission: '000010001' },
        children: [
          { path: '/voucher/voucheradd', component: () => import('@/views/Voucher/VoucherList.vue'), meta: { title: 'common.route.voucherlist', permission: '000010001' } },
          { path: '/voucher/verification', component: () => import('@/views/Voucher/Verification.vue'), meta: { title: 'common.route.verification', permission: '0000100003' } }
        ]
      },
      { path: '/voucher/templatelist', component: () => import('@/views/Voucher/TemplateList.vue'), meta: { title: 'common.route.templatelist', permission: '000010002' } }
    ]
  },
  {
    path: '/my',
    component: Layout,
    name: 'my',
    meta: { title: 'common.route.my', permissionId: '000010000' },
    icon: '#icon-my',
    children: [
      { path: '/my/profile', component: () => import('@/views/My/Profile.vue'), meta: { title: 'common.route.profile', permission: '40001' } },
      { path: '/my/authentication', component: () => import('@/views/My/Authentication.vue'), meta: { title: 'common.route.authentication', permission: '40002' } }
    ]
  }

  // {
  //   path: '/marketing',
  //   component: Layout,
  //   name: 'marketing',
  //   meta: { title: 'common.route.marketing', permissionId: '0000010001' },
  //   icon: '#icon-marketing',
  //   children: [
  //     {
  //       path: '/marketing/groupon',
  //       component: Layout,
  //       name: 'groupon',
  //       meta: { title: 'common.route.groupon', permissionId: '0000020001' },
  //       children: [
  //         { path: '/groupon/voucherlist', component: () => import('@/views/Voucher/VoucherList.vue'), meta: { title: 'common.route.voucherlist', permission: '000010001' } },
  //         { path: '/groupon/templatelist', component: () => import('@/views/Voucher/TemplateList.vue'), meta: { title: 'common.route.templatelist', permission: '000010002' } }
  //       ]
  //     }
  //   ]
  // },
]
