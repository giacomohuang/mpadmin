import fetch from './fetch'
import baseUrl from './baseUrl'

const my = {
  sendCodeByEmail(accountid) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { accountid: accountid },
      url: '/api/my/sendcodebyemail'
    })
  },
  verifyCodeByEmail(accountid, code) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { accounid: accountid, code: code },
      url: '/api/my/verifycodebyemail'
    })
  }
}

export default my
