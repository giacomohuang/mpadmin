const utils = {
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
  }
}
export default utils
