import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/main.css'

// 운영환경에서 Vue 경고 비활성화
if (import.meta.env.PROD) {
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
}

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')