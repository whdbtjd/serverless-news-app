<template>
  <div class="news-card">
    <div class="news-image">
      <img 
        v-if="article.imageUrl" 
        :src="article.imageUrl" 
        :alt="article.title" 
        @error="handleImageError"
      />
      <div v-else class="placeholder-image">
        <span>IMAGE</span>
        <span>COMING SOON</span>
      </div>
    </div>
    <div class="news-content">
      <h3 class="news-title">
        <router-link :to="`/news/${article.category}/${article.id}`">
          {{ article.title }}
        </router-link>
      </h3>
      <p class="news-description">{{ truncateText(article.description, 100) }}</p>
      <div class="news-meta">
        <span class="news-source">{{ article.source }}</span>
        <span class="news-date">{{ formatDate(article.publishedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsCard',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imageError: false
    }
  },
  methods: {
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length 
        ? text.substring(0, length) + '...' 
        : text;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    handleImageError(e) {
      this.imageError = true;
      e.target.style.display = 'none';
      e.target.parentNode.classList.add('placeholder-image');
      
      // 대체 텍스트 생성
      const imgContainer = e.target.parentNode;
      const textSpan1 = document.createElement('span');
      textSpan1.textContent = 'IMAGE';
      const textSpan2 = document.createElement('span');
      textSpan2.textContent = 'COMING SOON';
      
      imgContainer.appendChild(textSpan1);
      imgContainer.appendChild(textSpan2);
    }
  }
}
</script>

<style scoped>
.news-card {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-5px);
}

.news-image {
  height: 160px;
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #888;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  text-align: center;
  position: relative;
}

.placeholder-image::before {
  content: '';
  position: absolute;
  top: 35%;
  left: 50%;
  width: 70%;
  height: 60%;
  transform: translate(-50%, -50%);
  border: 2px solid #aaa;
  z-index: 0;
}

.placeholder-image::after {
  content: '';
  position: absolute;
  top: 35%;
  left: 50%;
  width: 70%;
  height: 2px;
  background-color: #aaa;
  transform: translate(-50%, -50%) rotate(45deg);
  z-index: 1;
}

.placeholder-image span {
  z-index: 2;
  display: block;
  line-height: 1.2;
}

.placeholder-image span:first-child {
  margin-top: 30px;
}

.placeholder-image span:last-child {
  font-size: 14px;
  color: #999;
}

.news-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.news-title {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.news-title a {
  color: var(--secondary-color);
  text-decoration: none;
}

.news-title a:hover {
  color: var(--accent-color);
}

.news-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  flex-grow: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>