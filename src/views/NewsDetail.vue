<template>
  <div class="news-detail-page">
    <!-- 왼쪽: 기사 상세 내용 -->
    <div class="news-detail">
      <div v-if="isLoading" class="loading">
        로딩 중...
      </div>
      
      <div v-else-if="hasError" class="error">
        기사를 불러오는 중 오류가 발생했습니다.
      </div>
      
      <div v-else-if="!currentArticle" class="not-found">
        해당 기사를 찾을 수 없습니다.
      </div>
      
      <div v-else class="article">
        <div class="article-header">
          <h1 class="article-title">{{ currentArticle.title }}</h1>
          <div class="article-meta">
            <span class="article-source">출처: {{ currentArticle.source }}</span>
            <span class="article-date">{{ formatDate(currentArticle.publishedAt) }}</span>
          </div>
        </div>
        
        <div class="article-image" v-if="currentArticle.imageUrl">
          <img :src="currentArticle.imageUrl" :alt="currentArticle.title" />
        </div>
        
        <div class="article-content">
          <p class="article-description">{{ currentArticle.description }}</p><div class="article-body">{{ currentArticle.content }}</div>
        </div>
        
        <div class="article-actions">
          <a :href="currentArticle.url" target="_blank" class="original-link">
            원문 보기
          </a>
          <router-link :to="backLink" class="back-link">
            목록으로 돌아가기
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 오른쪽: 관련 기사 목록 -->
    <div class="related-news-sidebar">
      <related-news-list 
        :currentCategory="category"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import RelatedNewsList from '@/components/RelatedNewsList.vue'

export default {
  name: 'NewsDetail',
  components: {
    RelatedNewsList
  },
  props: {
    category: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('news', ['currentArticle']),
    ...mapGetters('news', ['isLoading', 'hasError']),
    
    backLink() {
      return this.category ? `/category/${this.category}` : '/'
    }
  },
  created() {
    this.loadArticle()
  },
  methods: {
    ...mapActions('news', ['fetchNewsDetail']),
    
    loadArticle() {
      // 컴포넌트 생성 시와 경로 변경 시 호출
      this.fetchNewsDetail({ 
        category: this.$route.params.category || this.category, 
        id: this.$route.params.id || this.id 
      })
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  watch: {
    // URL 경로 자체를 감시
    '$route'(to, from) {
      // 경로가 변경됐지만 같은 컴포넌트를 사용할 때(관련 기사 클릭 시)
      if (to.name === from.name && (to.params.id !== from.params.id || to.params.category !== from.params.category)) {
        this.loadArticle()
      }
    }
  }
}
</script>

<style scoped>
.news-detail-page {
  display: flex;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
}

.news-detail {
  flex: 1;
  min-width: 0; /* flexbox 내에서 너비 축소 가능하게 설정 */
}

.related-news-sidebar {
  width: 300px;
  flex-shrink: 0; /* 화면이 좁아져도 크기 유지 */
}

.loading, .error, .not-found {
  text-align: center;
  padding: 50px 0;
  color: var(--secondary-color);
}

.article {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  padding: 20px;
}

.article-header {
  margin-bottom: 20px;
}

.article-title {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--secondary-color);
}

.article-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.article-image {
  margin-bottom: 20px;
}

.article-image img {
  width: 100%;
  border-radius: 8px;
}

.article-description {
  font-size: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.article-body {
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-line; /* 개행 문자 인식 */
}

.article-actions {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}

.original-link, .back-link {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}

.original-link {
  background-color: var(--accent-color);
  color: white;
}

.back-link {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--secondary-color);
}

.original-link:hover, .back-link:hover {
  opacity: 0.9;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .news-detail-page {
    flex-direction: column;
  }
  
  .news-detail {
    margin-bottom: 20px;
  }
  
  .related-news-sidebar {
    width: 100%;
  }
}
</style>