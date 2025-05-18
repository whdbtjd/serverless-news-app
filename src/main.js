import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import userStore from './store/user'
import './assets/main.css' // 또는 .scss 파일

// 앱 시작 시 사용자 정보 로드
userStore.loadUserInfo()

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')