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
  updatePassword(oldPassword, newPassword) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { oldPassword, newPassword },
      url: '/my/updatepassword'
    })
  },
  updateEmail(verifycode, email) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { verifycode, email },
      url: '/my/updateemail'
    })
  },
  sendCodeBySMS(areacode, phone) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { areacode, phone },
      url: '/my/sendcodebysms'
    })
  },
  updatePhone(verifycode, areacode, phone) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { verifycode, areacode, phone },
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
