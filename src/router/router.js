import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
// import Layout1 from '@/views/Layout1.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // scrollBehavior(to, from, savedPosition) {
  //   return { top: 0 }
  // },
  routes: [{ path: '/login', name: 'login', component: () => import('@/views/Login.vue') }]
})

export const dynamicRoutes = [
  {
    path: '/',
    component: Layout,
    name: 'workspace',
    meta: { title: 'route.workspace', permissionId: '000010000' },
    icon: '#icon-workspace',
    redirect: '/workspace',
    children: [{ path: '/workspace', component: () => import('@/views/Workspace/Main.vue'), meta: { title: 'route.workspace', permission: '0000010001' } }]
  },
  {
    path: '/account',
    component: Layout,
    name: 'Account',
    meta: { title: 'route.account', permissionId: '000010000' },
    icon: '#icon-Account',
    redirect: '/permission',
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
    redirect: '/voucherlist',
    children: [
      { path: '/voucher/voucherlist', component: () => import('@/views/Voucher/VoucherList.vue'), meta: { title: 'route.voucherlist', permission: '000010001' } },
      { path: '/voucher/templatelist', component: () => import('@/views/Voucher/TemplateList.vue'), meta: { title: 'route.templatelist', permission: '000010002' } },
      { path: '/voucher/verification', component: () => import('@/views/Voucher/Verification.vue'), meta: { title: 'route.verification', permission: '0000100003' } }
    ]
  },
  {
    path: '/marketing',
    component: Layout,
    name: 'marketing',
    meta: { title: 'route.marketing', permissionId: '0000010001' },
    icon: '#icon-marketing',
    redirect: '/voucher'
  }
]
