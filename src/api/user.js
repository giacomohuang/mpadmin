import fetch from './fetch'

export const user = {
  getPermissions(uid) {
    return fetch({
      params: { uid: uid },
      url: '/api/user/getpermissions',
      method: 'get'
    })
  }
}
