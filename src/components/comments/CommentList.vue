<template>
  <div class="comments-list">
    <div v-if="comments.length === 0" class="no-comments">
      <p v-if="isLoggedIn">첫 번째 댓글을 작성해보세요!</p>
      <p v-else>아직 작성된 댓글이 없습니다. 댓글을 작성하려면 로그인해주세요.</p>
    </div>
    
    <div v-else class="comments-container">
      <CommentItem
        v-for="comment in mainComments"
        :key="comment.id"
        :comment="comment"
        :replies="getRepliesFor(comment.id)"
        :is-logged-in="isLoggedIn"
        :current-user="currentUser"
        @comment-deleted="$emit('comment-deleted')"
        @reply-added="$emit('reply-added')"
        @comment-updated="$emit('comment-updated')"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import CommentItem from './CommentItem.vue';

export default {
  name: 'CommentList',
  components: {
    CommentItem
  },
  props: {
    comments: {
      type: Array,
      required: true
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
  emits: ['comment-deleted', 'reply-added', 'comment-updated'],
  setup(props) {
    // 최상위 댓글만 필터링 (부모 댓글이 없는 것들)
    const mainComments = computed(() => {
      // 부모 댓글이 없는 댓글만 필터링하고 최신순으로 정렬
      return props.comments
        .filter(comment => !comment.parentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });
    
    // 특정 댓글의 답글 가져오기
    const getRepliesFor = (commentId) => {
      // 특정 부모 댓글에 속한 답글만 필터링하고 최신순으로 정렬
      return props.comments
        .filter(comment => comment.parentId === commentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };
    
    return {
      mainComments,
      getRepliesFor
    };
  }
}
</script>

<style scoped>
.comments-list {
  margin-top: 10px;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.comments-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style> 