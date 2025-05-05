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
        <button @click="handleSearch">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>
    <nav class="category-nav">
      <div class="container">
        <ul>
          <li><router-link to="/">전체</router-link></li>
          <li><router-link to="/category/business">경제</router-link></li>
          <li><router-link to="/category/technology">기술</router-link></li>
          <li><router-link to="/category/science">과학</router-link></li>
          <li><router-link to="/category/entertainment">엔터테인먼트</router-link></li>
          <li><router-link to="/category/general">일반</router-link></li>
          <li><router-link to="/category/sports">스포츠</router-link></li>
        </ul>
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
      windowWidth: window.innerWidth
    }
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
    
    // URL에서 검색어 가져오기
    if (this.$route.query.search) {
      this.searchQuery = this.$route.query.search
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({
          path: '/',
          query: { search: this.searchQuery }
        })
      }
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
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
  transition: color 0.2s;
}

.logo a:hover {
  color: var(--accent-color);
}

.search-box {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box input {
  padding: 8px 12px;
  border: none;
  border-radius: 4px 0 0 4px;
  min-width: 250px;
  font-size: 14px;
}

.search-box button {
  padding: 8px 12px;
  background-color: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: background-color 0.2s;
}

.search-box button:hover {
  background-color: #2255bb;
}

.search-icon {
  font-size: 16px;
}

.category-nav {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.category-nav li {
  position: relative;
  flex: 0 1 auto;
}

.category-nav a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
  display: block;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.category-nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.category-nav a.router-link-active {
  color: var(--accent-color);
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  
  .category-nav {
    width: 100%;
  }
  
  .category-nav ul {
    justify-content: space-between;
    width: 100%;
    padding: 0 10px;
  }
  
  .category-nav li {
    margin: 3px 0;
  }
  
  .category-nav a {
    font-size: 0.9rem;
    padding: 5px 8px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .category-nav ul {
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
}

@media (max-width: 360px) {
  .category-nav ul {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>