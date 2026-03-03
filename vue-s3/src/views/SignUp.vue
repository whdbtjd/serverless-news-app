<template>
  <div class="signup-container">
    <div class="signup-form">
      <h2>회원가입</h2>
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
          placeholder="이메일 주소" 
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="nickname">닉네임</label>
        <input 
          type="text" 
          id="nickname" 
          v-model="nickname" 
          placeholder="닉네임" 
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="비밀번호 (8자 이상)" 
          :disabled="loading"
        />
        <div class="password-requirements">
          <div :class="{ 'requirement-met': passwordLength }">• 8자 이상</div>
          <div :class="{ 'requirement-met': passwordUppercase }">• 대문자 포함</div>
          <div :class="{ 'requirement-met': passwordNumber }">• 숫자 포함</div>
          <div :class="{ 'requirement-met': passwordSpecial }">• 특수 문자 포함</div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">비밀번호 확인</label>
        <input 
          type="password" 
          id="confirmPassword" 
          v-model="confirmPassword" 
          placeholder="비밀번호 확인" 
          :disabled="loading"
        />
        <div v-if="passwordMismatch" class="password-mismatch">
          비밀번호가 일치하지 않습니다.
        </div>
      </div>
      
      <button 
        @click="handleSignUp" 
        :disabled="!isFormValid || loading" 
        class="signup-button"
      >
        {{ loading ? '처리 중...' : '회원가입' }}
      </button>
      
      <div class="login-link">
        이미 계정이 있으신가요? <a @click="goToLogin">로그인</a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '@/services/cognito'

export default {
  name: 'SignUp',
  setup() {
    const router = useRouter()
    
    // 상태 변수들
    const email = ref('')
    const nickname = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const errorMessage = ref('')
    const successMessage = ref('')
    const loading = ref(false)
    
    // 비밀번호 유효성 검사
    const passwordLength = computed(() => password.value.length >= 8)
    const passwordUppercase = computed(() => /[A-Z]/.test(password.value))
    const passwordNumber = computed(() => /[0-9]/.test(password.value))
    const passwordSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(password.value))
    const passwordMismatch = computed(() => 
      confirmPassword.value && password.value !== confirmPassword.value
    )
    
    // 폼 유효성 검사
    const isFormValid = computed(() => 
      email.value && 
      password.value && 
      confirmPassword.value &&
      password.value === confirmPassword.value &&
      passwordLength.value &&
      passwordUppercase.value &&
      passwordNumber.value &&
      passwordSpecial.value
    )
    
    // 회원가입 처리
    const handleSignUp = async () => {
      if (!isFormValid.value) return
      
      errorMessage.value = ''
      successMessage.value = ''
      loading.value = true
      
      try {
        await signUp(email.value, password.value, nickname.value)
        successMessage.value = '회원가입이 완료되었습니다. 이메일로 전송된 인증 코드를 입력해주세요.'
        
        // 3초 후 이메일 인증 페이지로 이동
        setTimeout(() => {
          router.push({
            path: '/confirm',
            query: { email: email.value }
          })
        }, 3000)
      } catch (error) {
        console.error('회원가입 오류:', error)
        
        if (error.code === 'UsernameExistsException') {
          errorMessage.value = '이미 사용 중인 이메일입니다.'
        } else if (error.code === 'InvalidPasswordException') {
          errorMessage.value = '비밀번호가 정책을 충족하지 않습니다.'
        } else {
          errorMessage.value = error.message || '회원가입 중 오류가 발생했습니다.'
        }
      } finally {
        loading.value = false
      }
    }
    
    // 로그인 페이지로 이동
    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      email,
      nickname,
      password,
      confirmPassword,
      errorMessage,
      successMessage,
      loading,
      passwordLength,
      passwordUppercase,
      passwordNumber,
      passwordSpecial,
      passwordMismatch,
      isFormValid,
      handleSignUp,
      goToLogin
    }
  }
}
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.signup-form {
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

.password-requirements {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.requirement-met {
  color: #4CAF50;
}

.password-mismatch {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
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

.signup-button {
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

.signup-button:hover:not(:disabled) {
  background-color: #2a57b8;
  transform: translateY(-1px);
}

.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.login-link a {
  color: var(--accent-color);
  text-decoration: none;
  cursor: pointer;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 