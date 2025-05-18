import { 
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js'

// Cognito 설정
const poolData = {
  UserPoolId: 'ap-northeast-2_ADoTJ84dE', // import.meta.env.VITE_COGNITO_USER_POOL_ID
  ClientId: '4skq1u07jmajt1si8p15q8k15a' // import.meta.env.VITE_COGNITO_APP_CLIENT_ID
}

const userPool = new CognitoUserPool(poolData)

/**
 * 회원가입 함수
 * @param {string} username - 사용자 이름(이메일)
 * @param {string} password - 비밀번호
 * @param {string} nickname - 닉네임 (선택)
 * @returns {Promise} - 회원가입 결과 Promise
 */
export const signUp = (username, password, nickname = '') => {
  return new Promise((resolve, reject) => {
    // 속성 목록 생성
    const attributeList = []
    
    // 닉네임 속성 추가 (선택적)
    if (nickname) {
      const nicknameAttribute = new CognitoUserAttribute({
        Name: 'nickname',
        Value: nickname
      })
      attributeList.push(nicknameAttribute)
    }
    
    // 회원가입 요청
    userPool.signUp(
      username, 
      password, 
      attributeList, 
      null, 
      (err, result) => {
        if (err) {
          console.error('회원가입 오류:', err)
          reject(err)
          return
        }
        
        console.log('회원가입 성공:', result)
        resolve(result.user)
      }
    )
  })
}

/**
 * 로그인 함수
 * @param {string} username - 사용자 이름(이메일)
 * @param {string} password - 비밀번호
 * @returns {Promise} - 로그인 결과 Promise
 */
export const signIn = (username, password) => {
  return new Promise((resolve, reject) => {
    // 인증 데이터 생성
    const authenticationData = {
      Username: username,
      Password: password
    }
    
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    
    // 사용자 객체 생성
    const userData = {
      Username: username,
      Pool: userPool
    }
    
    const cognitoUser = new CognitoUser(userData)
    
    // 로그인 요청
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        console.log('로그인 성공:', session)
        resolve(session)
      },
      onFailure: (err) => {
        console.error('로그인 오류:', err)
        reject(err)
      }
    })
  })
}

/**
 * 로그아웃 함수
 */
export const signOut = () => {
  const currentUser = userPool.getCurrentUser()
  if (currentUser) {
    currentUser.signOut()
    console.log('로그아웃 되었습니다')
    return true
  }
  return false
}

/**
 * 현재 사용자 확인
 * @returns {Promise} - 현재 사용자 정보 Promise
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const currentUser = userPool.getCurrentUser()
    
    if (!currentUser) {
      resolve(null)
      return
    }
    
    currentUser.getSession((err, session) => {
      if (err) {
        reject(err)
        return
      }
      
      if (!session.isValid()) {
        resolve(null)
        return
      }
      
      // 사용자 속성 가져오기
      currentUser.getUserAttributes((err, attributes) => {
        if (err) {
          resolve({
            username: currentUser.getUsername(),
            email: currentUser.getUsername(),
            isAuthenticated: true
          })
          return
        }
        
        // 속성 매핑
        const userData = {
          username: currentUser.getUsername(),
          email: currentUser.getUsername(),
          isAuthenticated: true
        }
        
        if (attributes) {
          attributes.forEach(attr => {
            userData[attr.Name] = attr.Value
          })
        }
        
        resolve(userData)
      })
    })
  })
}

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  userPool
} 