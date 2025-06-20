import { ref, onMounted, watch } from 'vue';

const THEME_KEY = 'theme-preference';
const isDarkTheme = ref(false);
const isOriginalTheme = ref(true);

export function useTheme() {
  // 시스템 테마 감지
  const getSystemTheme = () => {
    return 'original';
  };

  // 테마 적용
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    isDarkTheme.value = theme === 'dark';
    isOriginalTheme.value = theme === 'original';
    localStorage.setItem(THEME_KEY, theme);
  };

  // 테마 순환 (original -> dark -> light)
  const toggleTheme = () => {
    const currentTheme = localStorage.getItem(THEME_KEY) || getSystemTheme();
    let newTheme;
    
    switch (currentTheme) {
      case 'original':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'light';
        break;
      case 'light':
      default:
        newTheme = 'original';
        break;
    }
    
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
        applyTheme('original');
      }
    });
  };

  onMounted(() => {
    initializeTheme();
    watchSystemTheme();
  });

  return {
    isDarkTheme,
    isOriginalTheme,
    toggleTheme
  };
} 