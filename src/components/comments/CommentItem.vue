<template>
  <div class="comment-item" :class="{ 'reply-item': comment.parentId }">
    <div class="comment-header">
      <div class="user-info">
        <span class="username">{{ comment.userNickname }}</span>
        <span class="comment-time">{{ formatTimeAgo(comment.timestamp) }}</span>
      </div>
      
      <div class="comment-actions" v-if="isLoggedIn && isCommentOwner">
        <button class="delete-button" @click="confirmDelete" :disabled="isDeleting">
          {{ isDeleting ? '삭제 중...' : '삭제' }}
        </button>
      </div>
    </div>
    
    <div class="comment-content">
      {{ comment.content }}
    </div>
    
    <div class="comment-footer">
      <button 
        v-if="isLoggedIn && !isReplyFormVisible" 
        class="reply-button" 
        @click="toggleReplyForm"
      >
        답글 달기
      </button>
      
      <div v-if="isReplyFormVisible" class="reply-form-container">
        <CommentForm 
          :article-id="comment.id"
          :parent-id="comment.id"
          :is-reply="true"
          @reply-added="handleReplyAdded"
          @cancel-reply="toggleReplyForm"
        />
        <button class="cancel-button" @click="toggleReplyForm">취소</button>
      </div>
    </div>
    
    <!-- 알림 메시지 -->
    <div v-if="resultMessage" class="result-message" :class="{ 'error': isError }">
      {{ resultMessage }}
    </div>
    
    <!-- 답글 목록 -->
    <div v-if="replies && replies.length > 0" class="replies-container">
      <div v-if="!showReplies" class="show-replies-button" @click="toggleReplies">
        답글 {{ replies.length }}개 보기
      </div>
      
      <div v-else class="replies-list">
        <div class="hide-replies-button" @click="toggleReplies">
          답글 숨기기
        </div>
        
        <div class="reply-items">
          <CommentItem
            v-for="reply in replies"
            :key="reply.id"
            :comment="reply"
            :is-logged-in="isLoggedIn"
            :current-user="currentUser"
            :replies="[]"
            @comment-deleted="$emit('comment-deleted')"
            @reply-added="$emit('reply-added')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { deleteComment } from '@/services/commentService';
import CommentForm from './CommentForm.vue';

export default {
  name: 'CommentItem',
  components: {
    CommentForm
  },
  props: {
    comment: {
      type: Object,
      required: true
    },
    replies: {
      type: Array,
      default: () => []
    },
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    currentUser: {
      type: Object,
      default: null
    }
  },
  emits: ['comment-deleted', 'reply-added'],
  setup(props, { emit }) {
    const isReplyFormVisible = ref(false);
    const showReplies = ref(props.replies && props.replies.length > 0);
    const isDeleting = ref(false);
    const resultMessage = ref('');
    const isError = ref(false);
    
    // 현재 사용자가 댓글 작성자인지 확인
    const isCommentOwner = computed(() => {
      if (!props.currentUser) return false;
      return props.currentUser.username === props.comment.userId;
    });
    
    // 답글 폼 표시 토글
    const toggleReplyForm = () => {
      isReplyFormVisible.value = !isReplyFormVisible.value;
    };
    
    // 답글 표시 토글
    const toggleReplies = () => {
      showReplies.value = !showReplies.value;
    };
    
    // 메시지 표시 함수
    const showMessage = (message, error = false) => {
      resultMessage.value = message;
      isError.value = error;
      
      // 3초 후 메시지 사라짐
      setTimeout(() => {
        resultMessage.value = '';
      }, 3000);
    };
    
    // 댓글 삭제
    const confirmDelete = async () => {
      if (confirm('정말 이 댓글을 삭제하시겠습니까?')) {
        try {
          isDeleting.value = true;
          await deleteComment(props.comment.id);
          showMessage('댓글이 삭제되었습니다.');
          emit('comment-deleted');
        } catch (error) {
          console.error('댓글 삭제 오류:', error);
          showMessage('댓글 삭제 중 오류가 발생했습니다.', true);
        } finally {
          isDeleting.value = false;
        }
      }
    };
    
    // 답글 추가 후 처리
    const handleReplyAdded = () => {
      isReplyFormVisible.value = false;
      showReplies.value = true;
      emit('reply-added');
    };
    
    // 상대적 시간 포맷팅 (예: "5분 전")
    const formatTimeAgo = (timestamp) => {
      const now = new Date();
      const commentTime = new Date(timestamp);
      const diffMs = now - commentTime;
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) return '방금 전';
      
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}분 전`;
      
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}시간 전`;
      
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay}일 전`;
      
      // 날짜 포맷 (예: 2023.05.21)
      const year = commentTime.getFullYear();
      const month = String(commentTime.getMonth() + 1).padStart(2, '0');
      const day = String(commentTime.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    };
    
    return {
      isReplyFormVisible,
      showReplies,
      isCommentOwner,
      isDeleting,
      resultMessage,
      isError,
      toggleReplyForm,
      toggleReplies,
      confirmDelete,
      handleReplyAdded,
      formatTimeAgo
    };
  }
}
</script>

<style scoped>
.comment-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s;
}

.reply-item {
  background-color: rgba(255, 255, 255, 0.02);
  border-left: 3px solid var(--accent-color);
  margin-left: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 500;
  color: var(--secondary-color);
}

.comment-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.delete-button {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.delete-button:hover:not(:disabled) {
  text-decoration: underline;
}

.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-content {
  color: var(--secondary-color);
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.reply-button {
  background: none;
  border: none;
  color: var(--accent-color);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.reply-button:hover {
  text-decoration: underline;
}

.reply-form-container {
  margin-top: 10px;
  width: 100%;
}

.cancel-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
  padding: 0;
}

.cancel-button:hover {
  text-decoration: underline;
}

.replies-container {
  margin-top: 10px;
}

.show-replies-button, .hide-replies-button {
  color: var(--accent-color);
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 10px;
}

.show-replies-button:hover, .hide-replies-button:hover {
  text-decoration: underline;
}

.replies-list {
  margin-top: 10px;
}

.reply-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 결과 메시지 스타일 */
.result-message {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
  font-size: 12px;
  text-align: center;
}

.result-message.error {
  background-color: rgba(245, 101, 101, 0.2);
  color: #f56565;
}
</style> 