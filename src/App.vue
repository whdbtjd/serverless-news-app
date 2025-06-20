<template>
  <div id="app">
    <ThemeToggle class="theme-toggle-position" />
    <router-view></router-view>
  </div>
</template>

<script>
import ThemeToggle from '@/components/ThemeToggle.vue';
import { useTheme } from '@/composables/useTheme';

export default {
  name: 'App',
  components: {
    ThemeToggle
  },
  setup() {
    useTheme(); // 테마 초기화
  }
}
</script>

<style>
@import './assets/styles/theme.css';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

#app {
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.theme-toggle-position {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* 기본 버튼 스타일 */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
}

/* 기본 입력 필드 스타일 */
input, textarea {
  font-family: inherit;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px 12px;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}
</style>