import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ManageView from '../views/ManageView.vue'
import ApiView from '../views/ApiView.vue'
import RoleView from '../views/RoleView.vue'
import UserView from '../views/UserView.vue'
import OperateLogView from '../views/OperateLogView.vue'
import SecurityLogView from '../views/SecurityLogView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      component: ManageView,
      children: [
        {
          path: 'api',
          name: 'api',
          component: ApiView
        },
        {
          path: 'role',
          name: 'role',
          component: RoleView
        },
        {
          path: 'user',
          name: 'user',
          component: UserView
        },
        {
          path: 'operate-log',
          name: 'operateLog',
          component: OperateLogView
        },
        {
          path: 'security-log',
          name: 'securityLog',
          component: SecurityLogView
        },
      ],
      redirect: '/api'
    }
  ]
})

export default router
