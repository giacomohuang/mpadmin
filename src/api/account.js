import fetch from './fetch'

export const account = {
  getPermissions(uid) {
    return fetch({
      method: 'get',
      params: { uid: uid },
      url: '/api/user/getpermissions'
    })
  },
  login(params) {
    return fetch({
      method: 'post',
      data: params,
      url: '/account/login'
    })
  }
}
