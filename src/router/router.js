import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import { KeepAlive } from 'vue'
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
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { title: 'route.login' } },
    {
      path: '/404',
      name: '404',
      component: Layout,
      redirect: '/404/page',
      meta: { title: 'route.page404' },
      children: [{ path: '/404/page', name: '404page', component: () => import('@/views/404.vue') }]
    },
    {
      path: '/:pathMatch(.*)',
      redirect: '/404'
    }
  ]
})

// 路由前置守卫
// router.beforeEach((to, from, next) => {
//   // const { meta, name } = to
//   // const { isLogin } = meta
//   // // token不存在时跳转非登录页，重定向到登录页
//   // if (!getToken() && name !== 'Login' && isLogin) next({ path: '/login' })
//   // // 其他场景
//   // else next()
// })

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
