<template>
  <div class="home">
    <h1 class="page-title">
      {{ searchQuery ? `'${searchQuery}' 검색 결과` : '최신 뉴스' }}
    </h1>
    
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      뉴스를 불러오는 중...
    </div>
    
    <div v-else-if="hasError" class="error">
      <div class="error-icon">⚠️</div>
      뉴스를 불러오는 중 오류가 발생했습니다.
      <button @click="fetchAllNews" class="retry-button">다시 시도</button>
    </div>
    
    <div v-else-if="filteredNews.length === 0" class="no-results">
      <div class="no-results-icon">🔍</div>
      <p>'{{ searchQuery }}' 검색 결과가 없습니다.</p>
      <button @click="clearSearch" class="clear-button">검색 지우기</button>
    </div>
    
    <div v-else class="news-grid">
      <div v-for="article in filteredNews" :key="article.id" class="news-item">
        <news-card :article="article" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import NewsCard from '@/components/NewsCard.vue'

export default {
  name: 'Home',
  components: {
    NewsCard
  },
  data() {
    return {
      searchQuery: '',
      categories: [
        { id: 'business', name: '비즈니스' },
        { id: 'entertainment', name: '엔터테인먼트' },
        { id: 'general', name: '일반' },
        { id: 'science', name: '과학' },
        { id: 'sports', name: '스포츠' },
        { id: 'technology', name: '기술' }
      ]
    }
  },
  computed: {
    ...mapState('news', ['allNews']),
    ...mapGetters('news', ['isLoading', 'hasError']),
    
    filteredNews() {
      if (!this.searchQuery) {
        // 검색어가 없으면 최신 12개 뉴스 표시
        return this.allNews.slice(0, 12)
      }
      
      // 검색어가 있으면 제목, 설명, 출처에서 검색
      const query = this.searchQuery.toLowerCase().trim()
      
      return this.allNews.filter(article => {
        const title = (article.title || '').toLowerCase()
        const description = (article.description || '').toLowerCase()
        const source = (article.source || '').toLowerCase()
        const category = (article.category || '').toLowerCase()
        
        return title.includes(query) ||
               description.includes(query) ||
               source.includes(query) ||
               this.getCategoryName(category).toLowerCase().includes(query)
      })
    }
  },
  watch: {
    // URL 쿼리 파라미터가 변경될 때 검색어 업데이트
    '$route.query.search': {
      immediate: true,
      handler(newValue) {
        this.searchQuery = newValue || ''
      }
    }
  },
  created() {
    // 페이지 로드 시 바로 전체 뉴스 데이터 가져오기
    this.fetchAllNews()
  },
  methods: {
    ...mapActions('news', ['fetchAllNews']),
    
    clearSearch() {
      this.$router.push({ path: '/' })
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.name : '카테고리'
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px 0;
}

.page-title {
  margin-bottom: 20px;
  color: var(--secondary-color);
}

.loading, .error, .no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--accent-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon, .no-results-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.retry-button, .clear-button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.news-item {
  height: 100%;
}
</style>