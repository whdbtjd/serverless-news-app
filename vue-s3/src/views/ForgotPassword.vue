<template>
  <div class="container">
    <div class="auth-form">
      <h2>비밀번호 찾기</h2>
      
      <!-- 1단계: 이메일 입력 -->
      <div v-if="step === 1">
        <p>가입하신 이메일 주소를 입력하시면 비밀번호 재설정 코드를 보내드립니다.</p>
        
        <div class="form-group">
          <label for="email">이메일</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="이메일 주소를 입력하세요" 
            required
          />
        </div>
        
        <div class="form-actions">
          <button @click="requestResetCode" :disabled="isLoading" class="primary-button">
            {{ isLoading ? '처리 중...' : '코드 요청하기' }}
          </button>
          <router-link to="/login" class="secondary-link">로그인으로 돌아가기</router-link>
        </div>
      </div>
      
      <!-- 2단계: 코드 확인 및 새 비밀번호 설정 -->
      <div v-if="step === 2">
        <p>입력하신 이메일로 전송된 코드를 확인하고 새 비밀번호를 설정해주세요.</p>
        
        <div class="form-group">
          <label for="code">인증 코드</label>
          <input 
            type="text" 
            id="code" 
            v-model="verificationCode" 
            placeholder="인증 코드를 입력하세요" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="newPassword">새 비밀번호</label>
          <input 
            type="password" 
            id="newPassword" 
            v-model="newPassword" 
            placeholder="새 비밀번호를 입력하세요" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="비밀번호를 다시 입력하세요" 
            required
          />
        </div>
        
        <div class="form-actions">
          <button @click="resetPassword" :disabled="isLoading" class="primary-button">
            {{ isLoading ? '처리 중...' : '비밀번호 재설정' }}
          </button>
          <button @click="step = 1" class="secondary-button">
            이메일 다시 입력하기
          </button>
        </div>
      </div>
      
      <!-- 3단계: 완료 -->
      <div v-if="step === 3">
        <div class="success-message">
          <h3>비밀번호 재설정 완료</h3>
          <p>비밀번호가 성공적으로 재설정되었습니다.</p>
          <router-link to="/login" class="primary-button">로그인하기</router-link>
        </div>
      </div>
      
      <!-- 오류 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword, confirmNewPassword } from '@/services/cognito'

export default {
  name: 'ForgotPassword',
  setup() {
    const router = useRouter()
    
    // 상태 변수
    const step = ref(1)
    const email = ref('')
    const verificationCode = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const isLoading = ref(false)
    const errorMessage = ref('')
    
    // 코드 요청 함수
    const requestResetCode = async () => {
      if (!email.value.trim()) {
        errorMessage.value = '이메일을 입력해주세요.'
        return
      }
      
      errorMessage.value = ''
      isLoading.value = true
      
      try {
        await forgotPassword(email.value)
        step.value = 2
      } catch (error) {
        errorMessage.value = error.message || '비밀번호 재설정 코드 요청 중 오류가 발생했습니다.'
        console.error('비밀번호 재설정 코드 요청 오류:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // 비밀번호 재설정 함수
    const resetPassword = async () => {
      if (!verificationCode.value.trim()) {
        errorMessage.value = '인증 코드를 입력해주세요.'
        return
      }
      
      if (!newPassword.value.trim()) {
        errorMessage.value = '새 비밀번호를 입력해주세요.'
        return
      }
      
      if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = '비밀번호가 일치하지 않습니다.'
        return
      }
      
      // AWS Cognito 비밀번호 규칙: 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자 포함
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      if (!passwordRegex.test(newPassword.value)) {
        errorMessage.value = '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'
        return
      }
      
      errorMessage.value = ''
      isLoading.value = true
      
      try {
        await confirmNewPassword(email.value, verificationCode.value, newPassword.value)
        step.value = 3
      } catch (error) {
        errorMessage.value = error.message || '비밀번호 재설정 중 오류가 발생했습니다.'
        console.error('비밀번호 재설정 오류:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      step,
      email,
      verificationCode,
      newPassword,
      confirmPassword,
      isLoading,
      errorMessage,
      requestResetCode,
      resetPassword
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 40px auto;
  padding: 0 20px;
}

.auth-form {
  background-color: rgb(27, 36, 61);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: white;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

button, .primary-button {
  padding: 12px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.2s;
}

.primary-button {
  background-color: var(--accent-color);
  color: white;
}

.secondary-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.secondary-link {
  text-align: center;
  color: var(--accent-color);
  text-decoration: none;
}

button:hover, .primary-button:hover, .secondary-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: rgba(211, 47, 47, 0.2);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 4px;
  margin-top: 20px;
  border: 1px solid rgba(211, 47, 47, 0.4);
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-message h3 {
  color: #4caf50;
  margin-bottom: 10px;
}
</style> 