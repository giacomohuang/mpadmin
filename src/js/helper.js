const helper = {
  getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) {
      return unescape(r[2])
    }
    return null
  },
  deepCopyJson(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  sortJSON(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const sortedObj = {}
    Object.entries(obj)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([key, value]) => {
        sortedObj[key] = sortJSON(value)
      })

    return sortedObj
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

  getToken(data) {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    return {
      accessToken,
      refreshToken
    }
  },

  setToken(data) {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  },

  removeToken() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}
export default helper
