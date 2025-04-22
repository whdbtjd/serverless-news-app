import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { category: 'all' }
  },
  {
    path: '/category/:category',
    name: 'CategoryNews',
    component: () => import('../views/CategoryNews.vue'),
    props: true
  },
  {
    path: '/news/:category/:id',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router