import fetch from './fetch'
import baseUrl from './baseUrl'

const account = {
  getPermissions(uid) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'get',
      params: { uid: uid },
      url: '/user/getpermissions'
    })
  },
  signin(params) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: params,
      url: '/account/signin'
    })
  },
  signout() {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      url: '/account/signout'
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
  verifyToken(token) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: token,
      url: '/account/verifytoken'
    })
  },
  generateTotpSecret(params) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: params,
      url: '/account/generatetotpsecret'
    })
  },
  verifyTotp(token) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: token,
      url: '/account/verifytotp'
    })
  },
  updateTotpSecret(totpSecret) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: totpSecret,
      url: '/account/updatetotpsecret'
    })
  }
}
export default account
