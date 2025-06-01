<template>
  <div class="comment-form">
    <div class="form-header">
      <span class="user-info">{{ currentUser?.nickname || currentUser?.email }} 님으로 댓글 작성</span>
    </div>
    
    <div class="form-body">
      <textarea 
        v-model="commentText" 
        placeholder="댓글을 작성해주세요 (최대 300자)"
        maxlength="300"
        rows="3"
        @input="checkLength"
      ></textarea>
      
      <div class="form-footer">
        <span class="char-count" :class="{ 'char-count-limit': remainingChars <= 30 }">
          {{ remainingChars }}/300
        </span>
        <button 
          @click="submitComment" 
          :disabled="isSubmitting || !commentText.trim() || commentText.length > 300"
          class="submit-button"
        >
          {{ isSubmitting ? '등록 중...' : '댓글 등록' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { getCurrentUser } from '@/services/cognito';
import { addComment } from '@/services/commentService';

export default {
  name: 'CommentForm',
  props: {
    articleId: {
      type: String,
      required: true
    },
    parentId: {
      type: String,
      default: null
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },
  emits: ['comment-added', 'reply-added', 'cancel-reply'],
  setup(props, { emit }) {
    const commentText = ref('');
    const isSubmitting = ref(false);
    const currentUser = ref(null);
    
    // 남은 글자수 계산
    const remainingChars = computed(() => {
      return 300 - commentText.value.length;
    });
    
    // 글자수 체크
    const checkLength = () => {
      if (commentText.value.length > 300) {
        commentText.value = commentText.value.slice(0, 300);
      }
    };
    
    // 사용자 정보 로드
    const loadUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        currentUser.value = user;
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      }
    };
    
    // 댓글 제출
    const submitComment = async () => {
      if (!commentText.value.trim() || isSubmitting.value) return;
      
      isSubmitting.value = true;
      
      try {
        // 댓글 객체 생성
        const newComment = {
          content: commentText.value.trim(),
          userId: currentUser.value.username,
          userNickname: currentUser.value.nickname || currentUser.value.email,
          timestamp: new Date().toISOString(),
          parentId: props.parentId // 부모 댓글 ID (답글인 경우)
        };
        
        // 댓글 저장
        let articleKey;
        if (props.isReply) {
          // 답글인 경우 부모 댓글 ID를 활용
          articleKey = null;
        } else {
          // 일반 댓글인 경우 기사 ID 활용
          // articleId가 문자열로 전달된 경우 그대로 사용
          articleKey = props.articleId;
        }
        
        await addComment(articleKey, newComment);
        
        // 입력 필드 초기화
        commentText.value = '';
        
        // 이벤트 발생
        if (props.isReply) {
          emit('reply-added');
        } else {
          emit('comment-added');
        }
      } catch (error) {
        console.error('댓글 등록 오류:', error);
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // 답글 작성 취소
    const cancelReply = () => {
      emit('cancel-reply');
    };
    
    // 컴포넌트 마운트 시 사용자 정보 로드
    loadUserInfo();
    
    return {
      commentText,
      isSubmitting,
      currentUser,
      remainingChars,
      checkLength,
      submitComment,
      cancelReply
    };
  }
}
</script>

<style scoped>
.comment-form {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.form-header {
  margin-bottom: 10px;
}

.user-info {
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;
}

.form-body textarea {
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--secondary-color);
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.form-body textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.char-count-limit {
  color: #ff6b6b;
}

.submit-button {
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style> 