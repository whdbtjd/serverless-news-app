<template>
  <div class="category-page">
    <h1 class="page-title">{{ getCategoryName(category) }}</h1>
    
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      뉴스를 불러오는 중...
    </div>
    
    <div v-else-if="hasError" class="error">
      <div class="error-icon">⚠️</div>
      뉴스를 불러오는 중 오류가 발생했습니다.
      <button @click="refreshCategory" class="retry-button">다시 시도</button>
    </div>
    
    <div v-else-if="categoryNews.length === 0" class="no-news">
      <div class="no-news-icon">📰</div>
      <p>이 카테고리에 뉴스가 없습니다.</p>
      <router-link to="/" class="home-button">홈으로 돌아가기</router-link>
    </div>
    
    <div v-else class="news-grid">
      <div v-for="article in categoryNews" :key="article.id" class="news-item">
        <news-card :article="article" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import NewsCard from '@/components/NewsCard.vue'

export default {
  name: 'CategoryNews',
  components: {
    NewsCard
  },
  props: {
    category: {
      type: String,
      required: true
    }
  },
  data() {
    return {
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
    ...mapState('news', ['categoryNews']),
    ...mapGetters('news', ['isLoading', 'hasError'])
  },
  watch: {
    category: {
      immediate: true,
      handler(newCategory) {
        if (newCategory) {
          this.fetchNewsByCategory(newCategory)
        }
      }
    }
  },
  methods: {
    ...mapActions('news', ['fetchNewsByCategory']),
    
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.name : '카테고리'
    },
    
    refreshCategory() {
      this.fetchNewsByCategory(this.category)
    }
  }
}
</script>

<style scoped>
.category-page {
  padding: 20px 0;
}

.page-title {
  margin-bottom: 20px;
  color: var(--secondary-color);
}

.loading, .error, .no-news {
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

.error-icon, .no-news-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.retry-button, .home-button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.news-item {
  height: 100%;
}
</style>