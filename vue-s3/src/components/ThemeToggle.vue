<template>
  <button @click="toggleTheme" class="theme-toggle" :title="buttonTitle">
    <transition name="fade" mode="out-in">
      <i v-if="isDarkTheme" class="fas fa-sun"></i>
      <i v-else-if="isOriginalTheme" class="fas fa-moon"></i>
      <i v-else class="fas fa-palette"></i>
    </transition>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from '../composables/useTheme';

const { isDarkTheme, isOriginalTheme, toggleTheme } = useTheme();

const buttonTitle = computed(() => {
  if (isDarkTheme.value) return '라이트 모드로 전환';
  if (isOriginalTheme.value) return '다크 모드로 전환';
  return '기존 테마로 전환';
});
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.theme-toggle:hover {
  background-color: var(--bg-secondary);
  transform: scale(1.1);
}

.theme-toggle i {
  font-size: 1.2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 