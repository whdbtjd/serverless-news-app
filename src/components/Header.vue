<template>
  <header class="header">
    <div class="container header-container">
      <h1 class="logo">
        <router-link to="/">Global News Forum</router-link>
      </h1>
      <div class="search-box">
        <input
           type="text"
           placeholder="기사 검색..."
           v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">검색</button>
      </div>
    </div>
    <nav class="category-nav">
      <div class="container category-container">
        <div class="nav-scroll-container">
          <ul class="category-list">
            <li><router-link to="/">전체</router-link></li>
            <li><router-link to="/category/business">경제</router-link></li>
            <li><router-link to="/category/technology">기술</router-link></li>
            <li><router-link to="/category/science">과학</router-link></li>
            <li><router-link to="/category/entertainment">엔터테인먼트</router-link></li>
            <li><router-link to="/category/general">일반</router-link></li>
            <li><router-link to="/category/sports">스포츠</router-link></li>
          </ul>
          
          <div class="auth-container">
            <div v-if="isLoading" class="auth-loading">
              <span>로딩 중...</span>
            </div>
            <div v-else-if="isAuthenticated" class="user-info">
              <span class="welcome-text">
                {{ user.nickname || user.email }} 님
              </span>
              <button class="logout-btn" @click="handleLogout">로그아웃</button>
            </div>
            <div v-else class="login-form">
              <button class="login-btn" @click="handleLogin">로그인</button>
              <button class="signup-btn" @click="goToSignup">회원가입</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut } from '@/services/cognito'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const userId = ref('')
    const userPassword = ref('')
    const windowWidth = ref(window.innerWidth)
    const user = ref(null)
    const isLoading = ref(true)

    // 사용자 정보 로드
    const loadUserInfo = async () => {
      isLoading.value = true
      try {
        user.value = await getCurrentUser()
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error)
        user.value = null
      } finally {
        isLoading.value = false
      }
    }
    
    // 로그인 여부 확인
    const isAuthenticated = computed(() => {
      return !!user.value
    })
    
    // 컴포넌트 마운트 시 사용자 정보 로드
    onMounted(() => {
      loadUserInfo()
      window.addEventListener('resize', onResize)
      onResize()
    })
    
    const onResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        // 검색 기능 - 현재는 API에 검색 기능이 없으므로 프론트에서 필터링
        router.push({
          path: '/',
          query: { search: searchQuery.value }
        })
      }
    }
    
    const handleLogin = () => {
      router.push('/login')
    }
    
    const handleLogout = async () => {
      try {
        signOut()
        user.value = null
        router.push('/')
      } catch (error) {
        console.error('로그아웃 오류:', error)
      }
    }
    
    const goToSignup = () => {
      router.push('/signup')
    }
    
    return {
      searchQuery,
      userId,
      userPassword,
      windowWidth,
      user,
      isLoading,
      isAuthenticated,
      handleSearch,
      handleLogin,
      handleLogout,
      goToSignup,
      onResize
    }
  }
}
</script>

<style scoped>
.header {
  background-color: var(--primary-color);
  color: var(--secondary-color);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.logo a {
  color: var(--secondary-color);
  text-decoration: none;
}

.search-box {
  display: flex;
}

.search-box input {
  padding: 8px 12px;
  border: none;
  border-radius: 4px 0 0 4px;
  min-width: 250px;
}

.search-box button {
  padding: 8px 12px;
  background-color: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
}

.category-nav {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px 0;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-container {
  width: 100%;
}

.nav-scroll-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
  -ms-overflow-style: none;  /* IE와 Edge */
  scrollbar-width: none;  /* Firefox */
  padding-bottom: 5px;
}

/* Chrome, Safari, Opera에서 스크롤바 숨기기 */
.nav-scroll-container::-webkit-scrollbar {
  display: none;
}

.category-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 10px;
  flex-wrap: nowrap;
  flex: 1;
  justify-content: space-between;
  position: relative;
  padding-right: 0;
}

.category-list::after {
  display: none; /* 구분선 제거 */
}

.category-nav li {
  position: relative;
  flex: 1;
  text-align: center;
}

.category-nav a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
  display: block;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  letter-spacing: 0.5px;
  width: 100%;
}

.category-nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.category-nav a.router-link-active {
  color: var(--accent-color);
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent-color);
  border-radius: 2px;
}

.auth-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: 0;
  padding-left: 10px;
  position: relative;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-loading {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  color: var(--secondary-color);
  font-size: 14px;
  white-space: nowrap;
}

.login-form {
  display: flex;
  gap: 8px;
}

.login-btn, .signup-btn, .logout-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.login-btn {
  background-color: var(--accent-color);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.signup-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--secondary-color);
}

.logout-btn {
  background-color: rgba(255, 0, 0, 0.3);
  color: var(--secondary-color);
}

.login-btn:hover, .signup-btn:hover, .logout-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.login-btn:active, .signup-btn:active, .logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    margin-top: 15px;
    width: 100%;
  }
  
  .search-box input {
    flex-grow: 1;
  }
  
  .login-form input {
    width: 100px;
  }
}

/* 더 작은 모바일 화면용 */
@media (max-width: 480px) {
  .login-form input {
    width: 80px;
  }
}
</style>