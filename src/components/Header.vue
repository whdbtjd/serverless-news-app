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