import fetch from './fetch'

export const approvalAPI = {
  get(id) {
    return fetch({
      params: { id: id },
      url: '/api/approval/get',
      method: 'get'
    })
  }
}
