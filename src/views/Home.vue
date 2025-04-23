<template>
  <div class="home">
    <h1 class="page-title">
      {{ searchQuery ? `'${searchQuery}' 검색 결과` : '최신 뉴스' }}
    </h1>
    
    <div v-if="isLoading" class="loading">
      뉴스를 불러오는 중...
    </div>
    
    <div v-else-if="hasError" class="error">
      뉴스를 불러오는 중 오류가 발생했습니다.
    </div>
    
    <div v-else-if="filteredNews.length === 0" class="no-results">
      검색 결과가 없습니다.
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
      searchQuery: ''
    }
  },
  computed: {
    ...mapState('news', ['allNews']),
    ...mapGetters('news', ['isLoading', 'hasError']),
    
    filteredNews() {
      if (!this.searchQuery) {
        return this.allNews
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      
      return this.allNews.filter(article => {
        const title = (article.title || '').toLowerCase()
        const description = (article.description || '').toLowerCase()
        const source = (article.source || '').toLowerCase()
        
        return title.includes(query) ||
               description.includes(query) ||
               source.includes(query)
      })
    }
  },
  watch: {
    '$route.query.search': {
      immediate: true,
      handler(newValue) {
        this.searchQuery = newValue || ''
      }
    }
  },
  created() {
    this.fetchAllNews()
  },
  methods: {
    ...mapActions('news', ['fetchAllNews'])
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
}

.news-item {
  height: 100%;
}
</style>