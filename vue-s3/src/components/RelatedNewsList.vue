<template>
  <div class="related-news">
    <h3 class="related-title">관련 기사</h3>
    
    <div v-if="isLoadingRelated" class="loading">
      로딩 중...
    </div>
    
    <div v-else-if="relatedNews.length === 0" class="no-related">
      관련 기사가 없습니다.
    </div>
    
    <div v-else class="related-list">
      <div v-for="article in relatedNews" :key="article.id" class="related-item">
        <router-link 
          :to="`/news/${article.category}/${article.id}`" 
          class="related-link"
          @click="handleRelatedClick"
        >
          <div class="related-image" v-if="article.imageUrl">
            <img :src="article.imageUrl" :alt="article.title" />
          </div>
          <div class="related-info">
            <span class="related-article-title">{{ article.title }}</span>
            <span class="related-date">{{ formatDate(article.publishedAt) }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'RelatedNewsList',
  props: {
    currentCategory: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState('news', ['relatedNews']),
    ...mapGetters('news', ['isLoadingRelated']),
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric'
      })
    },
    handleRelatedClick() {
      // 관련 기사 클릭 시 페이지 최상단으로 스크롤
      window.scrollTo(0, 0)
    }
  }
}
</script>

<style scoped>
.related-news {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 15px;
}

.related-title {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--secondary-color);
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.loading, .no-related {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  padding: 10px 0;
}

.related-list {
  display: flex;
  flex-direction: column;
}

.related-item {
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 12px;
}

.related-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.related-link {
  display: flex;
  text-decoration: none;
  color: inherit;
}

.related-image {
  width: 80px;
  height: 60px;
  margin-right: 10px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.related-article-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 4px;
}

.related-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
</style>