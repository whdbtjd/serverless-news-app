<template>
  <div class="confirm-container">
    <div class="confirm-form">
      <h2>이메일 인증</h2>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <div class="form-group">
        <label for="email">이메일</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="가입한 이메일 주소" 
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="code">인증 코드</label>
        <input 
          type="text" 
          id="code" 
          v-model="code" 
          placeholder="이메일로 받은 인증 코드" 
          :disabled="loading"
        />
      </div>
      
      <button 
        @click="handleConfirm" 
        :disabled="!isFormValid || loading" 
        class="confirm-button"
      >
        {{ loading ? '처리 중...' : '인증 확인' }}
      </button>
      
      <div class="links">
        <div class="login-link">
          이미 인증을 완료하셨나요? <a @click="goToLogin">로그인</a>
        </div>
        <div class="signup-link">
          계정이 없으신가요? <a @click="goToSignUp">회원가입</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { confirmSignUp } from '@/services/cognito'

export default {
  name: 'ConfirmSignUp',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // URL 쿼리에서 이메일 가져오기
    const email = ref(route.query.email || '')
    
    // 상태 변수
    const code = ref('')
    const errorMessage = ref('')
    const successMessage = ref('')
    const loading = ref(false)
    
    // 폼 유효성 검사
    const isFormValid = computed(() => 
      email.value && 
      code.value
    )
    
    // 인증 처리
    const handleConfirm = async () => {
      if (!isFormValid.value) return
      
      errorMessage.value = ''
      successMessage.value = ''
      loading.value = true
      
      try {
        await confirmSignUp(email.value, code.value)
        successMessage.value = '이메일 인증이 완료되었습니다. 로그인 페이지로 이동합니다.'
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error) {
        console.error('인증 오류:', error)
        
        if (error.code === 'CodeMismatchException') {
          errorMessage.value = '인증 코드가 일치하지 않습니다.'
        } else if (error.code === 'ExpiredCodeException') {
          errorMessage.value = '인증 코드가 만료되었습니다. 새 코드를 요청하세요.'
        } else if (error.code === 'UserNotFoundException') {
          errorMessage.value = '해당 이메일로 등록된 계정이 없습니다.'
        } else {
          errorMessage.value = error.message || '인증 중 오류가 발생했습니다.'
        }
      } finally {
        loading.value = false
      }
    }
    
    // 로그인 페이지로 이동
    const goToLogin = () => {
      router.push('/login')
    }
    
    // 회원가입 페이지로 이동
    const goToSignUp = () => {
      router.push('/signup')
    }
    
    return {
      email,
      code,
      errorMessage,
      successMessage,
      loading,
      isFormValid,
      handleConfirm,
      goToLogin,
      goToSignUp
    }
  }
}
</script>

<style scoped>
.confirm-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.confirm-form {
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

.success-message {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4CAF50;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.confirm-button {
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

.confirm-button:hover:not(:disabled) {
  background-color: #2a57b8;
  transform: translateY(-1px);
}

.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  margin-top: 20px;
}

.login-link, .signup-link {
  text-align: center;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.login-link a, .signup-link a {
  color: var(--accent-color);
  text-decoration: none;
  cursor: pointer;
}

.login-link a:hover, .signup-link a:hover {
  text-decoration: underline;
}
</style> 