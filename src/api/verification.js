import fetch from './fetch'
import baseUrl from './baseUrl'
const verification = {
  sendSMS(params) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/verification/sendsms',
      method: 'post',
      data: params
    })
  },
  sendEmail(params) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/verification/sendmail',
      method: 'post',
      data: params
    })
  }
}
export default verification
