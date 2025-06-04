<template>
  <div class="profile-container">
    <h1 class="page-title">내 정보</h1>
    
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>정보를 불러오는 중...</p>
    </div>
    
    <div v-else-if="!userInfo" class="not-logged-in">
      <p>로그인이 필요합니다.</p>
      <router-link to="/login" class="primary-button">로그인 페이지로 이동</router-link>
    </div>
    
    <div v-else class="profile-content">
      <!-- 사용자 정보 섹션 -->
      <div class="profile-section">
        <h2>사용자 정보</h2>
        <div class="profile-info">
          <div class="info-item">
            <span class="label">이메일:</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">닉네임:</span>
            <span class="value">{{ userInfo.nickname || '설정된 닉네임이 없습니다' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 닉네임 변경 섹션 -->
      <div class="profile-section">
        <h2>닉네임 변경</h2>
        <div class="edit-form">
          <div class="form-group">
            <label for="nickname">새 닉네임</label>
            <input 
              type="text" 
              id="nickname" 
              v-model="nickname" 
              placeholder="변경할 닉네임을 입력하세요"
            />
          </div>
          <button 
            @click="updateNickname" 
            :disabled="nicknameLoading" 
            class="update-button"
          >
            {{ nicknameLoading ? '변경 중...' : '닉네임 변경' }}
          </button>
          <div v-if="nicknameSuccess" class="success-message">
            닉네임이 성공적으로 변경되었습니다.
          </div>
          <div v-if="nicknameError" class="error-message">
            {{ nicknameError }}
          </div>
        </div>
      </div>
      
      <!-- 비밀번호 변경 섹션 -->
      <div class="profile-section">
        <h2>비밀번호 변경</h2>
        <div class="edit-form">
          <div class="form-group">
            <label for="currentPassword">현재 비밀번호</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="currentPassword" 
              placeholder="현재 비밀번호"
            />
          </div>
          <div class="form-group">
            <label for="newPassword">새 비밀번호</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="newPassword" 
              placeholder="새 비밀번호"
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">새 비밀번호 확인</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="새 비밀번호 확인"
            />
          </div>
          <button 
            @click="updatePassword" 
            :disabled="passwordLoading" 
            class="update-button"
          >
            {{ passwordLoading ? '변경 중...' : '비밀번호 변경' }}
          </button>
          <div v-if="passwordSuccess" class="success-message">
            비밀번호가 성공적으로 변경되었습니다.
          </div>
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
        </div>
      </div>
      
      <!-- 회원탈퇴 섹션 -->
      <div class="profile-section danger-section">
        <h2>회원탈퇴</h2>
        <div class="edit-form">
          <p class="warning-text">
            회원탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
            정말로 탈퇴하시겠습니까?
          </p>
          <button 
            @click="showDeleteConfirm = true" 
            class="delete-button"
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
    
    <!-- 회원탈퇴 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <h3>회원탈퇴 확인</h3>
        <p>정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-buttons">
          <button @click="showDeleteConfirm = false" class="cancel-button">취소</button>
          <button @click="confirmDeleteUser" :disabled="deleteLoading" class="confirm-delete-button">
            {{ deleteLoading ? '처리 중...' : '회원탈퇴' }}
          </button>
        </div>
        <div v-if="deleteError" class="error-message">
          {{ deleteError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getCurrentUser, updateUserAttributes, changePassword, deleteUser, signOut } from '@/services/cognito'
import userStore from '@/store/user'
import { useRouter } from 'vue-router'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    
    // 사용자 정보 상태
    const userInfo = ref(null)
    const isLoading = ref(true)
    
    // 닉네임 변경 상태
    const nickname = ref('')
    const nicknameLoading = ref(false)
    const nicknameSuccess = ref(false)
    const nicknameError = ref('')
    
    // 비밀번호 변경 상태
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const passwordLoading = ref(false)
    const passwordSuccess = ref(false)
    const passwordError = ref('')
    
    // 회원탈퇴 관련 상태
    const showDeleteConfirm = ref(false)
    const deleteLoading = ref(false)
    const deleteError = ref('')
    
    // 사용자 정보 로드
    const loadUserInfo = async () => {
      isLoading.value = true
      try {
        const user = await getCurrentUser()
        userInfo.value = user
        if (user?.nickname) {
          nickname.value = user.nickname
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // 닉네임 업데이트
    const updateNickname = async () => {
      if (!nickname.value.trim()) {
        nicknameError.value = '닉네임을 입력해주세요.'
        return
      }
      
      nicknameLoading.value = true
      nicknameSuccess.value = false
      nicknameError.value = ''
      
      try {
        await updateUserAttributes(nickname.value)
        nicknameSuccess.value = true
        
        // 사용자 정보 다시 로드
        await loadUserInfo()
        
        // 전역 사용자 상태 업데이트
        userStore.loadUserInfo()
      } catch (error) {
        console.error('닉네임 변경 오류:', error)
        nicknameError.value = error.message || '닉네임 변경 중 오류가 발생했습니다.'
      } finally {
        nicknameLoading.value = false
      }
    }
    
    // 비밀번호 업데이트
    const updatePassword = async () => {
      // 입력 검증
      if (!currentPassword.value) {
        passwordError.value = '현재 비밀번호를 입력해주세요.'
        return
      }
      
      if (!newPassword.value) {
        passwordError.value = '새 비밀번호를 입력해주세요.'
        return
      }
      
      if (newPassword.value !== confirmPassword.value) {
        passwordError.value = '새 비밀번호가 일치하지 않습니다.'
        return
      }
      
      // AWS Cognito 비밀번호 규칙: 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자 포함
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      if (!passwordRegex.test(newPassword.value)) {
        passwordError.value = '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'
        return
      }
      
      passwordLoading.value = true
      passwordSuccess.value = false
      passwordError.value = ''
      
      try {
        await changePassword(currentPassword.value, newPassword.value)
        passwordSuccess.value = true
        
        // 입력 필드 초기화
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
      } catch (error) {
        console.error('비밀번호 변경 오류:', error)
        passwordError.value = error.message || '비밀번호 변경 중 오류가 발생했습니다.'
      } finally {
        passwordLoading.value = false
      }
    }
    
    // 회원탈퇴 함수
    const confirmDeleteUser = async () => {
      deleteLoading.value = true
      deleteError.value = ''
      
      try {
        await deleteUser()
        
        // 로그아웃 처리
        signOut()
        
        // 전역 사용자 상태 초기화
        userStore.clearUserState()
        
        // 모달 닫기
        showDeleteConfirm.value = false
        
        // 홈페이지로 리다이렉트
        router.push('/')
      } catch (error) {
        console.error('회원탈퇴 오류:', error)
        deleteError.value = error.message || '회원탈퇴 중 오류가 발생했습니다.'
      } finally {
        deleteLoading.value = false
      }
    }
    
    // 컴포넌트 마운트 시 사용자 정보 로드
    onMounted(() => {
      loadUserInfo()
    })
    
    return {
      userInfo,
      isLoading,
      nickname,
      nicknameLoading,
      nicknameSuccess,
      nicknameError,
      currentPassword,
      newPassword,
      confirmPassword,
      passwordLoading,
      passwordSuccess,
      passwordError,
      showDeleteConfirm,
      deleteLoading,
      deleteError,
      updateNickname,
      updatePassword,
      confirmDeleteUser
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 20px;
}

.page-title {
  margin-bottom: 30px;
  color: var(--secondary-color);
  text-align: center;
}

.not-logged-in {
  text-align: center;
  padding: 40px 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.profile-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--secondary-color);
  font-size: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  min-width: 100px;
}

.value {
  color: var(--secondary-color);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

input {
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--secondary-color);
}

.update-button {
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.update-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.update-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  padding: 10px;
  background-color: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  color: #81c784;
  border-radius: 4px;
}

.error-message {
  padding: 10px;
  background-color: rgba(211, 47, 47, 0.2);
  border: 1px solid rgba(211, 47, 47, 0.4);
  color: #ff6b6b;
  border-radius: 4px;
}

.danger-section {
  border-left: 4px solid #ff5252;
}

.warning-text {
  color: #ff6b6b;
  margin-bottom: 20px;
}

.delete-button {
  padding: 12px;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: #ff3636;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
  color: var(--secondary-color);
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button {
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.confirm-delete-button {
  padding: 10px 20px;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.confirm-delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .profile-container {
    margin: 20px auto;
  }
  
  .profile-section {
    padding: 15px;
  }
}
</style> 