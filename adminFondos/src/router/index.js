import { createRouter, createWebHistory } from 'vue-router'
import View1 from '../views/View1.vue'
import View2 from '../views/View2.vue'
import View3 from '../views/View3.vue'

const routes = [
  {
    path: '/view1',
    name: 'View1',
    component: View1
  },
  {
    path: '/view2',
    name: 'View2',
    component: View2
  },
  {
    path: '/view3',
    name: 'View3',
    component: View3
  },
  {
    path: '/',
    redirect: '/view1' // Redirección por defecto
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router