import axios from 'axios'

// API 요청 재시도 설정
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000, // 타임아웃 시간 증가
  headers: {
    'Content-Type': 'application/json',
  }
})

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  config => {
    // 요청 전에 수행할 작업
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 추가
apiClient.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config
    
    // 재시도 횟수 초기화
    if (originalRequest && !originalRequest._retry) {
      originalRequest._retry = 0
    }
    
    // 네트워크 오류나 타임아웃, 서버 오류(500)인 경우 재시도
    if (
      originalRequest &&
      originalRequest._retry < MAX_RETRIES &&
      (error.code === 'ECONNABORTED' ||
       error.code === 'ERR_NETWORK' ||
       (error.response && error.response.status >= 500))
    ) {
      originalRequest._retry++
      
      // 재시도 전 지연 시간 설정 (지수 백오프)
      const delay = RETRY_DELAY * Math.pow(2, originalRequest._retry - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // 요청 재시도
      return apiClient(originalRequest)
    }
    
    return Promise.reject(error)
  }
)

export default {
  // 전체 뉴스 목록
  getAllNews() {
    return apiClient.get('/news/lists')
  },
  
  // 카테고리별 뉴스 목록
  getNewsByCategory(category) {
    return apiClient.get(`/news/${category}/lists`)
  },
  
  // 뉴스 상세 정보
  getNewsDetail(category, id) {
    return apiClient.get(`/news/${category}/${id}`)
  }
}