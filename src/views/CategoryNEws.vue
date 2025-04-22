<template>
    <div class="category-page">
      <h1 class="page-title">{{ getCategoryName(category) }}</h1>
      
      <div v-if="isLoading" class="loading">
        뉴스를 불러오는 중...
      </div>
      
      <div v-else-if="hasError" class="error">
        뉴스를 불러오는 중 오류가 발생했습니다.
      </div>
      
      <div v-else-if="categoryNews.length === 0" class="no-news">
        이 카테고리에 뉴스가 없습니다.
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
  }
  
  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .news-item {
    height: 100%;
  }
  
  @media (max-width: 768px) {
    .news-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>