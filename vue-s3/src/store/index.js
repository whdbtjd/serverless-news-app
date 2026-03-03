import { createStore } from 'vuex'
import newsModule from './modules/news'

export default createStore({
  modules: {
    news: newsModule
  }
})