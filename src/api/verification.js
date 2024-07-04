import fetch from './fetch'
import baseUrl from './baseUrl'
const verification = {
  sendCodeBySMS(areacode, phone) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/verification/sendcodebysms',
      method: 'post',
      data: { areacode, phone }
    })
  },
  sendCodeByEmail(email) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/verification/sendcodebyemail',
      method: 'post',
      data: { email }
    })
  }
}
export default verification
