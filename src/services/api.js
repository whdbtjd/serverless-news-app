import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

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