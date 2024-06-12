export function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  var r = window.location.search.substr(1).match(reg)
  if (r != null) {
    return unescape(r[2])
  }
  return null
}

export function sortJSON(obj) {
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
}

export function decodeToken(type = 'access') {
  const result = {}
  if (type === 'refresh') {
    token = localStorage.getItem('refreshToken')
  } else {
    token = localStorage.getItem('accessToken')
  }
  tokenArray = token.split('.')
  if (tokenArray.length != 3) {
    throw Error('invalid token')
  }
  result.payload = btoa(encodeURIComponent(tokenArray[1]))
  return result
}
