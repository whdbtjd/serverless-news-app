<template>
    <div class="news-card">
      <div class="news-image" v-if="article.imageUrl">
        <img :src="article.imageUrl" :alt="article.title" />
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
  }
  
  .news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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