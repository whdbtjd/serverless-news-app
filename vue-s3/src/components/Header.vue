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
            <div v-if="userStore.state.isLoading" class="auth-loading">
              <span>로딩 중...</span>
            </div>
            <div v-else-if="userStore.state.isAuthenticated" class="user-info">
              <span class="welcome-text">
                {{ userStore.state.user?.nickname || userStore.state.user?.email }} 님
              </span>
              <router-link to="/profile" class="profile-btn">내 정보</router-link>
              <button class="logout-btn" @click="handleLogout">로그아웃</button>
            </div>
            <div v-else class="login-form">
              <button class="login-btn" @click="handleLogin">로그인</button>
              <button class="signup-btn" @click="goToSignup">회원가입</button>
              <router-link to="/forgot-password" class="forgot-password-link">비밀번호 찾기</router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from '@/services/cognito'
import userStore from '@/store/user'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const windowWidth = ref(window.innerWidth)
    
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
        userStore.clearUserState()
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
      windowWidth,
      userStore,
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
  background-color: var(--header-bg);
  color: var(--header-text);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, color 0.3s ease;
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
  color: var(--header-text);
  text-decoration: none;
  transition: color 0.3s ease;
}

.search-box {
  display: flex;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px 0 0 4px;
  min-width: 250px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.search-box button {
  padding: 8px 12px;
  background-color: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: background-color 0.3s ease;
}

.category-nav {
  background-color: var(--nav-bg);
  padding: 10px 0;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
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
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding-bottom: 5px;
}

.nav-scroll-container::-webkit-scrollbar {
  display: none;
}

.category-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 20px;
}

.category-nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.category-nav a:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.category-nav a.router-link-active {
  color: var(--accent-color);
  background-color: var(--bg-tertiary);
}

.auth-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid var(--border-color);
}

.auth-loading {
  color: var(--text-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  gap: 8px;
}

.login-btn, .signup-btn, .logout-btn, .profile-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn, .logout-btn {
  background-color: var(--accent-color);
  color: white;
}

.signup-btn, .profile-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.forgot-password-link {
  color: var(--text-secondary);
  font-size: 12px;
  text-decoration: none;
}

.forgot-password-link:hover {
  color: var(--text-primary);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box input {
    flex: 1;
    min-width: 0;
  }
  
  .auth-container {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    justify-content: center;
  }
  
  .category-list {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .auth-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .login-form {
    flex-direction: column;
  }
  
  .login-btn, .signup-btn, .logout-btn, .profile-btn {
    width: 100%;
  }
}
</style>