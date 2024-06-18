import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import helper from '../js/helper'
import i18n from '../js/i18n'
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
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { title: 'route.login', noAuth: true } },
    { path: '/404', name: '404', component: () => import('@/views/404.vue'), meta: { title: 'route.page404', noAuth: true } },
    { path: '/:pathMatch(.*)', redirect: '/404', meta: { title: 'route.page404', noAuth: true } }
  ]
})

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  const { meta } = to

  // console.log(i18n.global.locale.value)
  if (meta.title) {
    document.title = `${i18n.global.t('appname')} - ${i18n.global.t(meta.title)}`
  } else {
    document.title = i18n.global.t('appname')
  }

  // 如果当前页面不需要认证，则放行
  if (meta.noAuth) {
    console.log('pass')
    next()
  } else {
    try {
      const res = await account.verifyToken(helper.getToken())
      console.log(res.verify)
      if (res.verify) {
        if (res.needRefresh) {
          helper.setToken({ accessToken: res.newAccessToken, refreshToken: res.newRefreshToken })
        }
        next()
      } else {
        next({ path: '/login' })
      }
    } catch (e) {
      console.log(e)
      next({ path: '/login' })
    }
  }
})

export const dynamicRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: 'workspace/main',
    meta: { title: 'route.workspace', permissionId: '00010000' },
    isHidden: true
  },
  {
    path: '/workspace',
    component: Layout,
    name: 'workspace',
    meta: { title: 'route.workspace', permissionId: '000010000' },
    icon: '#icon-workspace',
    redirect: '/workspace/main',
    // isHidden: true,
    children: [{ path: '/workspace/main', component: () => import('@/views/Workspace/Main.vue'), meta: { title: 'route.workspace', permission: '0000010001' } }]
  },
  {
    path: '/account',
    component: Layout,
    name: 'account',
    meta: { title: 'route.account', permissionId: '000010000' },
    icon: '#icon-Account',
    children: [
      { path: '/account/accountlist', component: () => import('@/views/Account/AccountList.vue'), meta: { title: 'route.accountlist', permission: '0000010001' } },
      { path: '/account/permission', component: () => import('@/views/Account/Permission.vue'), meta: { title: 'route.permission', permission: '0000010001' } }
    ]
  },
  {
    path: '/voucher',
    component: Layout,
    name: 'voucher',
    meta: { title: 'route.voucher', permissionId: '100' },
    icon: '#icon-voucher',
    children: [
      {
        path: '/voucher/voucherlist',
        name: 'voucherlist',
        meta: { title: 'route.voucherlist', permission: '000010001' },
        children: [
          { path: '/voucher/voucheradd', component: () => import('@/views/Voucher/VoucherList.vue'), meta: { title: 'route.voucherlist', permission: '000010001' } },
          { path: '/voucher/verification', component: () => import('@/views/Voucher/Verification.vue'), meta: { title: 'route.verification', permission: '0000100003' } }
        ]
      },
      { path: '/voucher/templatelist', component: () => import('@/views/Voucher/TemplateList.vue'), meta: { title: 'route.templatelist', permission: '000010002' } }
    ]
  },
  {
    path: '/my',
    component: Layout,
    name: 'my',
    meta: { title: 'route.my', permissionId: '000010000' },
    icon: '#icon-my',
    redirect: '/my/account',
    children: [{ path: '/my/account', component: () => import('@/views/My/Account.vue'), meta: { title: 'route.myaccount', permission: '0000010001' } }]
  }

  // {
  //   path: '/marketing',
  //   component: Layout,
  //   name: 'marketing',
  //   meta: { title: 'route.marketing', permissionId: '0000010001' },
  //   icon: '#icon-marketing',
  //   children: [
  //     {
  //       path: '/marketing/groupon',
  //       component: Layout,
  //       name: 'groupon',
  //       meta: { title: 'route.groupon', permissionId: '0000020001' },
  //       children: [
  //         { path: '/groupon/voucherlist', component: () => import('@/views/Voucher/VoucherList.vue'), meta: { title: 'route.voucherlist', permission: '000010001' } },
  //         { path: '/groupon/templatelist', component: () => import('@/views/Voucher/TemplateList.vue'), meta: { title: 'route.templatelist', permission: '000010002' } }
  //       ]
  //     }
  //   ]
  // },
]
