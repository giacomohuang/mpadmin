import fetch from './fetch'
import baseUrl from './baseUrl'

const account = {
  getPermissions(uid) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'get',
      params: { uid: uid },
      url: '/api/user/getpermissions'
    })
  },
  login(params) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: params,
      url: '/account/login'
    })
  },
  hello() {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: {},
      url: '/account/hello'
    })
  },
  refreshToken(token) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { token: token },
      url: '/account/refreshtoken'
    })
  }
}
export default account
