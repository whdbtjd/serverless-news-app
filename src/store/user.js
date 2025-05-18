import { reactive, readonly, provide, inject } from 'vue'
import { getCurrentUser } from '@/services/cognito'

const userSymbol = Symbol()

export function createUserStore() {
  // 사용자 상태
  const state = reactive({
    user: null,
    isAuthenticated: false,
    isLoading: false
  })

  // 사용자 상태 로드
  const loadUserInfo = async () => {
    state.isLoading = true
    try {
      const userData = await getCurrentUser()
      state.user = userData
      state.isAuthenticated = !!userData
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error)
      state.user = null
      state.isAuthenticated = false
    } finally {
      state.isLoading = false
    }
  }

  // 사용자 상태 업데이트
  const updateUserState = (user) => {
    state.user = user
    state.isAuthenticated = !!user
  }

  // 로그아웃 처리
  const clearUserState = () => {
    state.user = null
    state.isAuthenticated = false
  }

  const store = {
    state: readonly(state),
    loadUserInfo,
    updateUserState,
    clearUserState
  }

  return store
}

// 컴포넌트에서 사용할 Provider & Inject 함수
export function provideUserStore() {
  const store = createUserStore()
  provide(userSymbol, store)
  return store
}

export function useUserStore() {
  const store = inject(userSymbol)
  if (!store) {
    throw new Error('User store not provided!')
  }
  return store
}

// 싱글톤 인스턴스 생성
const userStore = createUserStore()
export default userStore 