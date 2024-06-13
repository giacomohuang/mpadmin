const helper = {
  deepCopyJson(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  decodeToken(type = 'access') {
    let token, tokenArray, result

    if (type === 'refresh') {
      token = localStorage.getItem('refreshToken')
    } else {
      token = localStorage.getItem('accessToken')
    }
    if (!token) return
    tokenArray = token.split('.')
    if (tokenArray.length != 3) {
      throw Error('invalid token')
    }
    return JSON.parse(atob(encodeURIComponent(tokenArray[1])))
  },

  setJWT(data) {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  },

  removeJWT() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}
export default helper
