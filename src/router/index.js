import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    // 홈 페이지에 접속했을 때 전체 뉴스가 기본으로 표시되도록
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
  history: createWebHashHistory(import.meta.env.BASE_URL), // createWebHistory에서 createWebHashHistory로 변경
  routes,
  scrollBehavior() {
    // 페이지 전환 시 항상 맨 위로 스크롤
    return { top: 0 }
  }
})

export default router