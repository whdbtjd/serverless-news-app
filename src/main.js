import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/main.css' // 또는 .scss 파일

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')