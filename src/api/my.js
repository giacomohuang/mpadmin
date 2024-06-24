import fetch from './fetch'
import baseUrl from './baseUrl'

const my = {
  sendCodeByEmail(email) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { email: email },
      url: '/my/sendcodebyemail'
    })
  },
  updateEmail(verifycode, email) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { verifycode: verifycode, email: email },
      url: '/my/updateemail'
    })
  },
  sendCodeBySMS(areacode, phone) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { areacode: areacode, phone: phone },
      url: '/my/sendcodebysms'
    })
  },
  updatePhone(verifycode, areacode, phone) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { verifycode: verifycode, areacode: areacode, phone: phone },
      url: '/my/updatephone'
    })
  },
  getAuthInfo() {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      url: '/my/getauthinfo'
    })
  }
}

export default my
