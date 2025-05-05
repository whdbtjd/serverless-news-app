import api from '@/services/api'

// API 응답 타임아웃 설정
const API_TIMEOUT = 10000

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
    lastFetchTime: {
      all: null,
      category: {},
      detail: {}
    }
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
    SET_LAST_FETCH_TIME(state, { type, id, time }) {
      if (type === 'all') {
        state.lastFetchTime.all = time
      } else if (type === 'category') {
        state.lastFetchTime.category[id] = time
      } else if (type === 'detail') {
        state.lastFetchTime.detail[id] = time
      }
    }
  },
  actions: {
    async fetchAllNews({ commit, state }) {
      // 캐싱 로직: 최근 5분 이내에 불러온 경우 다시 불러오지 않음
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      if (state.lastFetchTime.all && (now - state.lastFetchTime.all < fiveMinutes) && state.allNews.length > 0) {
        return
      }
      
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // API 호출 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), API_TIMEOUT)
        })
        
        const responsePromise = api.getAllNews()
        const response = await Promise.race([responsePromise, timeoutPromise])
        
        // 중복 제거 및 데이터 정제 로직
        const uniqueNewsMap = new Map()
        
        if (!response.data || !response.data.news || !Array.isArray(response.data.news)) {
          throw new Error('API 응답 형식이 올바르지 않습니다.')
        }
        
        response.data.news.forEach(article => {
          // 유효하지 않은 기사 필터링
          if (!article || !article.title || !article.id) return
          
          // 제목을 기준으로 중복 제거
          const key = article.title.trim().toLowerCase()
          
          // 이미 존재하는 기사라면 더 많은 정보가 있는 기사를 선택
          if (uniqueNewsMap.has(key)) {
            const existingArticle = uniqueNewsMap.get(key)
            
            // 이미지 URL이 있는 기사 우선
            if (!existingArticle.imageUrl && article.imageUrl) {
              uniqueNewsMap.set(key, article)
            }
            
            // 설명이 더 길거나 내용이 더 많은 기사 우선
            if ((article.description && article.description.length > (existingArticle.description?.length || 0)) || 
                (article.content && article.content.length > (existingArticle.content?.length || 0))) {
              uniqueNewsMap.set(key, article)
            }
          } else {
            uniqueNewsMap.set(key, article)
          }
        })
        
        // Map에서 값만 추출하여 배열로 변환
        const uniqueNews = Array.from(uniqueNewsMap.values())
        
        // 최신순 정렬 (날짜가 없는 경우 처리)
        uniqueNews.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0)
          const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0)
          return dateB - dateA
        })
        
        commit('SET_ALL_NEWS', uniqueNews)
        commit('SET_LAST_FETCH_TIME', { type: 'all', time: now })
      } catch (error) {
        commit('SET_ERROR', error)
        console.error('뉴스 불러오기 오류:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNewsByCategory({ commit, state }, category) {
      // 캐싱 로직
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      if (state.lastFetchTime.category[category] && 
          (now - state.lastFetchTime.category[category] < fiveMinutes) && 
          state.categoryNews.length > 0) {
        return
      }
      
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), API_TIMEOUT)
        })
        
        const responsePromise = api.getNewsByCategory(category)
        const response = await Promise.race([responsePromise, timeoutPromise])
        
        if (!response.data || !response.data.news || !Array.isArray(response.data.news)) {
          throw new Error('API 응답 형식이 올바르지 않습니다.')
        }
        
        // 중복 제거 및 데이터 정제 로직 (위와 유사)
        const uniqueNewsMap = new Map()
        response.data.news.forEach(article => {
          if (!article || !article.title || !article.id) return
          
          const key = article.title.trim().toLowerCase()
          
          if (uniqueNewsMap.has(key)) {
            const existingArticle = uniqueNewsMap.get(key)
            
            if (!existingArticle.imageUrl && article.imageUrl) {
              uniqueNewsMap.set(key, article)
            }
            
            if ((article.description && article.description.length > (existingArticle.description?.length || 0)) || 
                (article.content && article.content.length > (existingArticle.content?.length || 0))) {
              uniqueNewsMap.set(key, article)
            }
          } else {
            uniqueNewsMap.set(key, article)
          }
        })
        
        const uniqueNews = Array.from(uniqueNewsMap.values())
        
        uniqueNews.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0)
          const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0)
          return dateB - dateA
        })
        
        commit('SET_CATEGORY_NEWS', uniqueNews)
        commit('SET_LAST_FETCH_TIME', { type: 'category', id: category, time: now })
      } catch (error) {
        commit('SET_ERROR', error)
        console.error('카테고리별 뉴스 불러오기 오류:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNewsDetail({ commit, dispatch, state }, { category, id }) {
      // 캐싱 로직
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      const cacheKey = `${category}-${id}`
      
      if (state.lastFetchTime.detail[cacheKey] && 
          (now - state.lastFetchTime.detail[cacheKey] < fiveMinutes) && 
          state.currentArticle && state.currentArticle.id === id) {
        // 관련 기사만 다시 가져옴
        dispatch('fetchRelatedNews', { category, id })
        return
      }
      
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), API_TIMEOUT)
        })
        
        const responsePromise = api.getNewsDetail(category, id)
        const response = await Promise.race([responsePromise, timeoutPromise])
        
        if (!response.data || !response.data.article) {
          throw new Error('API 응답 형식이 올바르지 않습니다.')
        }
        
        // 데이터 정제
        const article = response.data.article
        
        // 필수 필드 확인 및 기본값 설정
        if (article) {
          if (!article.description) article.description = article.content?.slice(0, 150) || ''
          if (!article.publishedAt) article.publishedAt = new Date().toISOString()
        }
        
        commit('SET_CURRENT_ARTICLE', article)
        commit('SET_LAST_FETCH_TIME', { type: 'detail', id: cacheKey, time: now })
        
        // 기사 상세 정보를 가져온 후 관련 기사도 함께 가져옴
        dispatch('fetchRelatedNews', { category, id })
      } catch (error) {
        commit('SET_ERROR', error)
        console.error('뉴스 상세 정보 불러오기 오류:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchRelatedNews({ commit, state }, { category, id }) {
      commit('SET_LOADING_RELATED', true)
      
      try {
        // 1. 같은 카테고리의 기사 가져오기
        let sameCategory = []
        
        if (state.categoryNews.length > 0 && state.lastFetchTime.category[category]) {
          // 이미 카테고리 뉴스가 있으면 재사용
          sameCategory = state.categoryNews
        } else {
          try {
            const response = await api.getNewsByCategory(category)
            sameCategory = response.data.news || []
          } catch (error) {
            console.error('관련 기사(카테고리) 로딩 오류:', error)
            sameCategory = []
          }
        }
        
        // 2. 다른 카테고리의 기사도 가져오기 (모든 뉴스를 가져오거나, 특정 카테고리 추가)
        let allNews = []
        
        // 2-1. 전체 뉴스 데이터가 이미 있으면 활용, 없으면 가져오기
        if (state.allNews.length > 0 && state.lastFetchTime.all) {
          allNews = state.allNews
        } else {
          try {
            const allNewsResponse = await api.getAllNews()
            allNews = allNewsResponse.data.news || []
          } catch (error) {
            console.error('관련 기사(전체) 로딩 오류:', error)
            allNews = []
          }
        }
        
        // 3. 전체 뉴스 중에서 중복 제거 및 현재 기사 제외
        let combinedNews = [...sameCategory, ...allNews]
        
        // 중복 제거 (제목 기준)
        const uniqueNewsMap = new Map()
        combinedNews.forEach(article => {
          // 유효성 검사
          if (!article || !article.title || !article.id) return
          
          // 현재 기사는 제외
          if (article.id === id) {
            return
          }
          
          const key = article.title.trim().toLowerCase()
          if (!uniqueNewsMap.has(key)) {
            uniqueNewsMap.set(key, article)
          }
        })
        
        // Map에서 값만 추출하여 배열로 변환
        const filteredNews = Array.from(uniqueNewsMap.values())
        
        // 최신순 정렬
        filteredNews.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0)
          const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0)
          return dateB - dateA
        })
        
        // 기사 개수 제한 (10개)
        const relatedNews = filteredNews.slice(0, 10)
        
        commit('SET_RELATED_NEWS', relatedNews)
      } catch (error) {
        console.error('관련 기사 로딩 오류:', error)
        commit('SET_RELATED_NEWS', [])
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