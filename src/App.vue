<template>
  <div class="app">
    <h1>Global News Forum</h1>
    <main>
      <!-- 여기에 라우터 뷰가 들어갈 예정 -->
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
  data() {
    return {
      appTitle: import.meta.env.VITE_APP_TITLE
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #1a2b4a;
  color: white;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>