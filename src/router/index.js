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
    // 지연 로딩으로 코드 스플리팅
    component: () => import(/* webpackChunkName: "category" */ '../views/CategoryNews.vue'),
    props: true
  },
  {
    path: '/news/:category/:id',
    name: 'NewsDetail',
    // 지연 로딩으로 코드 스플리팅
    component: () => import(/* webpackChunkName: "detail" */ '../views/NewsDetail.vue'),
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