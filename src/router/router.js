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

  // voucher: '券',
  // voucherlist: '券列表',
  // verification: '券核销',
  // templatelist: '券模板'

  // {
  //   path: '/',
  //   component: Layout,
  //   name: 'approval',
  //   meta: { title: 'route.pattern', permissionId: '100' },
  //   redirect: '/approval/edit',
  //   icon: '#icon-approve',
  //   children: [{ path: '/approval/edit', component: () => import('@/views/Approval/ApprovalEditView.vue'), meta: { title: 'route.pattern', permission: '100001' }, hidden: true }]
  // },
  // {
  //   path: '/exinput',
  //   component: Layout,
  //   name: 'exinput',
  //   meta: { title: 'route.expression', permissionId: '200' },
  //   redirect: '/expressionedit/exinput',
  //   icon: '#icon-approve',
  //   children: [
  //     { path: '/expressionedit/exinput', component: () => import('@/views/ExpressionEditor/ExInput.vue'), meta: { title: 'route.expression', permission: '200001' }, hidden: true },
  //     { path: '/expressionedit/exinp', component: () => import('@/views/ExpressionEditor/ExInp.vue'), meta: { title: '表达式编辑器2 ', permission: '200001' }, hidden: true }
  //   ]
  // },
  // {
  //   path: '/coeditor',
  //   component: Layout,
  //   name: 'coeditor',
  //   meta: { title: 'route.coeditor', permissionId: '300' },
  //   redirect: '/coeditor/markdown',
  //   icon: '#icon-approve',
  //   children: [{ path: '/coeditor/markdown', component: () => import('@/views/CoEditor/Editor.vue'), meta: { title: 'Markdown', permission: '500001' }, hidden: true }]
  // },

  // {
  //   path: '/gear',
  //   component: Layout,
  //   name: 'gear',
  //   meta: { title: 'route.gear', permissionId: '300' },
  //   redirect: '/gear/involute',
  //   icon: '#icon-approve',
  //   children: [{ path: '/gear/involute', component: () => import('@/views/Gear/InvoluteView.vue'), meta: { title: '渐开线', permission: '600001' }, hidden: true }]
  // },

  // {
  //   path: '/canvas',
  //   component: Layout,
  //   name: 'canvas',
  //   meta: { title: 'route.canvas', permissionId: '300' },
  //   redirect: '/canvas/gridcanvas',
  //   icon: '#icon-approve',
  //   children: [{ path: '/canvas/gridcanvas', component: () => import('@/views//Canvas/GridCanvas.vue'), meta: { title: '网格画布', permission: '600001' }, hidden: true }]
  // },

  // {
  //   path: '/im',
  //   component: Layout,
  //   name: 'IM工具',
  //   meta: { title: 'route.kefu', permissionId: '300' },
  //   redirect: '/im/kefu',
  //   icon: '#icon-approve',
  //   children: [{ path: '/im/kefu', component: () => import('@/views/IM/Kefu.vue'), meta: { title: '客服', permission: '300001' }, hidden: true }]
  // },

  // {
  //   path: '/pattern',
  //   component: Layout,
  //   name: '图样',
  //   meta: { title: 'route.pattern', permissionId: '300' },
  //   redirect: '/im/kefu',
  //   icon: '#icon-approve',
  //   children: [{ path: '/pattern/editor', component: () => import('@/views/Pattern/Editor.vue'), meta: { title: '图样编辑器', permission: '300001' }, hidden: true }]
  // },

  // {
  //   path: '/org',
  //   component: Layout,
  //   name: 'org',
  //   meta: { title: 'route.org', permissionId: '400' },
  //   redirect: '/org/deptmember',
  //   icon: '#icon-condition',
  //   children: [
  //     {
  //       path: '/org/deptmember',
  //       name: 'org_deptmember',
  //       component: () => import('@/views/Org/DeptMember.vue'),
  //       meta: { title: '成员与部门', permission: '100001' }
  //     },
  //     {
  //       path: '/org/edita',
  //       name: 'org_edita',
  //       redirect: '/org/edita',
  //       meta: { title: '组织a', permission: '100001' },
  //       children: [
  //         {
  //           path: '/org/edita',
  //           name: 'org_edita',
  //           component: () => import('@/views/Org/OrgEditView.vue'),
  //           meta: { title: '编辑组织a', permission: '100001' }
  //         },
  //         {
  //           path: '/org/adda',
  //           name: 'org_adda',
  //           component: () => import('@/views/Org/OrgAddView.vue'),
  //           meta: { title: '新增组织a', permission: '100001' }
  //         }
  //       ]
  //     },
  //     {
  //       name: 'org_list',
  //       path: '/org/list',
  //       component: () => import('@/views/Org/OrgListView.vue'),
  //       meta: { title: '组织列表', permission: '100002' }
  //     }
  //   ]
  // }
]
