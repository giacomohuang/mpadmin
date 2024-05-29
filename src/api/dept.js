import fetch from './fetch'

export const deptAPI = {
  get(id) {
    return fetch({
      params: { id: id },
      url: '/api/dept/get',
      method: 'get'
    })
  },
  list(id) {
    return fetch({
      params: { id: id },
      url: '/api/dept/list',
      method: 'get'
    })
  }
}
