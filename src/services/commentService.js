/**
 * 댓글 서비스
 * 로컬 스토리지를 사용하여 댓글 데이터를 관리합니다.
 */

// 상수 정의
const COMMENTS_STORAGE_KEY_PREFIX = 'news_comments_';
const MAX_COMMENT_LENGTH = 300;
const MAX_REPLIES_PER_COMMENT = 50;
const COMMENT_ID_PREFIX = 'comment_';

/**
 * 댓글 관련 유효성 검사 유틸리티
 */
const CommentValidator = {
  /**
   * 댓글 내용 유효성 검사
   * @param {string} content - 댓글 내용
   * @returns {boolean} - 유효성 여부
   */
  isValidContent(content) {
    return content && content.trim().length > 0 && content.length <= MAX_COMMENT_LENGTH;
  },

  /**
   * 답글 수 제한 확인
   * @param {Array} comments - 댓글 목록
   * @param {string} parentId - 부모 댓글 ID
   * @returns {boolean} - 답글 추가 가능 여부
   */
  canAddReply(comments, parentId) {
    const repliesCount = comments.filter(comment => comment.parentId === parentId).length;
    return repliesCount < MAX_REPLIES_PER_COMMENT;
  }
};

/**
 * 스토리지 키 생성
 * @param {string} articleKey - 기사 고유 키
 * @returns {string} - 완성된 스토리지 키
 */
const getStorageKey = (articleKey) => {
  return `${COMMENTS_STORAGE_KEY_PREFIX}${articleKey}`;
};

/**
 * 댓글 목록 가져오기
 * @param {string} articleKey - 기사 고유 키
 * @returns {Array} - 댓글 목록
 */
export const getComments = (articleKey) => {
  try {
    const storageKey = getStorageKey(articleKey);
    console.log('댓글 로드 시도 (스토리지 키):', storageKey);
    
    const commentsJson = localStorage.getItem(storageKey);
    
    if (!commentsJson) {
      return [];
    }
    
    return JSON.parse(commentsJson);
  } catch (error) {
    console.error('댓글 로드 오류:', error);
    return [];
  }
};

/**
 * 댓글 추가
 * @param {string} articleKey - 기사 고유 키
 * @param {Object} comment - 댓글 객체
 * @returns {Promise} - 작업 결과 Promise
 */
export const addComment = (articleKey, comment) => {
  return new Promise((resolve, reject) => {
    try {
      const storageKey = getStorageKey(articleKey);
      console.log('댓글 저장 시도:', {
        articleKey,
        storageKey,
        comment
      });

      if (!articleKey) {
        throw new Error('기사 키가 없습니다.');
      }

      if (!CommentValidator.isValidContent(comment.content)) {
        throw new Error('유효하지 않은 댓글 내용입니다.');
      }

      // 기존 댓글 목록 가져오기
      const comments = getComments(articleKey);

      // 답글인 경우 제한 확인
      if (comment.parentId && !CommentValidator.canAddReply(comments, comment.parentId)) {
        throw new Error('답글 개수가 제한을 초과했습니다.');
      }

      // 새 댓글에 고유 ID 부여
      const newComment = {
        ...comment,
        id: generateCommentId()
      };

      // 댓글 목록에 추가
      comments.push(newComment);

      try {
        // 로컬 스토리지에 저장
        localStorage.setItem(storageKey, JSON.stringify(comments));
      } catch (storageError) {
        console.error('로컬 스토리지 저장 오류:', storageError);
        throw new Error('댓글을 저장할 수 없습니다. 브라우저 저장소가 가득 찼거나 접근이 거부되었습니다.');
      }

      // 답글인 경우 부모 댓글에도 추가
      if (comment.parentId) {
        updateRepliesCount(comment.parentId);
      }

      console.log('댓글 저장 성공:', newComment);
      resolve(newComment);
    } catch (error) {
      console.error('댓글 추가 오류:', error);
      reject(error);
    }
  });
};

/**
 * 댓글 삭제
 * @param {string} commentId - 삭제할 댓글 ID
 * @returns {Promise} - 작업 결과 Promise
 */
export const deleteComment = (commentId) => {
  return new Promise((resolve, reject) => {
    try {
      // 모든 기사의 댓글을 검색하여 해당 댓글 및 관련 답글 삭제
      const storageKeys = findAllCommentStorageKeys();
      
      for (const storageKey of storageKeys) {
        const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // 삭제할 댓글 및 관련 답글 필터링
        const newComments = comments.filter(comment => {
          return comment.id !== commentId && comment.parentId !== commentId;
        });
        
        // 변경된 경우에만 저장
        if (comments.length !== newComments.length) {
          localStorage.setItem(storageKey, JSON.stringify(newComments));
        }
      }
      
      resolve(true);
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      reject(error);
    }
  });
};

/**
 * 로컬 스토리지에서 모든 댓글 관련 키 찾기
 * @returns {Array} - 댓글 스토리지 키 목록
 */
const findAllCommentStorageKeys = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(COMMENTS_STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * 고유한 댓글 ID 생성
 * @returns {string} - 고유 ID
 */
const generateCommentId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${COMMENT_ID_PREFIX}${timestamp}_${random}`;
};

/**
 * 답글 수 업데이트 (부모 댓글에 답글 수 저장)
 * @param {string} parentId - 부모 댓글 ID
 */
const updateRepliesCount = (parentId) => {
  const storageKeys = findAllCommentStorageKeys();
  
  for (const storageKey of storageKeys) {
    const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // 부모 댓글 찾기
    const parentIndex = comments.findIndex(comment => comment.id === parentId);
    
    if (parentIndex !== -1) {
      // 답글 수 계산
      const repliesCount = comments.filter(comment => comment.parentId === parentId).length;
      
      // 부모 댓글에 답글 수 업데이트
      comments[parentIndex].repliesCount = repliesCount;
      
      // 저장
      localStorage.setItem(storageKey, JSON.stringify(comments));
      return;
    }
  }
};

/**
 * 특정 기사의 모든 댓글 삭제
 * @param {string} articleKey - 기사 고유 키
 * @returns {Promise} - 작업 결과 Promise
 */
export const clearArticleComments = (articleKey) => {
  return new Promise((resolve, reject) => {
    try {
      const storageKey = getStorageKey(articleKey);
      localStorage.removeItem(storageKey);
      resolve(true);
    } catch (error) {
      console.error('댓글 전체 삭제 오류:', error);
      reject(error);
    }
  });
};

/**
 * 댓글 ID로 해당 댓글이 속한 기사 키 찾기
 * @param {string} commentId - 댓글 ID
 * @returns {Promise<string|null>} - 기사 키 또는 null
 */
export const findArticleKeyByCommentId = async (commentId) => {
  try {
    const storageKeys = findAllCommentStorageKeys();
    
    for (const storageKey of storageKeys) {
      const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // 해당 댓글 ID를 찾기
      const foundComment = comments.find(comment => comment.id === commentId);
      
      if (foundComment) {
        // 스토리지 키에서 접두사 제거하여 기사 키 반환
        return storageKey.replace(COMMENTS_STORAGE_KEY_PREFIX, '');
      }
    }
    
    return null;
  } catch (error) {
    console.error('댓글 기사 키 찾기 오류:', error);
    return null;
  }
};

export default {
  getComments,
  addComment,
  deleteComment,
  clearArticleComments,
  findArticleKeyByCommentId
}; 