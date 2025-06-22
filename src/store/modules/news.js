import api from '@/services/api'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1초

export default {
  namespaced: true,
  state: () => ({
    allNews: [],
    categoryNews: [],
    currentArticle: null,
    relatedNews: [],
    loading: false,
    loadingRelated: false,
    error: null,
    retryCount: 0
  }),
  mutations: {
    SET_ALL_NEWS(state, news) {
      state.allNews = news
    },
    SET_CATEGORY_NEWS(state, news) {
      state.categoryNews = news
    },
    SET_CURRENT_ARTICLE(state, article) {
      state.currentArticle = article
    },
    SET_RELATED_NEWS(state, news) {
      state.relatedNews = news
    },
    SET_LOADING(state, isLoading) {
      state.loading = isLoading
    },
    SET_LOADING_RELATED(state, isLoading) {
      state.loadingRelated = isLoading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    INCREMENT_RETRY_COUNT(state) {
      state.retryCount++
    },
    RESET_RETRY_COUNT(state) {
      state.retryCount = 0
    }
  },
  actions: {
    async fetchAllNews({ commit, state, dispatch }) {
      if (state.loading) return // 이미 로딩 중이면 중복 호출 방지
      
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // 전체 뉴스 먼저 가져오기
        const allNewsResponse = await api.getAllNews()
        let allNews = []
        
        // 전체 뉴스 데이터 처리
        if (allNewsResponse && allNewsResponse.data && allNewsResponse.data.news) {
          allNews = allNewsResponse.data.news
        }
        
        // 모든 카테고리의 뉴스를 가져오기
        const categories = ['business', 'entertainment', 'general', 'science', 'sports', 'technology']
        const categoryResponses = await Promise.all(
          categories.map(category => 
            api.getNewsByCategory(category)
              .then(response => {
                if (response && response.data && response.data.news) {
                  return response.data.news.map(article => ({
                    ...article,
                    category
                  }))
                }
                return []
              })
              .catch(error => {
                console.error(`${category} 카테고리 로딩 오류:`, error)
                return []
              })
          )
        )
        
        // 카테고리별 뉴스 합치기
        const categoryNews = categoryResponses.flat()
        
        // 전체 뉴스와 카테고리별 뉴스 합치기
        const combinedNews = [...allNews, ...categoryNews]
        
        // 중복 제거 로직 (제목만으로 중복 체크)
        const uniqueNewsMap = new Map()
        combinedNews.forEach(article => {
          const key = article.title
          if (!uniqueNewsMap.has(key)) {
            uniqueNewsMap.set(key, article)
          }
        })
        
        const uniqueNews = Array.from(uniqueNewsMap.values())
        uniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        
        commit('SET_ALL_NEWS', uniqueNews)
        commit('RESET_RETRY_COUNT')
      } catch (error) {
        console.error('뉴스 로딩 오류:', error)
        commit('SET_ERROR', error)
        
        if (state.retryCount < MAX_RETRIES) {
          commit('INCREMENT_RETRY_COUNT')
          console.log(`재시도 중... (${state.retryCount}/${MAX_RETRIES})`)
          
          setTimeout(() => {
            dispatch('fetchAllNews')
          }, RETRY_DELAY * state.retryCount)
        } else {
          commit('SET_ALL_NEWS', [])
          commit('RESET_RETRY_COUNT')
        }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNewsByCategory({ commit, state, dispatch }, category) {
      if (state.loading) return
      
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.getNewsByCategory(category)
        
        if (response && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          throw new Error('API가 HTML 응답을 반환했습니다')
        }
        
        if (!response.data || !response.data.news) {
          throw new Error('API 응답 형식이 올바르지 않습니다')
        }
        
        const uniqueNewsMap = new Map()
        response.data.news.forEach(article => {
          const key = article.title
          if (!uniqueNewsMap.has(key)) {
            uniqueNewsMap.set(key, article)
          }
        })
        
        const uniqueNews = Array.from(uniqueNewsMap.values())
        uniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        
        commit('SET_CATEGORY_NEWS', uniqueNews)
        commit('RESET_RETRY_COUNT')
      } catch (error) {
        console.error('카테고리 뉴스 로딩 오류:', error)
        commit('SET_ERROR', error)
        
        if (state.retryCount < MAX_RETRIES) {
          commit('INCREMENT_RETRY_COUNT')
          console.log(`재시도 중... (${state.retryCount}/${MAX_RETRIES})`)
          
          setTimeout(() => {
            dispatch('fetchNewsByCategory', category)
          }, RETRY_DELAY * state.retryCount)
        } else {
          commit('SET_CATEGORY_NEWS', [])
          commit('RESET_RETRY_COUNT')
        }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNewsDetail({ commit, dispatch }, { category, id }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getNewsDetail(category, id)
        
        // API 응답이 HTML인 경우 처리
        if (response && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          console.error('API가 HTML 응답을 반환했습니다');
          commit('SET_ERROR', new Error('API 응답 형식이 올바르지 않습니다'));
          commit('SET_CURRENT_ARTICLE', null);
          return;
        }
        
        commit('SET_CURRENT_ARTICLE', response.data.article)
        // 기사 상세 정보를 가져온 후 관련 기사도 함께 가져옴
        dispatch('fetchRelatedNews', { category, id })
      } catch (error) {
        commit('SET_ERROR', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchRelatedNews({ commit, state, dispatch }, { category, id }) {
      commit('SET_LOADING_RELATED', true)
      try {
        // 1. 같은 카테고리의 기사 가져오기
        const sameCategory = await api.getNewsByCategory(category)
        
        // API 응답이 HTML인 경우 처리
        if (sameCategory && typeof sameCategory.data === 'string' && sameCategory.data.includes('<!DOCTYPE html>')) {
          console.error('API가 HTML 응답을 반환했습니다');
          commit('SET_RELATED_NEWS', []);
          return;
        }
        
        // 2. 다른 카테고리의 기사도 가져오기 (모든 뉴스를 가져오거나, 특정 카테고리 추가)
        let allNews = []
        
        // 2-1. 전체 뉴스 데이터가 이미 있으면 활용, 없으면 가져오기
        if (state.allNews.length === 0) {
          const allNewsResponse = await api.getAllNews()
          
          // API 응답이 HTML인 경우 처리
          if (allNewsResponse && typeof allNewsResponse.data === 'string' && allNewsResponse.data.includes('<!DOCTYPE html>')) {
            console.error('API가 HTML 응답을 반환했습니다');
            allNews = [];
          } else {
            allNews = allNewsResponse.data.news
          }
        } else {
          allNews = state.allNews
        }
        
        // 3. 전체 뉴스 중에서 중복 제거 및 현재 기사 제외
        let combinedNews = [...sameCategory.data.news, ...allNews]
        
        // 중복 제거 (제목 기준)
        const uniqueNewsMap = new Map()
        combinedNews.forEach(article => {
          // 현재 기사는 제외
          if (article.id === id) {
            return
          }
          
          const key = article.title
          if (!uniqueNewsMap.has(key)) {
            uniqueNewsMap.set(key, article)
          }
        })
        
        // Map에서 값만 추출하여 배열로 변환
        const filteredNews = Array.from(uniqueNewsMap.values())
        
        // 최신순 정렬
        filteredNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        
        // 기사 개수 제한 (필요한 만큼 조정)
        const relatedNews = filteredNews.slice(0, 10) // 스크롤 없이 표시하기 위해 개수 제한
        
        commit('SET_RELATED_NEWS', relatedNews)
      } catch (error) {
        console.error('관련 기사 로딩 오류:', error)
        commit('SET_RELATED_NEWS', []);
      } finally {
        commit('SET_LOADING_RELATED', false)
      }
    }
  },
  getters: {
    allNews: state => state.allNews,
    categoryNews: state => state.categoryNews,
    currentArticle: state => state.currentArticle,
    relatedNews: state => state.relatedNews,
    isLoading: state => state.loading,
    isLoadingRelated: state => state.loadingRelated,
    hasError: state => state.error !== null
  }
}