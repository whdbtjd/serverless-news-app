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
          <div class="login-form">
            <input type="text" placeholder="아이디" v-model="userId" />
            <input type="password" placeholder="비밀번호" v-model="userPassword" />
            <button class="login-btn" @click="handleLogin">로그인</button>
          </div>
          <button class="signup-btn" @click="goToSignup">회원가입</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      searchQuery: '',
      userId: '',
      userPassword: '',
      windowWidth: window.innerWidth
    }
  },
  mounted() {
    // 화면 크기 변경 이벤트 리스너 추가
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 제거
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim()) {
        // 검색 기능 - 현재는 API에 검색 기능이 없으므로 프론트에서 필터링
        this.$router.push({
          path: '/',
          query: { search: this.searchQuery }
        })
      }
    },
    handleLogin() {
      // 로그인 기능 구현 예정
      console.log('로그인 시도:', this.userId, this.userPassword);
      // 임시 알림
      alert('로그인 기능 구현 예정입니다.');
    },
    goToSignup() {
      // 회원가입 페이지로 이동 (추후 구현)
      console.log('회원가입 페이지로 이동');
      // 임시 알림
      alert('회원가입 기능 구현 예정입니다.');
    },
    onResize() {
      this.windowWidth = window.innerWidth;
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
}

.category-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
}

.category-nav li {
  position: relative;
  flex: 0 0 auto;
}

.category-nav a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
  display: block;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.category-nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.category-nav a.router-link-active {
  color: var(--accent-color);
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.05);
}

.auth-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-form {
  display: flex;
  gap: 8px;
}

.login-form input {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  width: 120px;
}

.login-btn, .signup-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login-btn {
  background-color: var(--accent-color);
  color: white;
}

.signup-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--secondary-color);
}

.login-btn:hover, .signup-btn:hover {
  opacity: 0.9;
}

/* 반응형 스타일 */
@media (max-width: 1024px) {
  .category-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .category-list {
    justify-content: center;
    width: 100%;
  }
  
  .auth-container {
    width: 100%;
    justify-content: center;
  }
}

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
  
  .login-form {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .login-form input {
    width: 100px;
  }
}

/* 더 작은 모바일 화면용 */
@media (max-width: 480px) {
  .category-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  }
  
  .category-nav li {
    width: 100%;
  }
  
  .category-nav a {
    font-size: 0.85rem;
    padding: 5px 2px;
  }
  
  .auth-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .login-form {
    width: 100%;
  }
}

/* 초소형 화면용 */
@media (max-width: 360px) {
  .category-list {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .login-form input {
    width: 80px;
  }
}
</style>