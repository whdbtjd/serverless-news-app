import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { getCurrentUser } from '@/services/cognito'

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
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('../views/SignUp.vue'),
    meta: { public: true }
  },
  {
    path: '/confirm',
    name: 'ConfirmSignUp',
    component: () => import('../views/ConfirmSignUp.vue'),
    meta: { public: true }
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

// 네비게이션 가드 설정
router.beforeEach(async (to, from, next) => {
  // 인증이 필요하지 않은 페이지는 public: true로 표시됨
  const isPublicRoute = to.matched.some(record => record.meta.public)
  
  // 현재 로그인 상태 확인
  const user = await getCurrentUser()
  
  // 현재는 모든 페이지에 접근 가능하도록 설정
  next()
  
  // 필요시 아래 주석을 해제하여 인증 필요한 페이지에 인증되지 않은 사용자 접근 제한
  /*
  if (!user && !isPublicRoute) {
    // 인증되지 않은 상태에서 비공개 페이지 접근 시 로그인 페이지로 리디렉션
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
  */
})

export default router