/**
 * 댓글 서비스
 * 로컬 스토리지를 사용하여 댓글 데이터를 관리합니다.
 */

// 로컬 스토리지 키 접두사
const COMMENTS_STORAGE_KEY_PREFIX = 'news_comments_';

/**
 * 댓글 목록 가져오기
 * @param {string} articleKey - 기사 고유 키 (category_id 형식)
 * @returns {Array} - 댓글 목록
 */
export const getComments = (articleKey) => {
  try {
    const storageKey = `${COMMENTS_STORAGE_KEY_PREFIX}${articleKey}`;
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
 * @param {string} articleKey - 기사 고유 키 (category_id 형식)
 * @param {Object} comment - 댓글 객체
 * @returns {Promise} - 작업 결과 Promise
 */
export const addComment = (articleKey, comment) => {
  return new Promise((resolve, reject) => {
    try {
      // 기존 댓글 목록 가져오기
      const comments = getComments(articleKey);
      
      // 새 댓글에 고유 ID 부여
      const newComment = {
        ...comment,
        id: generateCommentId()
      };
      
      // 댓글 목록에 추가
      comments.push(newComment);
      
      // 로컬 스토리지에 저장
      const storageKey = `${COMMENTS_STORAGE_KEY_PREFIX}${articleKey}`;
      localStorage.setItem(storageKey, JSON.stringify(comments));
      
      // 답글인 경우 부모 댓글에도 추가
      if (comment.parentId) {
        updateRepliesCount(comment.parentId);
      }
      
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
  return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      const storageKey = `${COMMENTS_STORAGE_KEY_PREFIX}${articleKey}`;
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