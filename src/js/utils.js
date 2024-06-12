const utils = {
  deepCopyJson(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  decodeToken(token) {
    let tokenArray = token.split('.')
    if (tokenArray.length != 3) {
      throw Error('invalid token')
    }
    return JSON.parse(atob(encodeURIComponent(tokenArray[1])))
  }
}
export default utils
