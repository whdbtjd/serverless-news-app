<template>
  <div class="login-container">
    <div class="login-form">
      <h2>로그인</h2>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div class="form-group">
        <label for="email">이메일</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="이메일 주소" 
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="비밀번호" 
          :disabled="loading"
        />
      </div>
      
      <button 
        @click="handleLogin" 
        :disabled="!isFormValid || loading" 
        class="login-button"
      >
        {{ loading ? '로그인 중...' : '로그인' }}
      </button>
      
      <div class="signup-link">
        계정이 없으신가요? <a @click="goToSignUp">회원가입</a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from '@/services/cognito'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    
    // 상태 변수들
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const loading = ref(false)
    
    // 폼 유효성 검사
    const isFormValid = computed(() => email.value && password.value)
    
    // 로그인 처리
    const handleLogin = async () => {
      if (!isFormValid.value) return
      
      errorMessage.value = ''
      loading.value = true
      
      try {
        await signIn(email.value, password.value)
        // 로그인 성공 후 홈 페이지로 이동
        router.push('/')
      } catch (error) {
        console.error('로그인 오류:', error)
        
        if (error.code === 'UserNotFoundException') {
          errorMessage.value = '해당 이메일로 등록된 계정이 없습니다.'
        } else if (error.code === 'NotAuthorizedException') {
          errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (error.code === 'UserNotConfirmedException') {
          errorMessage.value = '계정이 아직 활성화되지 않았습니다. 이메일을 확인해주세요.'
        } else {
          errorMessage.value = error.message || '로그인 중 오류가 발생했습니다.'
        }
      } finally {
        loading.value = false
      }
    }
    
    // 회원가입 페이지로 이동
    const goToSignUp = () => {
      router.push('/signup')
    }
    
    return {
      email,
      password,
      errorMessage,
      loading,
      isFormValid,
      handleLogin,
      goToSignUp
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.login-form {
  max-width: 450px;
  width: 100%;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  text-align: center;
  color: var(--secondary-color);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: var(--secondary-color);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-size: 16px;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(51, 102, 204, 0.2);
}

.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  background-color: #2a57b8;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.signup-link a {
  color: var(--accent-color);
  text-decoration: none;
  cursor: pointer;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style> 