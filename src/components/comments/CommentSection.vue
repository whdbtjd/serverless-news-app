<template>
  <div class="comments-section">
    <h3 class="comments-title">댓글 {{ comments.length > 0 ? `(${comments.length})` : '' }}</h3>
    
    <!-- 댓글 작성 폼 -->
    <CommentForm 
      v-if="isLoggedIn"
      :article-id="articleId"
      @comment-added="loadComments"
    />
    <div v-else class="login-prompt">
      <p>댓글을 작성하려면 <router-link to="/login" class="login-link">로그인</router-link>이 필요합니다.</p>
    </div>
    
    <!-- 댓글 목록 -->
    <CommentList 
      :comments="comments" 
      :is-logged-in="isLoggedIn"
      :current-user="currentUser"
      @comment-deleted="loadComments"
      @reply-added="loadComments"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { getCurrentUser } from '@/services/cognito';
import { getComments } from '@/services/commentService';
import CommentForm from './CommentForm.vue';
import CommentList from './CommentList.vue';

export default {
  name: 'CommentSection',
  components: {
    CommentForm,
    CommentList
  },
  props: {
    articleId: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const comments = ref([]);
    const isLoggedIn = ref(false);
    const currentUser = ref(null);
    
    // 댓글 불러오기
    const loadComments = () => {
      try {
        const articleKey = props.articleId;
        console.log('댓글 로드 시도:', {
          category: props.category,
          articleId: props.articleId,
          articleKey
        });

        if (!articleKey) {
          console.error('articleKey가 유효하지 않습니다:', {
            category: props.category,
            articleId: props.articleId
          });
          comments.value = [];
          return;
        }

        comments.value = getComments(articleKey);
        console.log(`댓글 로드 완료: ${articleKey}, 댓글 수: ${comments.value.length}`);
      } catch (error) {
        console.error('댓글 로드 오류:', error);
        comments.value = [];
      }
    };
    
    // 사용자 정보 불러오기
    const loadUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        isLoggedIn.value = !!user;
        currentUser.value = user;
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        isLoggedIn.value = false;
        currentUser.value = null;
      }
    };
    
    // 컴포넌트 마운트 시 초기화
    onMounted(() => {
      loadUserInfo();
      loadComments();
    });
    
    // articleId가 변경되면 댓글 다시 불러오기
    watch(() => props.articleId, () => {
      loadComments();
    });
    
    return {
      comments,
      isLoggedIn,
      currentUser,
      loadComments
    };
  }
}
</script>

<style scoped>
.comments-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-title {
  margin-bottom: 20px;
  font-size: 20px;
  color: var(--secondary-color);
}

.login-prompt {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.login-link {
  color: var(--accent-color);
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style> 