import { ref, onMounted, watch } from 'vue';

const THEME_KEY = 'theme-preference';
const isDarkTheme = ref(false);

export function useTheme() {
  // 시스템 테마 감지
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 테마 적용
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    isDarkTheme.value = theme === 'dark';
    localStorage.setItem(THEME_KEY, theme);
  };

  // 테마 전환
  const toggleTheme = () => {
    const newTheme = isDarkTheme.value ? 'light' : 'dark';
    applyTheme(newTheme);
  };

  // 초기 테마 설정
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const theme = savedTheme || getSystemTheme();
    applyTheme(theme);
  };

  // 시스템 테마 변경 감지
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  };

  onMounted(() => {
    initializeTheme();
    watchSystemTheme();
  });

  return {
    isDarkTheme,
    toggleTheme
  };
} 