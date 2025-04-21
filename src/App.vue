<template>
  <div class="app">
    <Header />
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  }
}
</script>

<style>
:root {
  --primary-color: #1a2b4a;
  --secondary-color: #ffffff;
  --card-bg-color: #12203a;
  --accent-color: #3366cc;
}

body {
  background: linear-gradient(135deg, var(--primary-color) 0%, #0a1529 100%);
  color: var(--secondary-color);
  font-family: 'Noto Sans KR', sans-serif;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>